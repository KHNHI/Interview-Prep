import { useLocation } from "react-router-dom";

const ROUTE_LABELS: Record<string, string[]> = {
  "/dashboard":     ["Home", "Dashboard"],
  "/questions":     ["Home", "Q&A Bank"],
  "/quiz":          ["Home", "Quizzes"],
  "/flashcard":     ["Home", "Flashcards"],
  "/system-design": ["Home", "System Design"],
  "/progress":      ["Home", "Analytics"],
  "/pricing":       ["Home", "Pricing"],
};

export default function Header() {
  const { pathname } = useLocation();
  const base = "/" + pathname.split("/")[1];
  const crumbs = ROUTE_LABELS[base] ?? ["Home"];

  return (
    <header className="h-[52px] bg-white border-b border-line flex items-center px-8 gap-2 flex-shrink-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="opacity-50">›</span>}
            <span className={i === crumbs.length - 1 ? "text-ink-1 font-medium" : ""}>{c}</span>
          </span>
        ))}
      </nav>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-1.5">
        <button className="text-[11px] font-semibold tracking-[0.04em] px-2 py-1 rounded-sm border border-line text-ink-2 hover:border-ink-1 hover:text-ink-1 transition-all duration-100">
          EN/VI
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-md text-ink-3 hover:bg-canvas hover:text-ink-1 transition-all duration-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
        <div className="w-7 h-7 rounded-full bg-ink-1 text-white text-[11px] font-semibold flex items-center justify-center cursor-pointer select-none">
          N
        </div>
      </div>
    </header>
  );
}
