using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Features.Flashcards.Commands.ReviewFlashcard;

public class ReviewFlashcardCommandHandler : IRequestHandler<ReviewFlashcardCommand, ReviewResult>
{
    private readonly IApplicationDbContext _db;

    public ReviewFlashcardCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<ReviewResult> Handle(ReviewFlashcardCommand request, CancellationToken ct)
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
