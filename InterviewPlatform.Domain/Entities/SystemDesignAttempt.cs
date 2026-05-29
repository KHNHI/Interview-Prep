using InterviewPlatform.Domain.Common;

namespace InterviewPlatform.Domain.Entities;

public class SystemDesignAttempt : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid CaseId { get; set; }
    public SystemDesignCase Case { get; set; } = null!;
    public string? SolutionText { get; set; }
    public string? AiFeedback { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
