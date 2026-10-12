using InterviewPlatform.Application.Features.Questions;

namespace InterviewPlatform.Application.Services;

public interface IQuestionsService
{
    Task<QuestionsResult> GetQuestionsAsync(GetQuestionsRequest request, CancellationToken ct);
    Task<QuestionDetailDto> GetQuestionByIdAsync(GetQuestionByIdRequest request, CancellationToken ct);
}


