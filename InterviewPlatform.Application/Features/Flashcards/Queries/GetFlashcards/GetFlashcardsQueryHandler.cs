using InterviewPlatform.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Features.Flashcards.Queries.GetFlashcards;

public class GetFlashcardsQueryHandler : IRequestHandler<GetFlashcardsQuery, IReadOnlyList<FlashcardDto>>
{
    private readonly IApplicationDbContext _db;

    public GetFlashcardsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<FlashcardDto>> Handle(GetFlashcardsQuery request, CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;

        // Load all attempts for the user (with question data)
        var attempts = await _db.UserQuizAttempts
            .Where(a => a.UserId == request.UserId)
            .Include(a => a.QuizQuestion)
            .ToListAsync(ct);

        // For each unique question, keep the most recent attempt.
        // Include it if it's new (NextReviewAt null) or overdue/due today.
        var due = attempts
            .GroupBy(a => a.QuizQuestionId)
            .Select(g => g.OrderByDescending(a => a.AttemptedAt).First())
            .Where(a => a.NextReviewAt == null || a.NextReviewAt.Value.Date <= today)
            .OrderBy(a => a.NextReviewAt)   // null (new) first, then oldest overdue
            .Take(20)
            .Select(a => new FlashcardDto(
                a.Id,
                a.QuizQuestion.Category,
                a.QuizQuestion.Difficulty.ToString(),
                a.QuizQuestion.TitleEn,
                a.QuizQuestion.ExplanationEn,
                a.EaseFactor,
                a.IntervalDays,
                a.Repetitions,
                a.NextReviewAt
            ))
            .ToList();

        return due;
    }
}
