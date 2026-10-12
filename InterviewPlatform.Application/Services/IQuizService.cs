using InterviewPlatform.Application.Features.Quiz;

namespace InterviewPlatform.Application.Services;

public interface IQuizService
{
    Task<List<QuizQuestionDto>> GetQuizQuestionsAsync(
        GetQuizQuestionsRequest request, CancellationToken ct);
    Task<SubmitQuizResult> SubmitQuizAsync(SubmitQuizRequest request, CancellationToken ct);
}


