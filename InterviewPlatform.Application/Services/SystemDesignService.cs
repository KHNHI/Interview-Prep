using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Features.SystemDesign;
using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Domain.Entities;
using InterviewPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Services;

public class SystemDesignService : ISystemDesignService
{
    private readonly IApplicationDbContext _db;
    public SystemDesignService(IApplicationDbContext db) => _db = db;

    public async Task<List<SystemDesignCaseListDto>> GetSystemDesignCasesAsync(
        GetSystemDesignCasesRequest request, CancellationToken ct)
    {
        var query = _db.SystemDesignCases.AsNoTracking();

        // Compare the enum directly (EF can translate this to SQL; .ToString() can't).
        if (!string.IsNullOrWhiteSpace(request.Difficulty)
            && Enum.TryParse<Difficulty>(request.Difficulty, ignoreCase: true, out var difficulty))
            query = query.Where(c => c.Difficulty == difficulty);

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

    public async Task<SystemDesignCaseDetailDto> GetSystemDesignCaseByIdAsync(
        GetSystemDesignCaseByIdRequest request, CancellationToken ct)
    {
        var c = await _db.SystemDesignCases
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(SystemDesignCase), request.Id);

        return new SystemDesignCaseDetailDto(
            c.Id,
            c.TitleEn,
            c.Difficulty.ToString(),
            c.Tags,
            c.IsPro,
            c.Summary,
            c.OverviewEn,
            c.RequirementsEn,
            c.HighLevelDesignEn,
            c.DeepDiveEn,
            c.TradeoffsEn,
            c.Hints
        );
    }
}

