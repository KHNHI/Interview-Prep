using MediatR;

namespace InterviewPlatform.Application.Features.SystemDesign.Queries.GetSystemDesignCaseById;

public record GetSystemDesignCaseByIdQuery(Guid Id) : IRequest<SystemDesignCaseDetailDto>;
