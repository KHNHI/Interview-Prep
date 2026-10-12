using InterviewPlatform.Application.Features.SystemDesign;

namespace InterviewPlatform.Application.Services;

public interface ISystemDesignService
{
    Task<List<SystemDesignCaseListDto>> GetSystemDesignCasesAsync(
        GetSystemDesignCasesRequest request, CancellationToken ct);
    Task<SystemDesignCaseDetailDto> GetSystemDesignCaseByIdAsync(
        GetSystemDesignCaseByIdRequest request, CancellationToken ct);
}


