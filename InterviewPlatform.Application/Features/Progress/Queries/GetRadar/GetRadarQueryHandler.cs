using InterviewPlatform.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Features.Progress.Queries.GetRadar;

public class GetRadarQueryHandler : IRequestHandler<GetRadarQuery, IReadOnlyList<RadarItemDto>>
{
    private readonly IApplicationDbContext _db;

    public GetRadarQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<RadarItemDto>> Handle(GetRadarQuery request, CancellationToken ct)
    {
        var categories = new[] { "DSA", "Networking", "DB", "OS", "Cloud" };

        var grouped = await _db.UserQuizAttempts
            .Where(a => a.UserId == request.UserId)
            .Join(_db.QuizQuestions,
                  a => a.QuizQuestionId,
                  q => q.Id,
                  (a, q) => new { q.Category, a.IsCorrect })
            .GroupBy(x => x.Category)
            .Select(g => new
            {
                Category = g.Key,
                Total    = g.Count(),
                Correct  = g.Count(x => x.IsCorrect)
            })
            .ToListAsync(ct);

        var scoreMap = grouped.ToDictionary(
            x => x.Category,
            x => Math.Round((double)x.Correct / x.Total, 4)
        );

        return categories
            .Select(c => new RadarItemDto(c, scoreMap.GetValueOrDefault(c, 0.0)))
            .ToList();
    }
}
