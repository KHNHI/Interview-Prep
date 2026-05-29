using MediatR;

namespace InterviewPlatform.Application.Features.Auth.Commands.Register;

public record RegisterCommand(string Email, string Name, string Password) : IRequest<AuthResult>;

public record AuthResult(string AccessToken, string RefreshToken, Guid UserId);
