import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useAuthStore } from "../../stores/authStore";

const NAV = [
  { to: "/dashboard",     label: "Dashboard",     icon: <GridIcon />,  requiresAuth: true  },
  { to: "/questions",     label: "Q&A Bank",       icon: <BookIcon />,  requiresAuth: false },
  { to: "/quiz",          label: "Quizzes",        icon: <QuizIcon />,  requiresAuth: false },
  { to: "/flashcard",     label: "Flashcards",     icon: <CardIcon />,  requiresAuth: true  },
  { to: "/system-design", label: "System Design",  icon: <ArchIcon />,  requiresAuth: false },
  { to: "/progress",      label: "Analytics",      icon: <ChartIcon />, requiresAuth: true  },
];

const BOTTOM_NAV = [
  { to: "/pricing", label: "Upgrade", icon: <StarIcon /> },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle:  () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { clearAuth, accessToken } = useAuthStore();
  const navigate = useNavigate();
  const isGuest  = !accessToken;

  const handleSignOut = () => {
    clearAuth();
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <aside className={cn(
      "bg-sidebar flex flex-col flex-shrink-0 overflow-y-auto overflow-x-hidden transition-[width] duration-200",
      collapsed ? "w-[56px]" : "w-[228px]"
    )}>
      {/* Brand + toggle */}
      <div className={cn(
        "border-b border-white/[0.07] flex items-center gap-2 flex-shrink-0",
        collapsed ? "px-3 py-5 justify-center" : "px-[18px] pt-5 pb-4"
      )}>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold text-white tracking-tight">InterviewPrep</div>
            <div className="text-[10.5px] text-white/30 mt-0.5">Engineering Mastery</div>
          </div>
        )}
        <button
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-6 h-6 flex items-center justify-center rounded-md text-white/40
                     hover:bg-white/10 hover:text-white/80 transition-all duration-100 flex-shrink-0"
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      {/* Nav */}
      <nav className="p-2 flex-1">
        {!collapsed && (
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.09em] text-white/30 px-2.5 pt-3.5 pb-1.5">
            Menu
          </div>
        )}
        {collapsed && <div className="pt-3" />}

        {NAV.map(item => {
          const locked = isGuest && item.requiresAuth;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center py-[7px] rounded-md text-[13px] mb-px transition-all duration-100",
                  collapsed ? "justify-center px-0" : "gap-2.5 px-2.5",
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : locked
                    ? "text-white/40 hover:bg-white/[0.04] hover:text-white/55 cursor-pointer"
                    : "text-white/[0.78] hover:bg-white/[0.055] hover:text-white/95"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Icon with optional lock badge */}
                  <span className={cn(
                    "relative flex-shrink-0 transition-opacity",
                    isActive ? "opacity-100" : locked ? "opacity-40" : "opacity-65"
                  )}>
                    {item.icon}
                    {locked && collapsed && (
                      <span className="absolute -top-0.5 -right-0.5 w-[9px] h-[9px] rounded-full bg-sidebar
                                        flex items-center justify-center">
                        <LockTinyIcon />
                      </span>
                    )}
                  </span>

                  {/* Label + lock icon (expanded only) */}
                  {!collapsed && (
                    <span className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="truncate">{item.label}</span>
                      {locked && <LockTinyIcon className="text-white/30 flex-shrink-0" />}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {!collapsed && (
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.09em] text-white/30 px-2.5 pt-5 pb-1.5">
            Account
          </div>
        )}
        {collapsed && <div className="pt-4" />}

        {BOTTOM_NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center py-[7px] rounded-md text-[13px] mb-px transition-all duration-100",
                collapsed ? "justify-center px-0" : "gap-2.5 px-2.5",
                isActive
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/[0.78] hover:bg-white/[0.055] hover:text-white/95"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn("flex-shrink-0 transition-opacity", isActive ? "opacity-100" : "opacity-65")}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-white/[0.07]">
        <button
          onClick={isGuest ? () => navigate("/login") : handleSignOut}
          title={collapsed ? (isGuest ? "Sign in" : "Sign out") : undefined}
          className={cn(
            "flex items-center py-[7px] rounded-md text-[13px] w-full transition-all duration-100",
            collapsed ? "justify-center px-0" : "gap-2.5 px-2.5",
            "text-white/[0.78] hover:bg-white/[0.055] hover:text-white/95"
          )}
        >
          <span className="opacity-65 flex-shrink-0">
            <SignOutIcon />
          </span>
          {!collapsed && <span>{isGuest ? "Sign in" : "Sign out"}</span>}
        </button>
      </div>
    </aside>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function ChevronLeftIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}
function LockTinyIcon({ className }: { className?: string }) {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
function GridIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function BookIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}
function QuizIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function CardIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
}
function ArchIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}
function ChartIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
}
function StarIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function SignOutIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
