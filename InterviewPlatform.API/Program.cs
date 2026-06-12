using System.Text;
using FluentValidation;
using InterviewPlatform.Application.Common.Behaviours;
using InterviewPlatform.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "InterviewPrep API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(new()
    {
        {
            new() { Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(InterviewPlatform.Application.Features.Auth.Commands.Register.RegisterCommand).Assembly));

builder.Services.AddValidatorsFromAssembly(typeof(InterviewPlatform.Application.Features.Auth.Commands.Register.RegisterCommand).Assembly);
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        // Keep the original JWT claim names (e.g. "sub") instead of remapping
        // them to the legacy XML URIs. Controllers read JwtRegisteredClaimNames.Sub
        // directly, so without this the user id lookup returns null → 401.
        opts.MapInboundClaims = false;
        opts.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddInfrastructure(builder.Configuration);

// AllowedOrigins may be a comma-separated list (e.g. prod domain + www + localhost).
var allowedOrigins = (builder.Configuration["AllowedOrigins"] ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(opts => opts.AddDefaultPolicy(policy =>
    policy.WithOrigins(allowedOrigins)
          .AllowAnyMethod()
          .AllowAnyHeader()));

builder.Services.AddHealthChecks();

// Trust X-Forwarded-* from the reverse proxy (Caddy/CloudFront) so the app sees
// the real client IP and https scheme. The container port is only reachable from
// the proxy on the same Docker network, so trusting all proxies here is safe.
builder.Services.Configure<ForwardedHeadersOptions>(o =>
{
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    o.KnownNetworks.Clear();
    o.KnownProxies.Clear();
});

var app = builder.Build();

app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<InterviewPlatform.API.Middleware.ExceptionHandlingMiddleware>();
app.UseCors();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");   // ALB / uptime liveness probe (anonymous)

// ── Apply migrations + seed on startup ───────────────────────────────────
// Self-migrating on boot keeps deploys to a single EC2 instance simple.
// (If you ever run multiple API instances, move migrations to a CI step to
//  avoid two instances racing to migrate at the same time.)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<InterviewPlatform.Infrastructure.Persistence.ApplicationDbContext>();
    await db.Database.MigrateAsync();

    var seeder = scope.ServiceProvider.GetRequiredService<InterviewPlatform.Infrastructure.Persistence.DataSeeder>();
    await seeder.SeedAsync();
}

app.Run();

public partial class Program { }
