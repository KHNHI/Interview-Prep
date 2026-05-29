using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResult>
{
    private readonly IApplicationDbContext _db;
    private readonly ITokenService _tokens;

    public RegisterCommandHandler(IApplicationDbContext db, ITokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    public async Task<AuthResult> Handle(RegisterCommand request, CancellationToken ct)
    {
        var exists = await _db.Users.AnyAsync(u => u.Email == request.Email, ct);
        if (exists) throw new UnauthorizedException("Email already registered.");

        var user = new User
        {
            Email = request.Email,
            Name = request.Name,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        return new AuthResult(
            _tokens.GenerateAccessToken(user),
            _tokens.GenerateRefreshToken(),
            user.Id
        );
    }
}
