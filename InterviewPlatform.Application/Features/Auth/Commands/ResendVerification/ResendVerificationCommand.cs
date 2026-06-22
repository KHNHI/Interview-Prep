using MediatR;

namespace InterviewPlatform.Application.Features.Auth.Commands.ResendVerification;

public record ResendVerificationCommand(string Email) : IRequest<Unit>;
