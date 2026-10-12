namespace InterviewPlatform.Application.Features.SystemDesign;

public record SystemDesignCaseDetailDto(
    Guid     Id,
    string   Title,
    string   Difficulty,
    string[] Tags,
    bool     IsPro,
    string?  Summary,
    string?  Overview,
    string?  Requirements,
    string?  HighLevelDesign,
    string?  DeepDive,
    string?  Tradeoffs,
    string?  Hints
);


