using System.Text.Json;
using FluentAssertions;
using InterviewPlatform.Domain.Entities;
using InterviewPlatform.Domain.Enums;
using InterviewPlatform.Infrastructure.Persistence;
using Microsoft.Extensions.Logging.Abstractions;

namespace InterviewPlatform.Tests.Unit;

public class QuestionSeederTests
{
    private static string SeedDirectory => Path.Combine(AppContext.BaseDirectory, "TestSeedData");

    [Fact]
    public async Task Fresh_database_receives_112_valid_questions()
    {
        using var db = TestDb.Create();
        var seeder = new DataSeeder(db, NullLogger<DataSeeder>.Instance);

        await seeder.SeedQuestionsAsync(SeedDirectory);

        var questions = db.Questions.ToList();
        questions.Should().HaveCount(112);
        questions.Select(q => (q.Category, q.TitleEn)).Should().OnlyHaveUniqueItems();
        questions.Should().OnlyContain(q => !string.IsNullOrWhiteSpace(q.ContentEn)
            && !string.IsNullOrWhiteSpace(q.TitleEn) && q.Tags.Length > 0
            && Enum.IsDefined(q.Difficulty));
        questions.GroupBy(q => q.Category).Should().HaveCount(5);
    }

    [Fact]
    public async Task Existing_database_keeps_original_question_and_adds_only_missing_entries()
    {
        using var db = TestDb.Create();
        var existing = new Question
        {
            Category = "DSA", TitleEn = "What is Big O notation and why does it matter?",
            ContentEn = "Locally edited answer", Difficulty = Difficulty.Easy,
        };
        db.Questions.Add(existing);
        await db.SaveChangesAsync();
        var id = existing.Id;
        var seeder = new DataSeeder(db, NullLogger<DataSeeder>.Instance);

        await seeder.SeedQuestionsAsync(SeedDirectory);
        await seeder.SeedQuestionsAsync(SeedDirectory);

        db.Questions.Should().HaveCount(112);
        db.Questions.Single(q => q.Id == id).ContentEn.Should().Be("Locally edited answer");
    }

    [Fact]
    public void Expansion_contains_70_structured_free_questions_without_duplicate_titles()
    {
        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(SeedDirectory, "questions-expansion.json")));
        var rows = document.RootElement.EnumerateArray().ToArray();
        rows.Should().HaveCount(70);
        rows.Select(r => r.GetProperty("titleEn").GetString()).Should().OnlyHaveUniqueItems();
        foreach (var row in rows)
        {
            row.GetProperty("isPro").GetBoolean().Should().BeFalse();
            var content = row.GetProperty("contentEn").GetString()!;
            content.Should().Contain("## Short Answer").And.Contain("## Example").And.Contain("## Interview Pitfall");
        }
    }
}
