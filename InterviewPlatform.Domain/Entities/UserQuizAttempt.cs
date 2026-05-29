using InterviewPlatform.Domain.Common;

namespace InterviewPlatform.Domain.Entities;

public class UserQuizAttempt : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid QuizQuestionId { get; set; }
    public QuizQuestion QuizQuestion { get; set; } = null!;
    public bool IsCorrect { get; set; }
    public int TimeTakenMs { get; set; }
    public float EaseFactor { get; set; } = 2.5f;
    public int IntervalDays { get; set; } = 1;
    public int Repetitions { get; set; }
    public DateTime? NextReviewAt { get; set; }
    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
}
