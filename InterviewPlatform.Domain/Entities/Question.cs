using InterviewPlatform.Domain.Common;
using InterviewPlatform.Domain.Enums;

namespace InterviewPlatform.Domain.Entities;

public class Question : BaseEntity
{
    public string Category { get; set; } = string.Empty;
    public string? Subcategory { get; set; }
    public string TitleEn { get; set; } = string.Empty;
    public string? TitleVi { get; set; }
    public string ContentEn { get; set; } = string.Empty;
    public string? ContentVi { get; set; }
    public Difficulty Difficulty { get; set; }
    public string[] Tags { get; set; } = Array.Empty<string>();
    public bool IsPro { get; set; }
    public int? OrderIndex { get; set; }

    public QuizQuestion? QuizQuestion { get; set; }
    public ICollection<UserProgress> UserProgress { get; set; } = new List<UserProgress>();
}
