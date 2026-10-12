using InterviewPlatform.Application.Services;
using FluentAssertions;
using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Features.Auth;
using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Domain.Entities;
using InterviewPlatform.Infrastructure.Persistence;
using Moq;

namespace InterviewPlatform.Tests.Unit;

public class LoginServiceTests
{
    private static void SeedUser(ApplicationDbContext db, string email, string password, bool verified)
    {
        db.Users.Add(new User
        {
            Id              = Guid.NewGuid(),
            Email           = email,
            Name            = "Test",
            PasswordHash    = BCrypt.Net.BCrypt.HashPassword(password),
            IsEmailVerified = verified
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
    public async Task Valid_verified_credentials_return_a_token()
    {
        using var db = TestDb.Create();
        SeedUser(db, "a@b.com", "Strong1!", verified: true);

        var result = await new AuthService(db, FakeTokens(), Mock.Of<IEmailService>(), new Microsoft.Extensions.Configuration.ConfigurationBuilder().Build(), Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>.Instance)
            .LoginAsync(new LoginRequest("a@b.com", "Strong1!"), default);

        result.AccessToken.Should().Be("access-token");
    }

    [Fact]
    public async Task Wrong_password_throws_Unauthorized()
    {
        using var db = TestDb.Create();
        SeedUser(db, "a@b.com", "Strong1!", verified: true);

        var act = () => new AuthService(db, FakeTokens(), Mock.Of<IEmailService>(), new Microsoft.Extensions.Configuration.ConfigurationBuilder().Build(), Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>.Instance)
            .LoginAsync(new LoginRequest("a@b.com", "WrongPass1!"), default);

        await act.Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task Unverified_email_throws_EmailNotVerified()
    {
        using var db = TestDb.Create();
        SeedUser(db, "a@b.com", "Strong1!", verified: false);

        var act = () => new AuthService(db, FakeTokens(), Mock.Of<IEmailService>(), new Microsoft.Extensions.Configuration.ConfigurationBuilder().Build(), Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>.Instance)
            .LoginAsync(new LoginRequest("a@b.com", "Strong1!"), default);

        await act.Should().ThrowAsync<EmailNotVerifiedException>();
    }

    [Fact]
    public async Task Unknown_email_throws_Unauthorized()
    {
        using var db = TestDb.Create();

        var act = () => new AuthService(db, FakeTokens(), Mock.Of<IEmailService>(), new Microsoft.Extensions.Configuration.ConfigurationBuilder().Build(), Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>.Instance)
            .LoginAsync(new LoginRequest("nobody@b.com", "Strong1!"), default);

        await act.Should().ThrowAsync<UnauthorizedException>();
    }
}


