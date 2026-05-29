using MediatR;

namespace InterviewPlatform.Application.Features.Questions.Queries.GetQuestions;

public record GetQuestionsQuery(
    string? Category,
    string? Difficulty,
    string Lang = "en",
    int Page = 1,
    int PageSize = 20
) : IRequest<GetQuestionsResult>;

public record GetQuestionsResult(List<QuestionDto> Items, int Total);
