
namespace InterviewPlatform.Application.Features.Flashcards;

public record GetFlashcardsRequest(Guid UserId);

public record FlashcardDto(
    Guid      Id,
    string    Category,
    string    Difficulty,
    string    Front,
    string    Back,
    float     EaseFactor,
    int       IntervalDays,
    int       Repetitions,
    DateTime? NextReviewAt
);


