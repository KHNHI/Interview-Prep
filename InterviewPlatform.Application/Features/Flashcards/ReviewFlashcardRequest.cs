
namespace InterviewPlatform.Application.Features.Flashcards;

public record ReviewFlashcardRequest(Guid AttemptId, Guid UserId, int Rating);

public record ReviewResult(int IntervalDays, DateTime NextReviewAt);


