import { useEffect, useState } from "react";
import { authApi } from "../../api/auth.api";
import { authErrorMessage } from "./authErrors";

export function ResendVerification({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!remaining) return;
    const timer = setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  async function resend() {
    setSending(true);
    setError("");
    setMessage("");
    try {
      await authApi.resendVerification(email);
      setMessage("New link requested. Check your inbox and spam folder.");
      setRemaining(60);
    } catch (err) {
      setError(
        authErrorMessage(
          err,
          "Could not request a new link. Please try again.",
        ),
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="auth-resend">
      <button
        type="button"
        onClick={resend}
        disabled={sending || remaining > 0}
      >
        {sending
          ? "Requesting…"
          : remaining
            ? `Resend available in ${remaining}s`
            : "Resend verification email"}
      </button>
      {message && <p role="status">{message}</p>}
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
