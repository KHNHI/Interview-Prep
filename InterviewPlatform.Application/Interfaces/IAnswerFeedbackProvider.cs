using InterviewPlatform.Application.Features.Questions;

namespace InterviewPlatform.Application.Interfaces;

public interface IAnswerFeedbackProvider
{
    bool IsAvailable { get; }
    Task<AnswerFeedback> ReviewAsync(string question, string referenceAnswer, string answer, CancellationToken ct);
}

public interface IAnswerFeedbackUsage
{
    int DailyUserLimit { get; }
    Task ReserveAsync(Guid userId, CancellationToken ct);
}
