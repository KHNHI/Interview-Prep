using MediatR;

namespace InterviewPlatform.Application.Features.Quiz.Queries.GetQuizQuestions;

public record GetQuizQuestionsQuery(
    string? Category,
    string? Difficulty,
    int     Count = 15
) : IRequest<List<QuizQuestionDto>>;
