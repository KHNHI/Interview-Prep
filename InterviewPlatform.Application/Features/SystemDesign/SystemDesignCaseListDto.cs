namespace InterviewPlatform.Application.Features.SystemDesign;

public record SystemDesignCaseListDto(
    Guid     Id,
    string   Title,
    string   Difficulty,
    string?  Summary,
    string[] Tags,
    bool     IsPro
);


