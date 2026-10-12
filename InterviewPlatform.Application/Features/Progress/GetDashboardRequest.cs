
namespace InterviewPlatform.Application.Features.Progress;

public record GetDashboardRequest(Guid UserId);

public record HeatmapEntryDto(string Date, int Count);

public record DashboardDto(
    int    QuestionsAttempted,
    int    QuizzesTaken,
    double CorrectRate,
    int    CurrentStreak,
    IReadOnlyList<HeatmapEntryDto> Heatmap
);


