using MediatR;

namespace InterviewPlatform.Application.Features.Flashcards.Commands.ReviewFlashcard;

public record ReviewFlashcardCommand(Guid AttemptId, Guid UserId, int Rating) : IRequest<ReviewResult>;

public record ReviewResult(int IntervalDays, DateTime NextReviewAt);
