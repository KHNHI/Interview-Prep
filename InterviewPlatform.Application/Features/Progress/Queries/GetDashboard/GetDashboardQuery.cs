using MediatR;

namespace InterviewPlatform.Application.Features.Progress.Queries.GetDashboard;

public record GetDashboardQuery(Guid UserId) : IRequest<DashboardDto>;

public record HeatmapEntryDto(string Date, int Count);

public record DashboardDto(
    int    QuestionsAttempted,
    int    QuizzesTaken,
    double CorrectRate,
    int    CurrentStreak,
    IReadOnlyList<HeatmapEntryDto> Heatmap
);
