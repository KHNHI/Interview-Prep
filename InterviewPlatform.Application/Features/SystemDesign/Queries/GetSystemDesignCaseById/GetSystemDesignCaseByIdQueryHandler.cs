using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Features.SystemDesign.Queries.GetSystemDesignCaseById;

public class GetSystemDesignCaseByIdQueryHandler
    : IRequestHandler<GetSystemDesignCaseByIdQuery, SystemDesignCaseDetailDto>
{
    private readonly IApplicationDbContext _db;

    public GetSystemDesignCaseByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<SystemDesignCaseDetailDto> Handle(
        GetSystemDesignCaseByIdQuery request, CancellationToken ct)
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
