using MediatR;

namespace InterviewPlatform.Application.Features.Quiz.Commands.SubmitQuiz;

public record QuizAnswerItem(Guid QuizQuestionId, string? SelectedOptionId, int TimeTakenMs);

public record SubmitQuizCommand(Guid UserId, List<QuizAnswerItem> Answers) : IRequest<SubmitQuizResult>;

public record SubmitQuizResult(int CorrectCount, int TotalCount);
