namespace InterviewPlatform.Application.Features.Questions.Queries.GetQuestions;

public record QuestionDto(
    Guid Id,
    string Category,
    string? Subcategory,
    string Title,
    string Content,
    string Difficulty,
    string[] Tags,
    bool IsPro
);
