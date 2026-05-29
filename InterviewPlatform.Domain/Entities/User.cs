using InterviewPlatform.Domain.Common;
using InterviewPlatform.Domain.Enums;

namespace InterviewPlatform.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public string Provider { get; set; } = "local";
    public string Locale { get; set; } = "en";
    public PlanTier PlanTier { get; set; } = PlanTier.Free;
    public DateTime? PlanExpiresAt { get; set; }
    public string? StripeCustomerId { get; set; }

    public ICollection<UserProgress> Progress { get; set; } = new List<UserProgress>();
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}
