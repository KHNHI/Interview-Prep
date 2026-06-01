using System.Text.Json;
using System.Text.Json.Serialization;
using InterviewPlatform.Domain.Entities;
using InterviewPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InterviewPlatform.Infrastructure.Persistence;

public class DataSeeder
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<DataSeeder> _logger;

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    public DataSeeder(ApplicationDbContext db, ILogger<DataSeeder> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        var seedDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "SeedData");
        if (!Directory.Exists(seedDir))
        {
            _logger.LogWarning("SeedData directory not found at {Dir}. Skipping seed.", seedDir);
            return;
        }

        await SeedQuestionsAsync(seedDir);
        await SeedQuizQuestionsAsync(seedDir);
        await SeedSystemDesignAsync(seedDir);
    }

    // ── Q&A bank ────────────────────────────────────────────────────────────

    private async Task SeedQuestionsAsync(string seedDir)
    {
        if (await _db.Questions.AnyAsync())
        {
            _logger.LogInformation("Q&A questions already seeded — skipping.");
            return;
        }

        var questions = new List<Question>();
        foreach (var file in Directory.GetFiles(seedDir, "questions-*.json").OrderBy(f => f))
        {
            try
            {
                var json = await File.ReadAllTextAsync(file);
                var dtos = JsonSerializer.Deserialize<List<QuestionSeedDto>>(json, JsonOpts);
                if (dtos is null) continue;
                questions.AddRange(dtos.Select(MapQuestion));
                _logger.LogInformation("Loaded {Count} questions from {File}", dtos.Count, Path.GetFileName(file));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse seed file {File}", file);
            }
        }

        if (questions.Count == 0) { _logger.LogWarning("No Q&A questions found."); return; }

        _db.Questions.AddRange(questions);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Seeded {Total} Q&A questions.", questions.Count);
    }

    // ── Quiz MCQ bank ────────────────────────────────────────────────────────

    private async Task SeedQuizQuestionsAsync(string seedDir)
    {
        if (await _db.QuizQuestions.AnyAsync())
        {
            _logger.LogInformation("Quiz questions already seeded — skipping.");
            return;
        }

        var filePath = Path.Combine(seedDir, "quiz-questions.json");
        if (!File.Exists(filePath))
        {
            _logger.LogWarning("quiz-questions.json not found — skipping.");
            return;
        }

        try
        {
            var json = await File.ReadAllTextAsync(filePath);
            var dtos = JsonSerializer.Deserialize<List<QuizQuestionSeedDto>>(json, JsonOpts);
            if (dtos is null || dtos.Count == 0) return;

            var entities = dtos.Select(MapQuizQuestion).ToList();
            _db.QuizQuestions.AddRange(entities);
            await _db.SaveChangesAsync();
            _logger.LogInformation("Seeded {Total} quiz questions.", entities.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to seed quiz-questions.json");
        }
    }

    // ── System Design cases ──────────────────────────────────────────────────

    private async Task SeedSystemDesignAsync(string seedDir)
    {
        if (await _db.SystemDesignCases.AnyAsync())
        {
            _logger.LogInformation("System design cases already seeded — skipping.");
            return;
        }

        var filePath = Path.Combine(seedDir, "system-design-cases.json");
        if (!File.Exists(filePath))
        {
            _logger.LogWarning("system-design-cases.json not found — skipping.");
            return;
        }

        try
        {
            var json = await File.ReadAllTextAsync(filePath);
            var dtos = JsonSerializer.Deserialize<List<SystemDesignSeedDto>>(json, JsonOpts);
            if (dtos is null || dtos.Count == 0) return;

            var entities = dtos.Select(MapSystemDesign).ToList();
            _db.SystemDesignCases.AddRange(entities);
            await _db.SaveChangesAsync();
            _logger.LogInformation("Seeded {Total} system design cases.", entities.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to seed system-design-cases.json");
        }
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private static Question MapQuestion(QuestionSeedDto dto) => new()
    {
        Category    = dto.Category,
        Subcategory = dto.Subcategory,
        TitleEn     = dto.TitleEn,
        TitleVi     = dto.TitleVi,
        ContentEn   = dto.ContentEn,
        ContentVi   = dto.ContentVi,
        Difficulty  = ParseDifficulty(dto.Difficulty),
        Tags        = dto.Tags ?? Array.Empty<string>(),
        IsPro       = dto.IsPro,
        OrderIndex  = dto.OrderIndex,
        CreatedAt   = DateTime.UtcNow,
        UpdatedAt   = DateTime.UtcNow,
    };

    private static QuizQuestion MapQuizQuestion(QuizQuestionSeedDto dto) => new()
    {
        Category        = dto.Category,
        Difficulty      = ParseDifficulty(dto.Difficulty),
        TitleEn         = dto.TitleEn,
        ContextEn       = dto.ContextEn,
        CodeSnippet     = dto.CodeSnippet,
        OptionsEn       = JsonSerializer.Serialize(dto.Options),
        CorrectOptionId = dto.Correct,
        ExplanationEn   = dto.ExplanationEn,
        IsPro           = dto.IsPro,
        CreatedAt       = DateTime.UtcNow,
        UpdatedAt       = DateTime.UtcNow,
    };

    private static SystemDesignCase MapSystemDesign(SystemDesignSeedDto dto) => new()
    {
        TitleEn           = dto.TitleEn,
        Difficulty        = ParseDifficulty(dto.Difficulty),
        Summary           = dto.Summary,
        Tags              = dto.Tags ?? Array.Empty<string>(),
        IsPro             = dto.IsPro,
        OrderIndex        = dto.OrderIndex,
        OverviewEn        = dto.OverviewEn,
        RequirementsEn    = dto.RequirementsEn,
        HighLevelDesignEn = dto.HighLevelDesignEn,
        DeepDiveEn        = dto.DeepDiveEn,
        TradeoffsEn       = dto.TradeoffsEn,
        Hints             = dto.Hints,
        CreatedAt         = DateTime.UtcNow,
        UpdatedAt         = DateTime.UtcNow,
    };

    private static Difficulty ParseDifficulty(string s) =>
        Enum.TryParse<Difficulty>(s, ignoreCase: true, out var d) ? d : Difficulty.Easy;

    // ── Seed DTOs ─────────────────────────────────────────────────────────────

    private record QuestionSeedDto(
        string Category,
        string? Subcategory,
        string TitleEn,
        string? TitleVi,
        string ContentEn,
        string? ContentVi,
        string Difficulty,
        string[]? Tags,
        bool IsPro,
        int? OrderIndex
    );

    private record QuizQuestionSeedDto(
        string Category,
        string Difficulty,
        string TitleEn,
        string? ContextEn,
        string? CodeSnippet,
        QuizOptionSeedDto[] Options,
        string Correct,
        string ExplanationEn,
        bool IsPro
    );

    private record QuizOptionSeedDto(string Id, string Label, string Desc);

    private record SystemDesignSeedDto(
        string TitleEn,
        string Difficulty,
        string? Summary,
        string[]? Tags,
        bool IsPro,
        int? OrderIndex,
        string? OverviewEn,
        string? RequirementsEn,
        string? HighLevelDesignEn,
        string? DeepDiveEn,
        string? TradeoffsEn,
        string? Hints
    );
}
