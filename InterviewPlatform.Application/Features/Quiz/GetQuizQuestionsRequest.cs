
namespace InterviewPlatform.Application.Features.Quiz;

public record GetQuizQuestionsRequest(
    string? Category,
    string? Difficulty,
    int     Count = 15
);


