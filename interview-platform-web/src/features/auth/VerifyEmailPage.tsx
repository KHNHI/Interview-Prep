import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { authApi } from "../../api/auth.api";
import { useAuthStore } from "../../stores/authStore";

type Status = "verifying" | "success" | "error";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);

  const [status, setStatus] = useState<Status>("verifying");
  const [resendEmail, setResendEmail] = useState("");
  const [resent, setResent] = useState(false);
  const ran = useRef(false); // guard against React StrictMode double-invoke

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!token) { setStatus("error"); return; }

    authApi.verifyEmail(token)
      .then(res => {
        const { accessToken, userId } = res.data.data;
        setAuth(accessToken, userId);
        localStorage.setItem("access_token", accessToken);
        setStatus("success");
        setTimeout(() => navigate("/dashboard"), 1500);
      })
      .catch(() => setStatus("error"));
  }, [token, setAuth, navigate]);

  const resend = async () => {
    if (!resendEmail) return;
    try { await authApi.resendVerification(resendEmail); setResent(true); } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas font-sans px-6">
      <div className="w-full max-w-[380px] text-center">
        <div className="text-[14px] font-bold text-ink-1 tracking-tight mb-8">InterviewPrep</div>

        {status === "verifying" && (
          <>
            <div className="w-10 h-10 border-2 border-line border-t-ink-1 rounded-full animate-spin mx-auto mb-5" />
            <h1 className="text-[20px] font-bold tracking-tight text-ink-1">Verifying your email…</h1>
            <p className="text-[13px] text-ink-3 mt-2">This will only take a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-12 h-12 rounded-full bg-ink-1 flex items-center justify-center mx-auto mb-5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 className="text-[20px] font-bold tracking-tight text-ink-1">Email verified!</h1>
            <p className="text-[13px] text-ink-2 mt-2">Your account is active. Taking you to your dashboard…</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 rounded-full bg-canvas border border-line-strong flex items-center justify-center mx-auto mb-5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h1 className="text-[20px] font-bold tracking-tight text-ink-1">Link invalid or expired</h1>
            <p className="text-[13px] text-ink-2 mt-2 leading-relaxed">
              This verification link is no longer valid. Enter your email to get a fresh one.
            </p>

            {resent ? (
              <p className="text-[13px] text-ink-2 mt-5 font-medium">A new link is on its way ✓ — check your inbox.</p>
            ) : (
              <div className="flex gap-2 mt-5">
                <input
                  type="email" value={resendEmail} onChange={e => setResendEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 px-3 py-2 border border-line rounded-sm bg-white text-[13.5px] text-ink-1 placeholder-ink-3 focus:outline-none focus:border-ink-1 transition-colors" />
                <button onClick={resend}
                  className="px-3.5 py-2 rounded-sm text-[13px] font-medium bg-ink-1 text-white hover:bg-[#2A2A2A] transition-colors whitespace-nowrap">
                  Resend
                </button>
              </div>
            )}

            <Link to="/login" className="inline-block mt-6 text-[13px] text-ink-1 font-medium underline underline-offset-[3px]">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
