namespace InterviewPlatform.Application.Features.Auth;

public static class EmailTemplates
{
    public static string Verification(string name, string link) => $@"
<div style=""font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#0F0F0F"">
  <h2 style=""margin-bottom:8px"">Welcome to InterviewPrep, {name}!</h2>
  <p style=""color:#525252;line-height:1.6"">Please verify your email address to activate your account.</p>
  <p style=""margin:24px 0"">
    <a href=""{link}"" style=""display:inline-block;padding:11px 20px;background:#0F0F0F;color:#fff;text-decoration:none;border-radius:6px;font-weight:600"">Verify my email</a>
  </p>
  <p style=""color:#525252;font-size:13px"">Or paste this link into your browser:<br>
    <a href=""{link}"" style=""color:#0F0F0F"">{link}</a>
  </p>
  <p style=""color:#9C9C9C;font-size:12px;margin-top:24px"">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
</div>";
}
