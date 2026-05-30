namespace InterviewPlatform.Application.Features.Quiz.Queries.GetQuizQuestions;

public record QuizQuestionDto(
    Guid   Id,
    string Category,
    string Difficulty,
    string TitleEn,
    string? ContextEn,
    string? CodeSnippet,
    List<QuizOptionDto> Options,
    string CorrectOptionId,
    string ExplanationEn,
    bool   IsPro
);

public record QuizOptionDto(string Id, string Label, string Desc);
