using InterviewPlatform.Application.Services;
using FluentAssertions;
using InterviewPlatform.Application.Features.Questions;
using InterviewPlatform.Domain.Entities;
using InterviewPlatform.Domain.Enums;
using InterviewPlatform.Infrastructure.Persistence;

namespace InterviewPlatform.Tests.Unit;

// Guards the difficulty filter — comparing the Difficulty enum directly (the bug
// that used enum.ToString() in a Where threw a 500 on every difficulty filter).
public class GetQuestionsServiceTests
{
    private static void Seed(ApplicationDbContext db)
    {
        db.Questions.AddRange(
            NewQuestion("A", Difficulty.Easy),
            NewQuestion("B", Difficulty.Medium),
            NewQuestion("C", Difficulty.Medium));
        db.SaveChanges();
    }

    private static Question NewQuestion(string title, Difficulty d) => new()
    {
        Id         = Guid.NewGuid(),
        Category   = "DSA",
        TitleEn    = title,
        ContentEn  = "content",
        Difficulty = d,
        Tags       = Array.Empty<string>()
    };

    [Fact]
    public async Task Filters_by_difficulty()
    {
        using var db = TestDb.Create();
        Seed(db);

        var result = await new QuestionsService(db)
            .GetQuestionsAsync(new GetQuestionsRequest(Category: null, Difficulty: "Medium"), default);

        result.Total.Should().Be(2);
        result.Items.Should().HaveCount(2);
    }

    [Fact]
    public async Task No_difficulty_returns_all()
    {
        using var db = TestDb.Create();
        Seed(db);

        var result = await new QuestionsService(db)
            .GetQuestionsAsync(new GetQuestionsRequest(Category: null, Difficulty: null), default);

        result.Total.Should().Be(3);
    }

    [Fact]
    public async Task Unparseable_difficulty_is_ignored()
    {
        using var db = TestDb.Create();
        Seed(db);

        var result = await new QuestionsService(db)
            .GetQuestionsAsync(new GetQuestionsRequest(Category: null, Difficulty: "Nonsense"), default);

        result.Total.Should().Be(3); // invalid value → filter skipped, not an error
    }
}


