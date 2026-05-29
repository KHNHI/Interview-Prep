using System.Net.Http.Json;
using InterviewPlatform.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace InterviewPlatform.Infrastructure.Services;

public class AiFeedbackService : IAiFeedbackService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;

    public AiFeedbackService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _apiKey = config["Anthropic:ApiKey"]!;
    }

    public async Task<string> GetFeedbackAsync(string caseTitle, string solution, CancellationToken ct = default)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("x-api-key", _apiKey);
        _http.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");

        var body = new
        {
            model = "claude-sonnet-4-6",
            max_tokens = 1024,
            messages = new[]
            {
                new
                {
                    role = "user",
                    content = $"You are a senior software engineer evaluating a system design interview. " +
                              $"Case: {caseTitle}\n\nCandidate solution:\n{solution}\n\n" +
                              $"Provide structured feedback with scores for: scalability, reliability, " +
                              $"trade-offs, clarity. Return JSON with scores and comments."
                }
            }
        };

        var response = await _http.PostAsJsonAsync("https://api.anthropic.com/v1/messages", body, ct);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<AnthropicResponse>(cancellationToken: ct);
        return result?.Content?.FirstOrDefault()?.Text ?? string.Empty;
    }

    private record AnthropicResponse(AnthropicContent[]? Content);
    private record AnthropicContent(string Text);
}
