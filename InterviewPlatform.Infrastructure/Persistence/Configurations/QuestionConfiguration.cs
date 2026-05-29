using InterviewPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterviewPlatform.Infrastructure.Persistence.Configurations;

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.HasKey(q => q.Id);
        builder.Property(q => q.Category).HasMaxLength(50).IsRequired();
        builder.Property(q => q.Difficulty).HasConversion<string>();
        builder.Property(q => q.Tags).HasColumnType("text[]");
        builder.HasIndex(q => q.Category);
        builder.HasIndex(q => q.Difficulty);
    }
}
