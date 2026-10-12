using InterviewPlatform.Application.Features.Flashcards;

namespace InterviewPlatform.Application.Services;

public interface IFlashcardsService
{
    Task<IReadOnlyList<FlashcardDto>> GetFlashcardsAsync(GetFlashcardsRequest request, CancellationToken ct);
    Task<ReviewResult> ReviewFlashcardAsync(ReviewFlashcardRequest request, CancellationToken ct);
}


