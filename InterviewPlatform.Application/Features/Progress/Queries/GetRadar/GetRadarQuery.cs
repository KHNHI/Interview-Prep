using MediatR;

namespace InterviewPlatform.Application.Features.Progress.Queries.GetRadar;

public record GetRadarQuery(Guid UserId) : IRequest<IReadOnlyList<RadarItemDto>>;

public record RadarItemDto(string Category, double Score);
