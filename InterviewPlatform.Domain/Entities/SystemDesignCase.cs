using InterviewPlatform.Domain.Common;
using InterviewPlatform.Domain.Enums;

namespace InterviewPlatform.Domain.Entities;

public class SystemDesignCase : BaseEntity
{
    public string TitleEn { get; set; } = string.Empty;
    public string? TitleVi { get; set; }
    public Difficulty Difficulty { get; set; }
    public string? RequirementsEn { get; set; }
    public string? RequirementsVi { get; set; }
    public string? SolutionDiagramUrl { get; set; }
    public string? Hints { get; set; }
    public string? ScoringRubric { get; set; }
    public bool IsPro { get; set; } = true;

    public ICollection<SystemDesignAttempt> Attempts { get; set; } = new List<SystemDesignAttempt>();
}
