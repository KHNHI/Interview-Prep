using InterviewPlatform.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Features.Questions.Queries.GetQuestions;

public class GetQuestionsQueryHandler : IRequestHandler<GetQuestionsQuery, GetQuestionsResult>
{
    private readonly IApplicationDbContext _db;

    public GetQuestionsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<GetQuestionsResult> Handle(GetQuestionsQuery request, CancellationToken ct)
    {
        var query = _db.Questions.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(q => q.Category == request.Category);

        if (!string.IsNullOrWhiteSpace(request.Difficulty))
            query = query.Where(q => q.Difficulty.ToString().ToLower() == request.Difficulty.ToLower());

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderBy(q => q.OrderIndex)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(q => new QuestionDto(
                q.Id,
                q.Category,
                q.Subcategory,
                request.Lang == "vi" && q.TitleVi != null ? q.TitleVi : q.TitleEn,
                request.Lang == "vi" && q.ContentVi != null ? q.ContentVi : q.ContentEn,
                q.Difficulty.ToString(),
                q.Tags,
                q.IsPro
            ))
            .ToListAsync(ct);

        return new GetQuestionsResult(items, total);
    }
}
