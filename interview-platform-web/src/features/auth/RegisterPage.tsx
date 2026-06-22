import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "../../api/auth.api";
import { Link } from "react-router-dom";

const schema = z.object({
  name:     z.string().min(2, "At least 2 characters"),
  email:    z.string().email("Enter a valid email"),
  password: z.string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Add at least one uppercase letter")
    .regex(/[^A-Za-z0-9]/, "Add at least one special character"),
});
type FormData = z.infer<typeof schema>;

const FEATURES = [
  { icon: "◇", label: "10,000+ curated questions across topics" },
  { icon: "◈", label: "SM-2 spaced repetition for flashcards"   },
  { icon: "◉", label: "AI-powered mock interview feedback"       },
  { icon: "◎", label: "Track readiness with skill radar charts"  },
];

export function RegisterPage() {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.register(data.email, data.name, data.password);
      setSubmittedEmail(res.data.data.email);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError("email", {
        message: status === 401
          ? "That email is already registered."
          : "Registration failed. Please try again.",
      });
    }
  };

  const resend = async () => {
    if (!submittedEmail) return;
    try { await authApi.resendVerification(submittedEmail); setResent(true); } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left dark panel */}
      <div className="w-[400px] bg-sidebar flex flex-col flex-shrink-0 px-10 py-12">
        <div className="mb-auto">
          <div className="text-[14px] font-bold text-white tracking-tight">InterviewPrep</div>
          <div className="text-[10.5px] text-white/30 mt-0.5">Engineering Mastery</div>
        </div>
        <div className="flex flex-col gap-4">
          {FEATURES.map(f => (
            <div key={f.label} className="flex items-start gap-3">
              <span className="text-white/40 text-[14px] mt-0.5 flex-shrink-0">{f.icon}</span>
              <span className="text-[13px] text-white/65 leading-snug">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-canvas px-6 py-10">
        {submittedEmail ? (
          /* ── Check your email ── */
          <div className="w-full max-w-[360px] text-center">
            <div className="w-12 h-12 rounded-full bg-ink-1 flex items-center justify-center mx-auto mb-5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>
              </svg>
            </div>
            <h1 className="text-[22px] font-bold tracking-tight text-ink-1">Check your email</h1>
            <p className="text-[13.5px] text-ink-2 mt-2 leading-relaxed">
              We sent a verification link to{" "}
              <span className="font-semibold text-ink-1">{submittedEmail}</span>.
              Click it to activate your account.
            </p>
            <p className="text-[12.5px] text-ink-3 mt-5">
              Didn't get it?{" "}
              {resent
                ? <span className="text-ink-2 font-medium">Sent again ✓</span>
                : <button onClick={resend} className="text-ink-1 font-medium underline underline-offset-[3px]">Resend link</button>}
            </p>
            <Link to="/login" className="inline-block mt-6 text-[13px] text-ink-1 font-medium underline underline-offset-[3px]">
              Back to sign in
            </Link>
          </div>
        ) : (
          /* ── Registration form ── */
          <div className="w-full max-w-[360px]">
            <div className="mb-7">
              <h1 className="text-[22px] font-bold tracking-tight text-ink-1">Create your account</h1>
              <p className="text-[13.5px] text-ink-3 mt-1">Free forever. No credit card required.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-[12px] font-semibold text-ink-2 mb-1.5">Full name</label>
                <input {...register("name")} placeholder="Nguyen Van A"
                  className="w-full px-3 py-2 border border-line rounded-sm bg-white text-[13.5px] text-ink-1 placeholder-ink-3 focus:outline-none focus:border-ink-1 transition-colors" />
                {errors.name && <p className="text-[11.5px] text-ink-3 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink-2 mb-1.5">Email</label>
                <input {...register("email")} type="email" placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-line rounded-sm bg-white text-[13.5px] text-ink-1 placeholder-ink-3 focus:outline-none focus:border-ink-1 transition-colors" />
                {errors.email && <p className="text-[11.5px] text-ink-3 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink-2 mb-1.5">Password</label>
                <input {...register("password")} type="password" placeholder="8+ chars, 1 uppercase, 1 symbol"
                  className="w-full px-3 py-2 border border-line rounded-sm bg-white text-[13.5px] text-ink-1 placeholder-ink-3 focus:outline-none focus:border-ink-1 transition-colors" />
                {errors.password && <p className="text-[11.5px] text-ink-3 mt-1">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full py-2.5 mt-1 rounded-sm text-[13px] font-medium bg-ink-1 text-white hover:bg-[#2A2A2A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {isSubmitting ? "Creating account..." : "Create free account"}
              </button>
            </form>

            <p className="text-center text-[13px] text-ink-3 mt-5">
              Already have an account?{" "}
              <Link to="/login" className="text-ink-1 font-medium underline underline-offset-[3px]">Sign in</Link>
            </p>

            <div className="mt-8 pt-5 border-t border-line">
              <p className="text-[11.5px] text-ink-3 text-center leading-relaxed">
                By creating an account you agree to our{" "}
                <span className="underline underline-offset-[2px] cursor-pointer">Terms of Service</span>
                {" "}and{" "}
                <span className="underline underline-offset-[2px] cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
