
namespace InterviewPlatform.Application.Features.Questions;

public record GetQuestionsRequest(
    string? Category,
    string? Difficulty,
    string Lang = "en",
    int Page = 1,
    int PageSize = 20
);

public record QuestionsResult(List<QuestionDto> Items, int Total);


