using InterviewPlatform.Domain.Common;

namespace InterviewPlatform.Domain.Entities;

public class QuizQuestion : BaseEntity
{
    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;
    public string OptionsEn { get; set; } = "[]";
    public string? OptionsVi { get; set; }
    public string? ExplanationEn { get; set; }
    public string? ExplanationVi { get; set; }

    public ICollection<UserQuizAttempt> Attempts { get; set; } = new List<UserQuizAttempt>();
}
