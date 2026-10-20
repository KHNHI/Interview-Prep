using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace InterviewPlatform.Infrastructure.Services;

public class AnswerFeedbackUsage(IConnectionMultiplexer redis, IConfiguration config, ILogger<AnswerFeedbackUsage> logger)
    : IAnswerFeedbackUsage
{
    public int DailyUserLimit => ReadLimit(config["AnswerFeedback:DailyUserLimit"], 5, 20);
    private int DailyGlobalLimit => ReadLimit(config["AnswerFeedback:DailyGlobalLimit"], 30, 1000);

    // Check both budgets before incrementing either; expiry is part of the same
    // atomic operation. Hash tags keep the keys in one Redis Cluster slot.
    private const string ReserveScript = """
        local user = tonumber(redis.call('GET', KEYS[1]) or '0')
        local total = tonumber(redis.call('GET', KEYS[2]) or '0')
        if user >= tonumber(ARGV[1]) then return 1 end
        if total >= tonumber(ARGV[2]) then return 2 end
        redis.call('INCR', KEYS[1])
        redis.call('INCR', KEYS[2])
        redis.call('EXPIRE', KEYS[1], ARGV[3])
        redis.call('EXPIRE', KEYS[2], ARGV[3])
        return 0
        """;

    internal static int ReadLimit(string? value, int fallback, int maximum) =>
        int.TryParse(value, out var limit) ? Math.Clamp(limit, 1, maximum) : fallback;

    public async Task ReserveAsync(Guid userId, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        var now = DateTime.UtcNow;
        var day = now.ToString("yyyy-MM-dd");
        var seconds = Math.Max(1, (int)Math.Ceiling((now.Date.AddDays(1) - now).TotalSeconds));
        try
        {
            var result = (int)await redis.GetDatabase().ScriptEvaluateAsync(ReserveScript,
                [$"ai:{{answer-feedback}}:{day}:user:{userId}", $"ai:{{answer-feedback}}:{day}:global"],
                [DailyUserLimit, DailyGlobalLimit, seconds]).WaitAsync(ct);
            if (result == 1) throw new QuotaExceededException("AI feedback. Please try again after 00:00 UTC");
            if (result == 2) throw new QuotaExceededException("AI feedback across the app. Please try again after 00:00 UTC");
        }
        catch (RedisException)
        {
            logger.LogWarning("AI feedback usage store is unavailable; skipping provider call.");
            throw new AiUnavailableException();
        }
    }
}
