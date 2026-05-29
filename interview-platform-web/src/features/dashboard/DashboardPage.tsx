import { useMemo } from "react";

const STATS = [
  { label: "Questions Solved", value: "243", delta: "+12 this week",            icon: "◇" },
  { label: "Current Streak",   value: "14 Days", delta: "Personal best: 21 days", icon: "◈" },
  { label: "Avg Accuracy",     value: "87%",   delta: "↑ 3% from last month",   icon: "◎", bar: 87 },
  { label: "Readiness Score",  value: "8.2",   delta: "Ready for mock interviews", icon: "◉" },
];

const QUICK_ACTIONS = [
  { label: "Mock Interview",     sub: "45 min timed session"   },
  { label: "Progress Report",   sub: "View detailed analytics" },
  { label: "Flashcards Review", sub: "28 cards due today"      },
  { label: "Daily Challenge",   sub: "New challenge available" },
];

function generateHeatmap() {
  return Array.from({ length: 36 }, () =>
    Array.from({ length: 7 }, () => {
      const r = Math.random();
      return r < 0.35 ? 0 : r < 0.55 ? 1 : r < 0.72 ? 2 : r < 0.87 ? 3 : 4;
    })
  );
}
const HEATMAP_DATA = generateHeatmap();

export function DashboardPage() {
  const heatmap = useMemo(() => HEATMAP_DATA, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Page title */}
      <div>
        <h1 className="text-[22px] font-bold tracking-tight">Dashboard</h1>
        <p className="text-[13px] text-ink-3 mt-1">Good morning — here's your progress overview.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3.5">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white border border-line rounded shadow-card px-5 py-[18px]">
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-label text-ink-3">
              <span className="text-[13px] opacity-50">{s.icon}</span>
              {s.label}
            </div>
            <div className="text-[30px] font-bold tracking-tight text-ink-1 mt-2 leading-none">{s.value}</div>
            {s.bar !== undefined && (
              <div className="mt-2.5 h-1 bg-line rounded-full overflow-hidden w-4/5">
                <div className="h-full bg-ink-1 rounded-full" style={{ width: `${s.bar}%` }} />
              </div>
            )}
            <div className="text-[11.5px] text-ink-3 mt-1.5">{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-[1fr_320px] gap-5">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Heatmap */}
          <div className="bg-white border border-line rounded shadow-card">
            <div className="px-5 py-3.5 border-b border-line flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink-1 flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Activity History
              </span>
              <span className="text-[11.5px] text-ink-3">Last 36 weeks</span>
            </div>
            <div className="px-5 pt-4 pb-5">
              <div className="flex gap-[3px] overflow-x-auto">
                {heatmap.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((lvl, di) => (
                      <div key={di} className={`hm-cell${lvl > 0 ? ` l${lvl}` : ""}`} />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mt-2.5 justify-end">
                <span className="text-[11px] text-ink-3">Less</span>
                {[0,1,2,3,4].map(l => <div key={l} className={`hm-cell${l > 0 ? ` l${l}` : ""}`} style={{ width:10, height:10 }} />)}
                <span className="text-[11px] text-ink-3">More</span>
              </div>
            </div>
          </div>

          {/* Continue learning */}
          <div className="bg-white border border-line rounded shadow-card">
            <div className="px-5 py-3.5 border-b border-line flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink-1">Continue Learning</span>
              <span className="text-[12px] text-ink-3">Pick up where you paused</span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3.5 p-3.5 border border-line rounded bg-surface-alt">
                <div className="w-[38px] h-[38px] rounded-lg bg-ink-1 text-white flex items-center justify-center text-[14px] font-bold flex-shrink-0">A</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-label text-ink-3 mb-0.5">System Design</div>
                  <div className="font-semibold text-[13.5px] truncate">Microservices Architecture</div>
                  <div className="text-[11.5px] text-ink-3 mt-0.5">Module 4 of 12 · 45 mins left</div>
                  <div className="mt-2 h-1 bg-line rounded-full overflow-hidden">
                    <div className="h-full bg-ink-1 rounded-full w-1/3" />
                  </div>
                </div>
                <button className="flex-shrink-0 px-3 py-1.5 rounded-sm bg-ink-1 text-white text-[12px] font-medium hover:bg-[#2A2A2A] transition-colors">
                  Resume
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-line rounded shadow-card h-fit">
          <div className="px-5 py-3.5 border-b border-line">
            <span className="text-[13px] font-semibold text-ink-1">Quick Actions</span>
          </div>
          <div className="p-3.5 flex flex-col gap-2">
            {QUICK_ACTIONS.map((a) => (
              <div key={a.label} className="flex items-center justify-between px-3.5 py-3 border border-line rounded cursor-pointer hover:border-ink-1 bg-white transition-colors gap-3">
                <div>
                  <div className="font-medium text-[13px] text-ink-1">{a.label}</div>
                  <div className="text-[11.5px] text-ink-3 mt-0.5">{a.sub}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-3 flex-shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-line pt-4 flex items-center justify-between">
        <span className="text-[11.5px] text-ink-3">© 2024 InterviewPrep. All rights reserved.</span>
        <div className="flex gap-4">
          {["Terms of Service", "Privacy Policy", "Contact Support"].map(l => (
            <span key={l} className="text-[11.5px] text-ink-3 cursor-pointer hover:text-ink-2 transition-colors">{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
