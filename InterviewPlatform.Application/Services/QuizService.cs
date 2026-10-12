using InterviewPlatform.Application.Features.Quiz;
using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Domain.Entities;
using InterviewPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace InterviewPlatform.Application.Services;

public class QuizService : IQuizService
{
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };
    private readonly IApplicationDbContext _db;
    public QuizService(IApplicationDbContext db) => _db = db;

    public async Task<List<QuizQuestionDto>> GetQuizQuestionsAsync(
        GetQuizQuestionsRequest request, CancellationToken ct)
    {
        var query = _db.QuizQuestions.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(q => q.Category == request.Category);

        // Compare the enum directly (EF can translate this to SQL; .ToString() can't).
        if (!string.IsNullOrWhiteSpace(request.Difficulty)
            && Enum.TryParse<Difficulty>(request.Difficulty, ignoreCase: true, out var difficulty))
            query = query.Where(q => q.Difficulty == difficulty);

        // Pull all matching, shuffle in memory, take N
        var all = await query.ToListAsync(ct);
        var selected = all.OrderBy(_ => Guid.NewGuid()).Take(request.Count).ToList();

        return selected.Select(q =>
        {
            var options = JsonSerializer.Deserialize<List<QuizOptionDto>>(q.OptionsEn, JsonOpts)
                          ?? new List<QuizOptionDto>();
            return new QuizQuestionDto(
                q.Id,
                q.Category,
                q.Difficulty.ToString(),
                q.TitleEn,
                q.ContextEn,
                q.CodeSnippet,
                options,
                q.CorrectOptionId,
                q.ExplanationEn,
                q.IsPro
            );
        }).ToList();
    }

    public async Task<SubmitQuizResult> SubmitQuizAsync(SubmitQuizRequest request, CancellationToken ct)
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

