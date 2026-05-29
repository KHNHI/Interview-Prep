using InterviewPlatform.Application.Interfaces;

namespace InterviewPlatform.Infrastructure.Services;

public class QuotaService
{
    private readonly ICacheService _cache;
    private static readonly TimeZoneInfo VietnamTz = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

    private static readonly Dictionary<string, int> Limits = new()
    {
        ["answers"] = 10,
        ["quiz"] = 5
    };

    public QuotaService(ICacheService cache) => _cache = cache;

    public async Task<bool> CheckAndIncrementAsync(string feature, Guid userId)
    {
        if (!Limits.TryGetValue(feature, out var limit)) return true;

        var vnNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, VietnamTz);
        var midnight = vnNow.Date.AddDays(1);
        var ttl = midnight - vnNow;

        var key = $"quota:{feature}:{userId}:{vnNow:yyyy-MM-dd}";
        var count = await _cache.IncrementAsync(key, ttl);
        return count <= limit;
    }
}
