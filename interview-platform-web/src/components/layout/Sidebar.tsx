import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
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
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => setMobileOpen(false), [pathname]);
  function signOut() {
    clearAuth();
    localStorage.removeItem("access_token");
    navigate("/");
  }
  return (
    <aside className={`workspace-sidebar ${collapsed ? "is-compact" : ""} ${mobileOpen ? "mobile-open" : ""}`}
      onKeyDown={event => {
        if (event.key === "Escape" && mobileOpen) {
          setMobileOpen(false); menuButton.current?.focus();
        }
      }}>
      <div className="sidebar-brand-row">
      <Link className="workspace-brand" to="/">
        <span className="desktop-brand">{collapsed ? "IP" : "InterviewPrep"}</span>
        <span className="mobile-brand">InterviewPrep</span>
      </Link>
      <button ref={menuButton} type="button" className="mobile-menu-toggle"
        aria-expanded={mobileOpen} aria-controls="study-navigation-panel"
        onClick={() => setMobileOpen(open => !open)}>{mobileOpen ? "Close menu" : "Menu"}</button>
      </div>
      <div id="study-navigation-panel" className="sidebar-content">
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
              <span className="desktop-brand">{collapsed ? short : label}</span>
              <span className="mobile-brand">{label}</span>
            </span>
          ) : (
            <NavLink key={to} to={to} title={label} onClick={() => setMobileOpen(false)}>
              <span className="desktop-brand">{collapsed ? short : label}</span>
              <span className="mobile-brand">{label}</span>
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
      </div>
    </aside>
  );
}
