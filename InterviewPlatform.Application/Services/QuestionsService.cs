using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Features.Questions;
using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Domain.Entities;
using InterviewPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Services;

public class QuestionsService : IQuestionsService
{
    private readonly IApplicationDbContext _db;
    public QuestionsService(IApplicationDbContext db) => _db = db;

    public async Task<QuestionsResult> GetQuestionsAsync(GetQuestionsRequest request, CancellationToken ct)
    {
        var query = _db.Questions.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(q => q.Category == request.Category);

        // Compare the enum directly (EF can translate this to SQL; .ToString() can't).
        if (!string.IsNullOrWhiteSpace(request.Difficulty)
            && Enum.TryParse<Difficulty>(request.Difficulty, ignoreCase: true, out var difficulty))
            query = query.Where(q => q.Difficulty == difficulty);

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

        return new QuestionsResult(items, total);
    }

    public async Task<QuestionDetailDto> GetQuestionByIdAsync(GetQuestionByIdRequest request, CancellationToken ct)
    {
        var q = await _db.Questions
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Question), request.Id);

        var title   = request.Lang == "vi" && q.TitleVi   is not null ? q.TitleVi   : q.TitleEn;
        var content = request.Lang == "vi" && q.ContentVi is not null ? q.ContentVi : q.ContentEn;

        return new QuestionDetailDto(
            q.Id,
            q.Category,
            q.Subcategory,
            title,
            content,
            q.Difficulty.ToString(),
            q.Tags,
            q.IsPro
        );
    }
}

