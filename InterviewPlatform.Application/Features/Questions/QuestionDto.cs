namespace InterviewPlatform.Application.Features.Questions;

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


