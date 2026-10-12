
namespace InterviewPlatform.Application.Features.Progress;

public record GetRadarRequest(Guid UserId);

public record RadarItemDto(string Category, double Score);


