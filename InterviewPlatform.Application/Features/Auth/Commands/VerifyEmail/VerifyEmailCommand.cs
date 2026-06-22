using InterviewPlatform.Application.Features.Auth.Commands.Register;
using MediatR;

namespace InterviewPlatform.Application.Features.Auth.Commands.VerifyEmail;

// Returns AuthResult so the user is logged in immediately after verifying.
public record VerifyEmailCommand(string Token) : IRequest<AuthResult>;
