using MediatR;

namespace InterviewPlatform.Application.Features.SystemDesign.Queries.GetSystemDesignCases;

public record GetSystemDesignCasesQuery(string? Difficulty = null)
    : IRequest<List<SystemDesignCaseListDto>>;
