using InterviewPlatform.Application.Features.Progress;

namespace InterviewPlatform.Application.Services;

public interface IProgressService
{
    Task<DashboardDto> GetDashboardAsync(GetDashboardRequest request, CancellationToken ct);
    Task<IReadOnlyList<RadarItemDto>> GetRadarAsync(GetRadarRequest request, CancellationToken ct);
}


