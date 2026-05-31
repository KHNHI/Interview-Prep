import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "../../api/auth.api";
import { useAuthStore } from "../../stores/authStore";
import { Link, useNavigate } from "react-router-dom";

const schema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const setAuth  = useAuthStore(s => s.setAuth);
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data.email, data.password);
      setAuth(res.data.data.accessToken, res.data.data.userId);
      localStorage.setItem("access_token", res.data.data.accessToken);
      navigate("/dashboard");
    } catch {
      setError("password", { message: "Invalid email or password" });
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left dark panel */}
      <div className="w-[400px] bg-sidebar flex flex-col flex-shrink-0 px-10 py-12">
        <div className="mb-auto">
          <div className="text-[14px] font-bold text-white tracking-tight">InterviewPrep</div>
          <div className="text-[10.5px] text-white/30 mt-0.5">Engineering Mastery</div>
        </div>
        <blockquote className="text-[14px] leading-relaxed text-white/60 italic mb-5">
          "The preparation you put in today determines the opportunities you unlock tomorrow."
        </blockquote>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-[12px] font-semibold text-white">N</div>
          <div>
            <div className="text-[12.5px] font-medium text-white/80">Software Engineer</div>
            <div className="text-[11.5px] text-white/30">Joined InterviewPrep</div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-canvas px-6 py-10">
        <div className="w-full max-w-[360px]">
          <div className="mb-7">
            <h1 className="text-[22px] font-bold tracking-tight text-ink-1">Welcome back</h1>
            <p className="text-[13.5px] text-ink-3 mt-1">Sign in to continue your preparation.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[12px] font-semibold text-ink-2 mb-1.5">Email</label>
              <input {...register("email")} type="email" placeholder="you@example.com"
                className="w-full px-3 py-2 border border-line rounded-sm bg-white text-[13.5px] text-ink-1 placeholder-ink-3 focus:outline-none focus:border-ink-1 transition-colors" />
              {errors.email && <p className="text-[11.5px] text-ink-3 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-semibold text-ink-2">Password</label>
                <span className="text-[12px] text-ink-3 cursor-pointer hover:text-ink-2">Forgot password?</span>
              </div>
              <input {...register("password")} type="password" placeholder="••••••••"
                className="w-full px-3 py-2 border border-line rounded-sm bg-white text-[13.5px] text-ink-1 placeholder-ink-3 focus:outline-none focus:border-ink-1 transition-colors" />
              {errors.password && <p className="text-[11.5px] text-ink-3 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-2.5 mt-1 rounded-sm text-[13px] font-medium bg-ink-1 text-white hover:bg-[#2A2A2A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-[13px] text-ink-3 mt-5">
            No account?{" "}
            <Link to="/register" className="text-ink-1 font-medium underline underline-offset-[3px]">Create one free</Link>
          </p>

          <div className="mt-8 pt-5 border-t border-line flex justify-center gap-5">
            {["Terms", "Privacy", "Support"].map(l => (
              <span key={l} className="text-[11.5px] text-ink-3 cursor-pointer hover:text-ink-2 transition-colors">{l}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
