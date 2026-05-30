using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Features.Questions.Queries.GetQuestionById;

public class GetQuestionByIdQueryHandler : IRequestHandler<GetQuestionByIdQuery, QuestionDetailDto>
{
    private readonly IApplicationDbContext _db;

    public GetQuestionByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<QuestionDetailDto> Handle(GetQuestionByIdQuery request, CancellationToken ct)
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
