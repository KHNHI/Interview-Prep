using InterviewPlatform.Domain.Common;
using InterviewPlatform.Domain.Enums;

namespace InterviewPlatform.Domain.Entities;

public class Subscription : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public PlanTier Plan { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? StripeSubscriptionId { get; set; }
    public DateTime? CurrentPeriodStart { get; set; }
    public DateTime? CurrentPeriodEnd { get; set; }
    public bool CancelAtPeriodEnd { get; set; }
}
