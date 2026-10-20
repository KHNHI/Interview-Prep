import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth.api";
import { useAuthStore } from "../../stores/authStore";
import { AuthLayout } from "./AuthLayout";
import { PasswordInput } from "./PasswordInput";
import { ResendVerification } from "./ResendVerification";
import { authErrorMessage } from "./authErrors";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  async function onSubmit(data: FormData) {
    clearErrors("root");
    setUnverifiedEmail(null);
    try {
      const res = await authApi.login(data.email, data.password);
      const { accessToken, userId } = res.data.data;
      localStorage.setItem("access_token", accessToken);
      setAuth(accessToken, userId);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setUnverifiedEmail(data.email);
      } else {
        setError("root", {
          message: authErrorMessage(error, "Email or password is incorrect."),
        });
      }
    }
  }

  return (
    <AuthLayout>
      <p className="auth-kicker">Your workspace</p>
      <h1>Sign in</h1>
      <p className="auth-description">Continue where you left off.</p>
      <form
        className="auth-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-busy={isSubmitting}
      >
        <div className="auth-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            {...register("email")}
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-error" : undefined}
          />
          {errors.email && (
            <p id="login-email-error" className="auth-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="auth-field">
          <label htmlFor="login-password">Password</label>
          <PasswordInput
            id="login-password"
            {...register("password")}
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
            }
          />
          {errors.password && (
            <p id="login-password-error" className="auth-error" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>
        {errors.root && (
          <p className="auth-error" role="alert">
            {errors.root.message}
          </p>
        )}
        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      {unverifiedEmail && (
        <div className="auth-notice" role="status">
          <p>Verify your email before signing in.</p>
          <ResendVerification key={unverifiedEmail} email={unverifiedEmail} />
        </div>
      )}
      <p className="auth-switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
