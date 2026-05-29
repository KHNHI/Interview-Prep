import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

const NAV_LINKS = [
  { to: "/questions",     label: "Q&A"           },
  { to: "/system-design", label: "System Design"  },
  { to: "/pricing",       label: "Pricing"        },
];

export default function Navbar() {
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 h-14 bg-sidebar border-b border-white/[0.07] flex items-center px-8">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <span className="text-[14px] font-bold text-white tracking-tight">InterviewPrep</span>
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-0.5 ml-10">
        {NAV_LINKS.map(l => (
          <Link key={l.to} to={l.to}
            className="px-3.5 py-1.5 text-[13px] font-medium text-white/60 hover:text-white/95 rounded-md hover:bg-white/[0.055] transition-all duration-100">
            {l.label}
          </Link>
        ))}
      </nav>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2">
        {accessToken ? (
          <button
            onClick={() => navigate("/dashboard")}
            className="px-3.5 py-1.5 rounded-sm text-[13px] font-medium bg-white text-ink-1 hover:bg-[#F0F0F0] transition-colors">
            Go to app →
          </button>
        ) : (
          <>
            <Link to="/login"
              className="px-3.5 py-1.5 text-[13px] font-medium text-white/60 hover:text-white/95 transition-colors">
              Sign in
            </Link>
            <Link to="/register"
              className="px-3.5 py-1.5 rounded-sm text-[13px] font-medium bg-white text-ink-1 hover:bg-[#F0F0F0] transition-colors">
              Get started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
