using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Features.Auth.Commands.Register;
using InterviewPlatform.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResult>
{
    private readonly IApplicationDbContext _db;
    private readonly ITokenService _tokens;

    public LoginCommandHandler(IApplicationDbContext db, ITokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    public async Task<AuthResult> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email, ct)
            ?? throw new UnauthorizedException("Invalid credentials.");

        if (user.PasswordHash == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid credentials.");

        return new AuthResult(
            _tokens.GenerateAccessToken(user),
            _tokens.GenerateRefreshToken(),
            user.Id
        );
    }
}
