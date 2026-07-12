using FluentAssertions;
using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Features.Flashcards.Commands.ReviewFlashcard;
using InterviewPlatform.Domain.Entities;
using InterviewPlatform.Infrastructure.Persistence;

namespace InterviewPlatform.Tests.Unit;

// Covers the SM-2 spaced-repetition algorithm — pure scheduling logic where a bug
// would silently corrupt every user's review intervals.
public class ReviewFlashcardCommandHandlerTests
{
    private static UserQuizAttempt Seed(ApplicationDbContext db, int reps, int interval, float ease)
    {
        var attempt = new UserQuizAttempt
        {
            Id             = Guid.NewGuid(),
            UserId         = Guid.NewGuid(),
            QuizQuestionId = Guid.NewGuid(),
            Repetitions    = reps,
            IntervalDays   = interval,
            EaseFactor     = ease
        };
        db.UserQuizAttempts.Add(attempt);
        db.SaveChanges();
        return attempt;
    }

    [Fact]
    public async Task Rating_below_3_resets_interval_and_reps()
    {
        using var db = TestDb.Create();
        var a = Seed(db, reps: 4, interval: 20, ease: 2.5f);

        var result = await new ReviewFlashcardCommandHandler(db)
            .Handle(new ReviewFlashcardCommand(a.Id, a.UserId, 1), default);

        result.IntervalDays.Should().Be(1);
        db.UserQuizAttempts.Single().Repetitions.Should().Be(0);
    }

    [Fact]
    public async Task First_success_sets_interval_to_1()
    {
        using var db = TestDb.Create();
        var a = Seed(db, reps: 0, interval: 1, ease: 2.5f);

        var result = await new ReviewFlashcardCommandHandler(db)
            .Handle(new ReviewFlashcardCommand(a.Id, a.UserId, 5), default);

        result.IntervalDays.Should().Be(1);
        db.UserQuizAttempts.Single().Repetitions.Should().Be(1);
    }

    [Fact]
    public async Task Second_success_sets_interval_to_6()
    {
        using var db = TestDb.Create();
        var a = Seed(db, reps: 1, interval: 1, ease: 2.5f);

        var result = await new ReviewFlashcardCommandHandler(db)
            .Handle(new ReviewFlashcardCommand(a.Id, a.UserId, 4), default);

        result.IntervalDays.Should().Be(6);
    }

    [Fact]
    public async Task Third_success_multiplies_interval_by_ease_factor()
    {
        using var db = TestDb.Create();
        var a = Seed(db, reps: 2, interval: 6, ease: 2.5f);

        var result = await new ReviewFlashcardCommandHandler(db)
            .Handle(new ReviewFlashcardCommand(a.Id, a.UserId, 4), default);

        result.IntervalDays.Should().Be(15); // round(6 * 2.5)
    }

    [Fact]
    public async Task Unknown_attempt_throws_NotFound()
    {
        using var db = TestDb.Create();

        var act = () => new ReviewFlashcardCommandHandler(db)
            .Handle(new ReviewFlashcardCommand(Guid.NewGuid(), Guid.NewGuid(), 4), default);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
