namespace InterviewPlatform.Application.Features.SystemDesign.Queries.GetSystemDesignCases;

public record SystemDesignCaseListDto(
    Guid     Id,
    string   Title,
    string   Difficulty,
    string?  Summary,
    string[] Tags,
    bool     IsPro
);
