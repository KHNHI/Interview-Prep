using InterviewPlatform.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Features.SystemDesign.Queries.GetSystemDesignCases;

public class GetSystemDesignCasesQueryHandler
    : IRequestHandler<GetSystemDesignCasesQuery, List<SystemDesignCaseListDto>>
{
    private readonly IApplicationDbContext _db;

    public GetSystemDesignCasesQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<SystemDesignCaseListDto>> Handle(
        GetSystemDesignCasesQuery request, CancellationToken ct)
    {
        var query = _db.SystemDesignCases.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Difficulty))
            query = query.Where(c => c.Difficulty.ToString().ToLower() == request.Difficulty.ToLower());

        return await query
            .OrderBy(c => c.OrderIndex)
            .ThenBy(c => c.TitleEn)
            .Select(c => new SystemDesignCaseListDto(
                c.Id,
                c.TitleEn,
                c.Difficulty.ToString(),
                c.Summary,
                c.Tags,
                c.IsPro
            ))
            .ToListAsync(ct);
    }
}
