import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./auth.css";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page">
      <header className="auth-header">
        <Link to="/" className="auth-wordmark">
          InterviewPrep
        </Link>
        <Link to="/questions">Browse questions</Link>
      </header>
      <main className="auth-main">
        <div className="auth-card">{children}</div>
      </main>
      <footer className="auth-footer">
        An independent learning project. Free for everyone.
      </footer>
    </div>
  );
}
