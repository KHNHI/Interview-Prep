using System.Text.Json;
using FluentAssertions;
using FluentValidation;
using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Features.Questions;
using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Application.Services;
using InterviewPlatform.Domain.Entities;
using InterviewPlatform.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using StackExchange.Redis;

namespace InterviewPlatform.Tests.Unit;

public class AnswerFeedbackTests
{
    private static readonly AnswerFeedback Feedback = new("Clear start.", ["Correct idea."], ["Add an example."],
        "Use shorter sentences.", "A cache stores reusable results.", "How would you invalidate it?");

    [Theory]
    [InlineData(0)] [InlineData(29)] [InlineData(4001)]
    public async Task Invalid_length_never_calls_usage_or_provider(int length)
    {
        using var db = TestDb.Create();
        var provider = new Mock<IAnswerFeedbackProvider>(MockBehavior.Strict);
        var usage = new Mock<IAnswerFeedbackUsage>(MockBehavior.Strict);
        var service = new AnswerFeedbackService(db, provider.Object, usage.Object);
        await ((Func<Task>)(() => service.ReviewAsync(Guid.NewGuid(), Guid.NewGuid(), new(new string('a', length)), default)))
            .Should().ThrowAsync<ValidationException>();
        provider.VerifyNoOtherCalls(); usage.VerifyNoOtherCalls();
    }

    [Theory]
    [InlineData("unverified")] [InlineData("missing-question")] [InlineData("disabled")] [InlineData("quota")] [InlineData("unavailable")] [InlineData("success")]
    public async Task Review_checks_account_question_and_budget_before_provider(string scenario)
    {
        using var db = TestDb.Create();
        var user = new User { Id = Guid.NewGuid(), Email = "test@example.com", IsEmailVerified = scenario != "unverified" };
        var question = new Question { Id = Guid.NewGuid(), TitleEn = "What is caching?", ContentEn = "Canonical reference." };
        db.Users.Add(user); db.Questions.Add(question); await db.SaveChangesAsync();
        var provider = new Mock<IAnswerFeedbackProvider>();
        provider.SetupGet(x => x.IsAvailable).Returns(scenario != "disabled");
        var usage = new Mock<IAnswerFeedbackUsage>();
        usage.Setup(x => x.ReserveAsync(user.Id, default)).Returns(Task.CompletedTask);
        if (scenario == "quota") usage.Setup(x => x.ReserveAsync(user.Id, default)).ThrowsAsync(new QuotaExceededException("AI feedback"));
        const string answer = "A cache stores results so future requests can reuse them.";
        var review = provider.Setup(x => x.ReviewAsync(question.TitleEn, question.ContentEn, answer, default));
        if (scenario == "unavailable") review.ThrowsAsync(new AiUnavailableException());
        else review.ReturnsAsync(Feedback);
        var service = new AnswerFeedbackService(db, provider.Object, usage.Object);
        Func<Task<AnswerFeedback>> act = () => service.ReviewAsync(scenario == "missing-question" ? Guid.NewGuid() : question.Id,
            user.Id, new("  " + answer + "  "), default);
        switch (scenario)
        {
            case "unverified": await act.Should().ThrowAsync<UnauthorizedException>(); break;
            case "missing-question": await act.Should().ThrowAsync<NotFoundException>(); break;
            case "disabled": case "unavailable": await act.Should().ThrowAsync<AiUnavailableException>(); break;
            case "quota": await act.Should().ThrowAsync<QuotaExceededException>(); break;
            default: (await act()).Should().Be(Feedback); break;
        }
        usage.Verify(x => x.ReserveAsync(user.Id, default), scenario is "quota" or "unavailable" or "success" ? Times.Once() : Times.Never());
        provider.Verify(x => x.ReviewAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), default),
            scenario is "success" or "unavailable" ? Times.Once() : Times.Never());
    }

    [Fact]
    public void Provider_accepts_valid_bounded_JSON()
    {
        var json = JsonSerializer.Serialize(Feedback, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        GeminiAnswerFeedbackProvider.ParseFeedback(json).Should().BeEquivalentTo(Feedback);
    }

    [Theory]
    [InlineData("not json")] [InlineData("{}")] [InlineData("null")]
    [InlineData("{\"summary\":\"hello\",\"unexpected\":true}")]
    public void Provider_rejects_malformed_or_incomplete_output(string text) =>
        ((Action)(() => GeminiAnswerFeedbackProvider.ParseFeedback(text))).Should().Throw<JsonException>();

    [Fact]
    public void Provider_rejects_oversized_fields()
    {
        var json = JsonSerializer.Serialize(Feedback with { SampleAnswer = new string('a', 2501) },
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        ((Action)(() => GeminiAnswerFeedbackProvider.ParseFeedback(json))).Should().Throw<JsonException>();
    }

    [Fact]
    public void Missing_configuration_disables_provider_without_a_network_call()
    {
        var provider = new GeminiAnswerFeedbackProvider(new HttpClient(), new ConfigurationBuilder().Build(), NullLogger<GeminiAnswerFeedbackProvider>.Instance);
        provider.IsAvailable.Should().BeFalse();
    }

    [Theory]
    [InlineData(null, 5)] [InlineData("invalid", 5)] [InlineData("-1", 1)] [InlineData("100", 20)] [InlineData("10", 10)]
    public void User_budget_is_bounded(string? value, int expected) => AnswerFeedbackUsage.ReadLimit(value, 5, 20).Should().Be(expected);

    [Theory]
    [InlineData(0)] [InlineData(1)] [InlineData(2)]
    public async Task Usage_applies_both_budgets_in_one_atomic_script(int result)
    {
        var database = new Mock<IDatabase>();
        database.Setup(x => x.ScriptEvaluateAsync(It.IsAny<string>(), It.IsAny<RedisKey[]>(), It.IsAny<RedisValue[]>(), CommandFlags.None))
            .ReturnsAsync(RedisResult.Create(result));
        var redis = new Mock<IConnectionMultiplexer>();
        redis.Setup(x => x.GetDatabase(-1, null)).Returns(database.Object);
        var usage = new AnswerFeedbackUsage(redis.Object, new ConfigurationBuilder().Build(), NullLogger<AnswerFeedbackUsage>.Instance);
        Func<Task> reserve = () => usage.ReserveAsync(Guid.NewGuid(), default);
        if (result == 0) await reserve.Should().NotThrowAsync();
        else await reserve.Should().ThrowAsync<QuotaExceededException>();
        database.Verify(x => x.ScriptEvaluateAsync(It.Is<string>(s => s.Contains("INCR") && s.Contains("EXPIRE")),
            It.Is<RedisKey[]>(keys => keys.Length == 2 && keys.All(k => k.ToString().Contains("{answer-feedback}"))),
            It.Is<RedisValue[]>(values => (int)values[0] == 5 && (int)values[1] == 30 && (int)values[2] > 0), CommandFlags.None), Times.Once);
    }

    [Fact]
    public async Task Redis_failure_fails_closed()
    {
        var redis = new Mock<IConnectionMultiplexer>();
        redis.Setup(x => x.GetDatabase(-1, null)).Throws(new RedisConnectionException(ConnectionFailureType.UnableToConnect, "test"));
        var usage = new AnswerFeedbackUsage(redis.Object, new ConfigurationBuilder().Build(), NullLogger<AnswerFeedbackUsage>.Instance);
        await ((Func<Task>)(() => usage.ReserveAsync(Guid.NewGuid(), default))).Should().ThrowAsync<AiUnavailableException>();
    }
}
