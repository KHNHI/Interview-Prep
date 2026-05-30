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
        if (await _db.Questions.AnyAsync())
        {
            _logger.LogInformation("Questions already seeded — skipping.");
            return;
        }

        var seedDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "SeedData");
        if (!Directory.Exists(seedDir))
        {
            _logger.LogWarning("SeedData directory not found at {Dir}. Skipping seed.", seedDir);
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
                questions.AddRange(dtos.Select(MapToEntity));
                _logger.LogInformation("Loaded {Count} questions from {File}", dtos.Count, Path.GetFileName(file));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse seed file {File}", file);
            }
        }

        if (questions.Count == 0)
        {
            _logger.LogWarning("No questions found in SeedData directory.");
            return;
        }

        _db.Questions.AddRange(questions);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Seeded {Total} questions successfully.", questions.Count);
    }

    private static Question MapToEntity(QuestionSeedDto dto) => new()
    {
        Category    = dto.Category,
        Subcategory = dto.Subcategory,
        TitleEn     = dto.TitleEn,
        TitleVi     = dto.TitleVi,
        ContentEn   = dto.ContentEn,
        ContentVi   = dto.ContentVi,
        Difficulty  = Enum.TryParse<Difficulty>(dto.Difficulty, ignoreCase: true, out var d) ? d : Difficulty.Easy,
        Tags        = dto.Tags ?? Array.Empty<string>(),
        IsPro       = dto.IsPro,
        OrderIndex  = dto.OrderIndex,
        CreatedAt   = DateTime.UtcNow,
        UpdatedAt   = DateTime.UtcNow,
    };

    // ── DTO matching the JSON shape ─────────────────────────────────────────
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
}
