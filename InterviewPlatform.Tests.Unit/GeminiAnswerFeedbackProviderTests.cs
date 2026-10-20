using System.Net;
using System.Text.Json;
using FluentAssertions;
using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace InterviewPlatform.Tests.Unit;

public class GeminiAnswerFeedbackProviderTests
{
    private const string Feedback = """
        {"summary":"Clear start.","strengths":["Correct idea."],"improvements":["Add an example."],
        "englishFeedback":"Use shorter sentences.","sampleAnswer":"A cache stores reusable results.",
        "followUpQuestion":"How would you invalidate it?"}
        """;

    private static IConfiguration Config(string model = "gemini-2.5-flash-lite") => new ConfigurationBuilder()
        .AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["AnswerFeedback:Enabled"] = "true", ["Gemini:ApiKey"] = "fake-test-key", ["Gemini:Model"] = model
        }).Build();

    private static string Envelope(string text = Feedback, string reason = "STOP") => JsonSerializer.Serialize(new
    {
        candidates = new[] { new { finishReason = reason, content = new { parts = new[] { new { text } } } } }
    });

    private sealed class Handler(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> send) : HttpMessageHandler
    {
        public int Calls { get; private set; }
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        { Calls++; return send(request, cancellationToken); }
    }

    [Fact]
    public async Task Sends_one_bounded_English_JSON_request_with_header_key_and_canonical_context()
    {
        using var handler = new Handler(async (request, ct) =>
        {
            request.Method.Should().Be(HttpMethod.Post);
            request.RequestUri!.AbsoluteUri.Should().Be("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent");
            request.RequestUri.Query.Should().BeEmpty();
            request.Headers.GetValues("x-goog-api-key").Should().ContainSingle().Which.Should().Be("fake-test-key");
            using var body = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(ct));
            body.RootElement.GetProperty("systemInstruction").ToString().Should().Contain("Reply entirely in English");
            var generation = body.RootElement.GetProperty("generationConfig");
            generation.GetProperty("responseMimeType").GetString().Should().Be("application/json");
            generation.GetProperty("maxOutputTokens").GetInt32().Should().Be(3000);
            generation.GetProperty("responseJsonSchema").GetProperty("required").GetArrayLength().Should().Be(6);
            using var data = JsonDocument.Parse(body.RootElement.GetProperty("contents")[0].GetProperty("parts")[0].GetProperty("text").GetString()!);
            data.RootElement.GetProperty("question").GetString().Should().Be("What is caching?");
            data.RootElement.GetProperty("referenceAnswer").GetString().Should().Be("Canonical reference");
            data.RootElement.GetProperty("candidateAnswer").GetString().Should().Be("My interview answer");
            return new(HttpStatusCode.OK) { Content = new StringContent(Envelope()) };
        });
        using var http = new HttpClient(handler);
        var provider = new GeminiAnswerFeedbackProvider(http, Config(), NullLogger<GeminiAnswerFeedbackProvider>.Instance);
        var result = await provider.ReviewAsync("What is caching?", "Canonical reference", "My interview answer", default);
        result.Summary.Should().Be("Clear start."); handler.Calls.Should().Be(1);
    }

    [Theory]
    [InlineData(400)] [InlineData(403)] [InlineData(404)] [InlineData(429)] [InlineData(500)]
    public async Task Provider_errors_are_controlled_and_not_retried(int status)
    {
        using var handler = new Handler((_, _) => Task.FromResult(new HttpResponseMessage((HttpStatusCode)status)
        { Content = new StringContent("Sensitive provider details must not be exposed") }));
        using var http = new HttpClient(handler);
        var provider = new GeminiAnswerFeedbackProvider(http, Config(), NullLogger<GeminiAnswerFeedbackProvider>.Instance);
        var act = () => provider.ReviewAsync("Question", "Reference", "Answer", default);
        var error = await act.Should().ThrowAsync<AiUnavailableException>();
        error.Which.Message.Should().NotContain("Sensitive"); handler.Calls.Should().Be(1);
    }

    [Theory]
    [InlineData("MAX_TOKENS", Feedback)] [InlineData("SAFETY", Feedback)] [InlineData("STOP", "not json")]
    public async Task Truncated_blocked_or_malformed_feedback_is_not_returned(string reason, string text)
    {
        using var handler = new Handler((_, _) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
        { Content = new StringContent(Envelope(text, reason)) }));
        using var http = new HttpClient(handler);
        var provider = new GeminiAnswerFeedbackProvider(http, Config(), NullLogger<GeminiAnswerFeedbackProvider>.Instance);
        await ((Func<Task>)(() => provider.ReviewAsync("Question", "Reference", "Answer", default)))
            .Should().ThrowAsync<AiUnavailableException>();
    }

    [Fact]
    public async Task Transport_timeout_becomes_controlled_unavailable()
    {
        using var handler = new Handler((_, _) => throw new TaskCanceledException("Simulated provider timeout"));
        using var http = new HttpClient(handler);
        var provider = new GeminiAnswerFeedbackProvider(http, Config(), NullLogger<GeminiAnswerFeedbackProvider>.Instance);
        await ((Func<Task>)(() => provider.ReviewAsync("Question", "Reference", "Answer", default)))
            .Should().ThrowAsync<AiUnavailableException>();
    }

    [Theory]
    [InlineData("")] [InlineData("https://example.com")] [InlineData("gemini-test?key=bad")]
    public async Task Missing_or_invalid_model_never_sends_a_request(string model)
    {
        using var handler = new Handler((_, _) => throw new InvalidOperationException("Must not send"));
        using var http = new HttpClient(handler);
        var provider = new GeminiAnswerFeedbackProvider(http, Config(model), NullLogger<GeminiAnswerFeedbackProvider>.Instance);
        provider.IsAvailable.Should().BeFalse();
        await ((Func<Task>)(() => provider.ReviewAsync("Question", "Reference", "Answer", default)))
            .Should().ThrowAsync<AiUnavailableException>();
        handler.Calls.Should().Be(0);
    }
}
