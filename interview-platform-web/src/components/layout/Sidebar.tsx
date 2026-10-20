import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
const NAV = [
  ["/questions", "Question bank", "QA"],
  ["/quiz", "Quizzes", "QZ"],
  ["/system-design", "System design", "SD"],
  ["/flashcard", "Flashcards", "FC"],
  ["/dashboard", "Dashboard", "DB"],
  ["/progress", "Your progress", "PG"],
];
const PERSONAL_ROUTES = new Set(["/flashcard", "/dashboard", "/progress"]);
export default function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { accessToken, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  function signOut() {
    clearAuth();
    localStorage.removeItem("access_token");
    navigate("/");
  }
  return (
    <aside className={`workspace-sidebar ${collapsed ? "is-compact" : ""}`}>
      <Link className="workspace-brand" to="/">
        {collapsed ? "IP" : "InterviewPrep"}
      </Link>
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
      >
        {collapsed ? "Open" : "Compact view"}
      </button>
      <p className="sidebar-label">
        {collapsed ? "Study" : "Your study space"}
      </p>
      <nav aria-label="Study navigation">
        {NAV.map(([to, label, short]) =>
          !accessToken && PERSONAL_ROUTES.has(to) ? (
            <span
              key={to}
              role="link"
              aria-disabled="true"
              aria-label={`${label} — sign in required`}
              aria-describedby="personal-nav-help"
              className="sidebar-disabled"
              title="Sign in to use this feature"
            >
              {collapsed ? short : label}
            </span>
          ) : (
            <NavLink key={to} to={to} title={label}>
              {collapsed ? short : label}
            </NavLink>
          ),
        )}
      </nav>
      {!accessToken && (
        <p
          id="personal-nav-help"
          className={collapsed ? "sr-only" : "sidebar-access-note"}
        >
          Sign in to use the greyed-out features.
        </p>
      )}
      {!collapsed && (
        <div className="sidebar-note">
          A personal project.
          <br />
          Free for everyone.
        </div>
      )}
      <button
        className="sidebar-account"
        onClick={accessToken ? signOut : () => navigate("/login")}
      >
        {accessToken ? "Sign out" : "Sign in"}
      </button>
    </aside>
  );
}
