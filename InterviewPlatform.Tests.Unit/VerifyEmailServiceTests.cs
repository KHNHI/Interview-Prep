using InterviewPlatform.Application.Services;
using FluentAssertions;
using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Features.Auth;
using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Domain.Entities;
using InterviewPlatform.Infrastructure.Persistence;
using Moq;

namespace InterviewPlatform.Tests.Unit;

public class VerifyEmailServiceTests
{
    private static void SeedUnverified(ApplicationDbContext db, string token, DateTime expires)
    {
        db.Users.Add(new User
        {
            Id                              = Guid.NewGuid(),
            Email                           = "a@b.com",
            Name                            = "Test",
            PasswordHash                    = "hash",
            IsEmailVerified                 = false,
            EmailVerificationToken          = token,
            EmailVerificationTokenExpiresAt = expires
        });
        db.SaveChanges();
    }

    private static ITokenService FakeTokens()
    {
        var mock = new Mock<ITokenService>();
        mock.Setup(t => t.GenerateAccessToken(It.IsAny<User>())).Returns("access-token");
        mock.Setup(t => t.GenerateRefreshToken()).Returns("refresh-token");
        return mock.Object;
    }

    [Fact]
    public async Task Valid_token_verifies_account_and_returns_token()
    {
        using var db = TestDb.Create();
        SeedUnverified(db, "tok123", DateTime.UtcNow.AddHours(1));

        var result = await new AuthService(db, FakeTokens(), Mock.Of<IEmailService>(), new Microsoft.Extensions.Configuration.ConfigurationBuilder().Build(), Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>.Instance)
            .VerifyEmailAsync(new VerifyEmailRequest("tok123"), default);

        result.AccessToken.Should().Be("access-token");
        var user = db.Users.Single();
        user.IsEmailVerified.Should().BeTrue();
        user.EmailVerificationToken.Should().BeNull(); // consumed
    }

    [Fact]
    public async Task Expired_token_throws()
    {
        using var db = TestDb.Create();
        SeedUnverified(db, "tok123", DateTime.UtcNow.AddHours(-1));

        var act = () => new AuthService(db, FakeTokens(), Mock.Of<IEmailService>(), new Microsoft.Extensions.Configuration.ConfigurationBuilder().Build(), Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>.Instance)
            .VerifyEmailAsync(new VerifyEmailRequest("tok123"), default);

        await act.Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task Unknown_token_throws()
    {
        using var db = TestDb.Create();

        var act = () => new AuthService(db, FakeTokens(), Mock.Of<IEmailService>(), new Microsoft.Extensions.Configuration.ConfigurationBuilder().Build(), Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>.Instance)
            .VerifyEmailAsync(new VerifyEmailRequest("does-not-exist"), default);

        await act.Should().ThrowAsync<UnauthorizedException>();
    }
}


