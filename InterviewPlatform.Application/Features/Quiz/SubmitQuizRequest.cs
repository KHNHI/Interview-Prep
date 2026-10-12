
namespace InterviewPlatform.Application.Features.Quiz;

public record QuizAnswerItem(Guid QuizQuestionId, string? SelectedOptionId, int TimeTakenMs);

public record SubmitQuizRequest(Guid UserId, List<QuizAnswerItem> Answers);

public record SubmitQuizResult(int CorrectCount, int TotalCount);


