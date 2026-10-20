import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Link } from "react-router-dom";
import { authApi } from "../../api/auth.api";
import { AuthLayout } from "./AuthLayout";
import { PasswordInput } from "./PasswordInput";
import { ResendVerification } from "./ResendVerification";
import { authErrorMessage } from "./authErrors";

const schema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .regex(/[A-Z]/, "Add an uppercase letter.")
    .regex(/[^A-Za-z0-9]/, "Add a symbol."),
});
type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const password = watch("password");

  async function onSubmit(data: FormData) {
    clearErrors("root");
    try {
      const res = await authApi.register(data.email, data.name, data.password);
      setSubmittedEmail(res.data.data.email);
    } catch (error) {
      setError("root", {
        message:
          axios.isAxiosError(error) && error.response?.status === 401
            ? "This email is already registered. Sign in instead."
            : authErrorMessage(
                error,
                "Could not create your account. Please try again.",
              ),
      });
    }
  }

  if (submittedEmail)
    return (
      <AuthLayout>
        <p className="auth-kicker">One more step</p>
        <h1>Check your email</h1>
        <p className="auth-description">
          Open the verification link for{" "}
          <span className="auth-email">{submittedEmail}</span> to activate your
          account. Check spam if it has not arrived.
        </p>
        <ResendVerification email={submittedEmail} />
        <p className="auth-switch">
          <Link to="/login">Back to sign in</Link>
        </p>
      </AuthLayout>
    );

  return (
    <AuthLayout>
      <p className="auth-kicker">Your workspace</p>
      <h1>Create an account</h1>
      <p className="auth-description">
        Save your practice and track your progress.
      </p>
      <form
        className="auth-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-busy={isSubmitting}
      >
        <div className="auth-field">
          <label htmlFor="register-name">Name</label>
          <input
            id="register-name"
            {...register("name")}
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "register-name-error" : undefined}
          />
          {errors.name && (
            <p id="register-name-error" className="auth-error" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="auth-field">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            {...register("email")}
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "register-email-error" : undefined}
          />
          {errors.email && (
            <p id="register-email-error" className="auth-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="auth-field">
          <label htmlFor="register-password">Password</label>
          <PasswordInput
            id="register-password"
            {...register("password")}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={`password-requirements${errors.password ? " register-password-error" : ""}`}
          />
          <div id="password-requirements" className="auth-requirements">
            <span data-met={password.length >= 8}>8+ characters</span>
            <span data-met={/[A-Z]/.test(password)}>One uppercase letter</span>
            <span data-met={/[^A-Za-z0-9]/.test(password)}>One symbol</span>
          </div>
          {errors.password && (
            <p id="register-password-error" className="auth-error" role="alert">
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
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="auth-switch">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
