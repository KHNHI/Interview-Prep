using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Features.Auth.Commands.Register;
using InterviewPlatform.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Features.Auth.Commands.VerifyEmail;

public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, AuthResult>
{
    private readonly IApplicationDbContext _db;
    private readonly ITokenService _tokens;

    public VerifyEmailCommandHandler(IApplicationDbContext db, ITokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    public async Task<AuthResult> Handle(VerifyEmailCommand request, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.EmailVerificationToken == request.Token, ct);

        // Token already consumed but account verified → just issue a session.
        if (user is null)
            throw new UnauthorizedException("Invalid or expired verification link.");

        if (!user.IsEmailVerified)
        {
            if (user.EmailVerificationTokenExpiresAt is null ||
                user.EmailVerificationTokenExpiresAt < DateTime.UtcNow)
                throw new UnauthorizedException("This verification link has expired. Please request a new one.");

            user.IsEmailVerified = true;
            user.EmailVerificationToken = null;
            user.EmailVerificationTokenExpiresAt = null;
            await _db.SaveChangesAsync(ct);
        }

        return new AuthResult(
            _tokens.GenerateAccessToken(user),
            _tokens.GenerateRefreshToken(),
            user.Id
        );
    }
}
