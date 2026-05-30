using InterviewPlatform.Domain.Common;
using InterviewPlatform.Domain.Enums;

namespace InterviewPlatform.Domain.Entities;

public class QuizQuestion : BaseEntity
{
    // Optional link to a Q&A bank question — null for standalone MCQ
    public Guid? QuestionId { get; set; }
    public Question? Question { get; set; }

    // Standalone question content
    public string Category { get; set; } = string.Empty;
    public Difficulty Difficulty { get; set; }
    public string TitleEn { get; set; } = string.Empty;
    public string? TitleVi { get; set; }
    public string? ContextEn { get; set; }
    public string? CodeSnippet { get; set; }

    // MCQ data — OptionsEn is a JSON array: [{id,label,desc}]
    public string OptionsEn { get; set; } = "[]";
    public string? OptionsVi { get; set; }
    public string CorrectOptionId { get; set; } = string.Empty;
    public string ExplanationEn { get; set; } = string.Empty;
    public string? ExplanationVi { get; set; }

    public bool IsPro { get; set; }
    public int? OrderIndex { get; set; }

    public ICollection<UserQuizAttempt> Attempts { get; set; } = new List<UserQuizAttempt>();
}
