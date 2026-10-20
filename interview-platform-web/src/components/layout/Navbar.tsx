import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
export default function Navbar() {
  const token = useAuthStore((s) => s.accessToken);
  return (
    <header className="site-nav">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Link className="site-wordmark" to="/">
        InterviewPrep<span>Notes, practice & a little progress.</span>
      </Link>
      <nav aria-label="Main navigation">
        <NavLink to="/questions">Question bank</NavLink>
        <NavLink to="/quiz">Quizzes</NavLink>
        <NavLink to="/system-design">System design</NavLink>
      </nav>
      <Link className="nav-account" to={token ? "/dashboard" : "/login"}>
        {token ? "My workspace" : "Sign in"}
      </Link>
    </header>
  );
}
