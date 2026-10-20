using FluentValidation;
using FluentValidation.Results;
using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Features.Questions;
using InterviewPlatform.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Services;

public interface IAnswerFeedbackService
{
    AnswerFeedbackStatus GetStatus();
    Task<AnswerFeedback> ReviewAsync(Guid questionId, Guid userId, AnswerFeedbackRequest request, CancellationToken ct);
}

public class AnswerFeedbackService(
    IApplicationDbContext db,
    IAnswerFeedbackProvider provider,
    IAnswerFeedbackUsage usage) : IAnswerFeedbackService
{
    public const int MinAnswerLength = 30;
    public const int MaxAnswerLength = 4000;

    public AnswerFeedbackStatus GetStatus() => new(provider.IsAvailable, usage.DailyUserLimit, MaxAnswerLength);

    public async Task<AnswerFeedback> ReviewAsync(Guid questionId, Guid userId, AnswerFeedbackRequest request, CancellationToken ct)
    {
        var answer = request.Answer?.Trim() ?? "";
        if (answer.Length < MinAnswerLength || answer.Length > MaxAnswerLength)
            throw new ValidationException([new ValidationFailure(nameof(request.Answer), "Write an answer between 30 and 4,000 characters.")]);

        if (!await db.Users.AsNoTracking().AnyAsync(u => u.Id == userId && u.IsEmailVerified, ct))
            throw new UnauthorizedException("Sign in with a verified account to request feedback.");

        var question = await db.Questions.AsNoTracking().FirstOrDefaultAsync(q => q.Id == questionId, ct)
            ?? throw new NotFoundException("Question", questionId);

        if (!provider.IsAvailable)
            throw new AiUnavailableException("AI feedback is not enabled right now. You can still practice and read the reference answer.");

        // Budget is reserved before the paid call. Failed provider attempts also count.
        await usage.ReserveAsync(userId, ct);
        return await provider.ReviewAsync(question.TitleEn, question.ContentEn, answer, ct);
    }
}
