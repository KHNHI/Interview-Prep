using InterviewPlatform.Domain.Enums;

namespace InterviewPlatform.Domain.Entities;

public class UserProgress
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;
    public ProgressStatus Status { get; set; } = ProgressStatus.NotStarted;
    public DateTime? ViewedAt { get; set; }
}
