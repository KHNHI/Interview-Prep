using InterviewPlatform.Application.Features.Auth;

namespace InterviewPlatform.Application.Services;

public interface IAuthService
{
    Task<RegisterResult> RegisterAsync(RegisterRequest request, CancellationToken ct);
    Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken ct);
    Task<AuthResult> VerifyEmailAsync(VerifyEmailRequest request, CancellationToken ct);
    Task ResendVerificationAsync(ResendVerificationRequest request, CancellationToken ct);
}


