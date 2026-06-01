using InterviewPlatform.Domain.Common;
using InterviewPlatform.Domain.Enums;

namespace InterviewPlatform.Domain.Entities;

public class SystemDesignCase : BaseEntity
{
    public string TitleEn { get; set; } = string.Empty;
    public string? TitleVi { get; set; }
    public Difficulty Difficulty { get; set; }

    // ── Reading / study content (Markdown) ───────────────────────────────────
    /// <summary>Short one-line blurb shown on the list card.</summary>
    public string? Summary { get; set; }
    public string? OverviewEn { get; set; }
    public string? RequirementsEn { get; set; }
    public string? RequirementsVi { get; set; }
    public string? HighLevelDesignEn { get; set; }
    public string? DeepDiveEn { get; set; }
    public string? TradeoffsEn { get; set; }
    public string[] Tags { get; set; } = Array.Empty<string>();
    public int? OrderIndex { get; set; }

    // ── Mock-interview fields (reserved for a future practice mode) ───────────
    public string? SolutionDiagramUrl { get; set; }
    public string? Hints { get; set; }
    public string? ScoringRubric { get; set; }
    public bool IsPro { get; set; } = true;

    public ICollection<SystemDesignAttempt> Attempts { get; set; } = new List<SystemDesignAttempt>();
}
