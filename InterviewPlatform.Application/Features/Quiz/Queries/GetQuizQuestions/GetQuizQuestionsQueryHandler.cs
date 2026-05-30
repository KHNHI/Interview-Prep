using System.Text.Json;
using InterviewPlatform.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Features.Quiz.Queries.GetQuizQuestions;

public class GetQuizQuestionsQueryHandler
    : IRequestHandler<GetQuizQuestionsQuery, List<QuizQuestionDto>>
{
    private readonly IApplicationDbContext _db;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public GetQuizQuestionsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<QuizQuestionDto>> Handle(
        GetQuizQuestionsQuery request, CancellationToken ct)
    {
        var query = _db.QuizQuestions.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(q => q.Category == request.Category);

        if (!string.IsNullOrWhiteSpace(request.Difficulty))
            query = query.Where(q => q.Difficulty.ToString().ToLower() == request.Difficulty.ToLower());

        // Pull all matching, shuffle in memory, take N
        var all = await query.ToListAsync(ct);
        var selected = all.OrderBy(_ => Guid.NewGuid()).Take(request.Count).ToList();

        return selected.Select(q =>
        {
            var options = JsonSerializer.Deserialize<List<QuizOptionDto>>(q.OptionsEn, JsonOpts)
                          ?? new List<QuizOptionDto>();
            return new QuizQuestionDto(
                q.Id,
                q.Category,
                q.Difficulty.ToString(),
                q.TitleEn,
                q.ContextEn,
                q.CodeSnippet,
                options,
                q.CorrectOptionId,
                q.ExplanationEn,
                q.IsPro
            );
        }).ToList();
    }
}
