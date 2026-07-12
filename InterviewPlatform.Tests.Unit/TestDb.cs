using InterviewPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Tests.Unit;

// Builds a fresh in-memory ApplicationDbContext per test (isolated by a unique db name).
// Lets handler tests exercise real EF queries + saves without a Postgres server.
internal static class TestDb
{
    public static ApplicationDbContext Create() =>
        new(new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);
}
