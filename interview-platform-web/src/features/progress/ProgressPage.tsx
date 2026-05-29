import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

const STATS = [
  { label: "Total Solved",    value: "342",  delta: "+12 this week",          icon: "</>" },
  { label: "Study Sessions",  value: "84",   delta: "45h total time",         icon: "◷"   },
  { label: "Retention Rate",  value: "92%",  delta: "Based on flashcards",    icon: "◎"   },
  { label: "Readiness Score", value: "86",   delta: "Ready for Tier 1",       icon: "◈",  highlight: true },
];

const RADAR_DATA = [
  { subject: "DSA",           current: 85, target: 95 },
  { subject: "System Design", current: 70, target: 90 },
  { subject: "OS",            current: 60, target: 80 },
  { subject: "Networking",    current: 75, target: 85 },
  { subject: "DBMS",          current: 68, target: 85 },
  { subject: "Soft Skills",   current: 55, target: 75 },
];

const FOCUS    = ["Dynamic Programming", "System Design: Scaling", "Graph Algorithms"];
const ACTIVITY = [
  { action: "Solved 'LRU Cache'",            time: "2 hours ago" },
  { action: "Completed a 6-quiz",            time: "Yesterday"   },
  { action: "Reviewed System Design notes",  time: "Oct 24"      },
  { action: "Solved 'Merge K Sorted Lists'", time: "Oct 23"      },
];

export function ProgressPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Analytics</h1>
          <p className="text-[13px] text-ink-3 mt-1">Track your skill growth and interview readiness.</p>
        </div>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[12px] font-medium bg-canvas text-ink-1 border border-line-strong hover:bg-[#EAEAEA] transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5">
        {STATS.map(s => (
          <div key={s.label} className={`bg-white border rounded shadow-card px-5 py-[18px] ${s.highlight ? "border-ink-1" : "border-line"}`}>
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-label text-ink-3">
              <span className="text-[13px] opacity-50">{s.icon}</span>
              {s.label}
            </div>
            <div className={`font-bold tracking-tight text-ink-1 mt-2 leading-none ${s.highlight ? "text-[40px]" : "text-[30px]"}`}>
              {s.value}
            </div>
            <div className="text-[11.5px] text-ink-3 mt-1.5">{s.delta}</div>
            {s.highlight && (
              <div className="mt-2 h-1 bg-line rounded-full overflow-hidden">
                <div className="h-full bg-ink-1 rounded-full" style={{ width: "86%" }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-[1fr_280px] gap-5">
        {/* Radar chart */}
        <div className="bg-white border border-line rounded shadow-card">
          <div className="px-5 py-3.5 border-b border-line flex items-center justify-between">
            <span className="text-[13px] font-semibold text-ink-1">Skill Proficiency</span>
            <div className="flex gap-4 text-[11.5px] text-ink-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-ink-1 inline-block" />Current Level
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full border border-[#999] inline-block" />Target Level
              </span>
            </div>
          </div>
          <div className="py-2">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={RADAR_DATA} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#E6E6E6" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#525252", fontFamily: "Onest, sans-serif" }} />
                <Radar name="Target"  dataKey="target"  stroke="#CCCCCC" fill="#F0F0F0" fillOpacity={0.4} strokeWidth={1.5} strokeDasharray="4 3" />
                <Radar name="Current" dataKey="current" stroke="#0F0F0F" fill="#0F0F0F" fillOpacity={0.12} strokeWidth={2} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E6E6E6", borderRadius: 6, fontSize: 12, fontFamily: "Onest, sans-serif" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side panels */}
        <div className="flex flex-col gap-3.5">
          {/* Recommended Focus */}
          <div className="bg-white border border-line rounded shadow-card flex-1">
            <div className="px-4 py-3.5 border-b border-line">
              <span className="text-[13px] font-semibold text-ink-1">Recommended Focus</span>
            </div>
            {FOCUS.map((f, i) => (
              <div key={f} className={`flex items-center px-4 py-2.5 gap-3 cursor-pointer hover:bg-surface-alt transition-colors ${i < FOCUS.length - 1 ? "border-b border-line" : ""}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-ink-3 flex-shrink-0" />
                <span className="flex-1 text-[13px] font-medium text-ink-1">{f}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-3"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-line rounded shadow-card flex-1">
            <div className="px-4 py-3.5 border-b border-line">
              <span className="text-[13px] font-semibold text-ink-1">Recent Activity</span>
            </div>
            {ACTIVITY.map((a, i) => (
              <div key={i} className={`flex gap-2.5 px-4 py-2.5 ${i < ACTIVITY.length - 1 ? "border-b border-line" : ""}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#DCDCDC] flex-shrink-0 mt-1.5" />
                <div>
                  <div className="text-[12.5px] font-medium text-ink-1">{a.action}</div>
                  <div className="text-[11.5px] text-ink-3 mt-0.5">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
