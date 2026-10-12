
namespace InterviewPlatform.Application.Features.Auth;

public record RegisterRequest(string Email, string Name, string Password);

public record AuthResult(string AccessToken, string RefreshToken, Guid UserId);

// Register no longer logs the user in — it returns a message telling them to
// verify their email. They get a session only after verifying (or via login).
public record RegisterResult(string Email, string Message);


