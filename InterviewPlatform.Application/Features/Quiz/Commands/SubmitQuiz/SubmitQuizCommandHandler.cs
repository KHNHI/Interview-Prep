using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Features.Quiz.Commands.SubmitQuiz;

public class SubmitQuizCommandHandler : IRequestHandler<SubmitQuizCommand, SubmitQuizResult>
{
    private readonly IApplicationDbContext _db;

    public SubmitQuizCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<SubmitQuizResult> Handle(SubmitQuizCommand request, CancellationToken ct)
    {
        var questionIds = request.Answers.Select(a => a.QuizQuestionId).ToList();

        var correctMap = await _db.QuizQuestions
            .Where(q => questionIds.Contains(q.Id))
            .Select(q => new { q.Id, q.CorrectOptionId })
            .ToDictionaryAsync(q => q.Id, q => q.CorrectOptionId, ct);

        var attempts = new List<UserQuizAttempt>(request.Answers.Count);
        var correctCount = 0;

        foreach (var answer in request.Answers)
        {
            if (!correctMap.TryGetValue(answer.QuizQuestionId, out var correctOptionId))
                continue;

            var isCorrect = answer.SelectedOptionId == correctOptionId;
            if (isCorrect) correctCount++;

            attempts.Add(new UserQuizAttempt
            {
                UserId         = request.UserId,
                QuizQuestionId = answer.QuizQuestionId,
                IsCorrect      = isCorrect,
                TimeTakenMs    = answer.TimeTakenMs,
            });
        }

        _db.UserQuizAttempts.AddRange(attempts);
        await _db.SaveChangesAsync(ct);

        return new SubmitQuizResult(correctCount, attempts.Count);
    }
}
