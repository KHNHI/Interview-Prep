namespace InterviewPlatform.Application.Interfaces;

public interface IAiFeedbackService
{
    Task<string> GetFeedbackAsync(string caseTitle, string solution, CancellationToken ct = default);
}
