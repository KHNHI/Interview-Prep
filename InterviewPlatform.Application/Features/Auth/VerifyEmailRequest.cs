using InterviewPlatform.Application.Features.Auth;

namespace InterviewPlatform.Application.Features.Auth;

// Returns AuthResult so the user is logged in immediately after verifying.
public record VerifyEmailRequest(string Token);


