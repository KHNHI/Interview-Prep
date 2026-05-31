using InterviewPlatform.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Features.Progress.Queries.GetDashboard;

public class GetDashboardQueryHandler : IRequestHandler<GetDashboardQuery, DashboardDto>
{
    private readonly IApplicationDbContext _db;

    public GetDashboardQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<DashboardDto> Handle(GetDashboardQuery request, CancellationToken ct)
    {
        var attempts = await _db.UserQuizAttempts
            .Where(a => a.UserId == request.UserId)
            .Select(a => new { a.IsCorrect, Date = a.AttemptedAt.Date })
            .ToListAsync(ct);

        if (attempts.Count == 0)
            return new DashboardDto(0, 0, 0.0, 0, Array.Empty<HeatmapEntryDto>());

        var total      = attempts.Count;
        var correct    = attempts.Count(a => a.IsCorrect);
        var correctRate = Math.Round((double)correct / total, 4);

        var dateGroups = attempts
            .GroupBy(a => a.Date)
            .ToDictionary(g => g.Key, g => g.Count());

        var quizzesTaken = dateGroups.Count;

        // Streak: consecutive days going back from today (or yesterday if no activity today)
        var today = DateTime.UtcNow.Date;
        var start = dateGroups.ContainsKey(today) ? today : today.AddDays(-1);
        var streak = 0;
        var d = start;
        while (dateGroups.ContainsKey(d))
        {
            streak++;
            d = d.AddDays(-1);
        }

        // Heatmap: last 365 days (sparse — only dates with activity)
        var cutoff  = today.AddDays(-364);
        var heatmap = dateGroups
            .Where(kv => kv.Key >= cutoff)
            .Select(kv => new HeatmapEntryDto(kv.Key.ToString("yyyy-MM-dd"), kv.Value))
            .OrderBy(e => e.Date)
            .ToList();

        return new DashboardDto(total, quizzesTaken, correctRate, streak, heatmap);
    }
}
