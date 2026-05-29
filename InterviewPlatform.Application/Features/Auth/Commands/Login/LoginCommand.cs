using MediatR;
using InterviewPlatform.Application.Features.Auth.Commands.Register;

namespace InterviewPlatform.Application.Features.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<AuthResult>;
