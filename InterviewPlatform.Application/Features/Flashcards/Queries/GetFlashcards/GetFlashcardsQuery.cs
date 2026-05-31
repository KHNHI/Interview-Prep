using MediatR;

namespace InterviewPlatform.Application.Features.Flashcards.Queries.GetFlashcards;

public record GetFlashcardsQuery(Guid UserId) : IRequest<IReadOnlyList<FlashcardDto>>;

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
