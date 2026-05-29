using InterviewPlatform.Domain.Entities;

namespace InterviewPlatform.Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
