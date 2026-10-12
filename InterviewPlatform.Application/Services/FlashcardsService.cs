using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Features.Flashcards;
using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Services;

public class FlashcardsService : IFlashcardsService
{
    private readonly IApplicationDbContext _db;
    public FlashcardsService(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<FlashcardDto>> GetFlashcardsAsync(GetFlashcardsRequest request, CancellationToken ct)
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

    public async Task<ReviewResult> ReviewFlashcardAsync(ReviewFlashcardRequest request, CancellationToken ct)
    {
        var attempt = await _db.UserQuizAttempts
            .FirstOrDefaultAsync(a => a.Id == request.AttemptId && a.UserId == request.UserId, ct);

        if (attempt is null)
            throw new NotFoundException(nameof(Domain.Entities.UserQuizAttempt), request.AttemptId);

        ApplySM2(attempt, request.Rating);
        await _db.SaveChangesAsync(ct);

        return new ReviewResult(attempt.IntervalDays, attempt.NextReviewAt!.Value);
    }

    private static void ApplySM2(UserQuizAttempt attempt, int rating)
    {
        if (rating < 3)
        {
            attempt.Repetitions  = 0;
            attempt.IntervalDays = 1;
        }
        else
        {
            attempt.IntervalDays = attempt.Repetitions switch
            {
                0 => 1,
                1 => 6,
                _ => (int)Math.Round(attempt.IntervalDays * attempt.EaseFactor)
            };
            attempt.EaseFactor = Math.Max(1.3f,
                attempt.EaseFactor + 0.1f - (5 - rating) * (0.08f + (5 - rating) * 0.02f));
            attempt.Repetitions++;
        }
        attempt.NextReviewAt = DateTime.UtcNow.Date.AddDays(attempt.IntervalDays);
    }
}

