import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";

const CATEGORIES = ["All", "DSA", "Networking", "DB", "Cloud", "OS", "System Design"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy:   "bg-[#EFEFEF] text-[#3A3A3A]",
  Medium: "bg-[#E5E5E5] text-[#252525]",
  Hard:   "bg-[#DCDCDC] text-[#1A1A1A]",
};

const QUESTIONS = [
  { id: 1,  title: "Explain the differences between TCP and UDP.",          category: "Networking",    tags: ["Networking", "Protocols"],         difficulty: "Medium", isPro: false },
  { id: 2,  title: "Design a Rate Limiter",                                  category: "System Design", tags: ["System Design", "API"],             difficulty: "Hard",   isPro: false },
  { id: 3,  title: "Implement LRU Cache",                                    category: "DSA",           tags: ["DSA", "Hash Map", "Linked List"],   difficulty: "Medium", isPro: false },
  { id: 4,  title: "What is the CAP Theorem?",                               category: "DB",            tags: ["DB", "Distributed Systems"],        difficulty: "Easy",   isPro: false },
  { id: 5,  title: "AWS S3 vs EBS vs EFS — when to use which?",             category: "Cloud",         tags: ["Cloud", "Storage"],                 difficulty: "Easy",   isPro: false },
  { id: 6,  title: "Explain consistent hashing and its use cases.",          category: "System Design", tags: ["System Design", "Distributed"],     difficulty: "Hard",   isPro: true  },
  { id: 7,  title: "How does a B-Tree index work?",                          category: "DB",            tags: ["DB", "Index"],                      difficulty: "Medium", isPro: false },
  { id: 8,  title: "Difference between process and thread",                  category: "OS",            tags: ["OS", "Concurrency"],                difficulty: "Easy",   isPro: false },
  { id: 9,  title: "Implement a concurrent HashMap from scratch",            category: "DSA",           tags: ["DSA", "Concurrency"],               difficulty: "Hard",   isPro: true  },
  { id: 10, title: "Design a distributed message queue (Kafka)",             category: "System Design", tags: ["System Design", "Messaging"],       difficulty: "Hard",   isPro: true  },
  { id: 11, title: "What is a virtual DOM and how does React use it?",       category: "DSA",           tags: ["Frontend", "React"],                difficulty: "Easy",   isPro: false },
  { id: 12, title: "Explain ACID properties in databases",                   category: "DB",            tags: ["DB", "Transactions"],               difficulty: "Medium", isPro: false },
];

export function QuestionsPage() {
  const [cat, setCat]       = useState("All");
  const [diff, setDiff]     = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = QUESTIONS.filter(q => {
    const matchCat    = cat === "All" || q.category === cat;
    const matchDiff   = diff.length === 0 || diff.includes(q.difficulty);
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchDiff && matchSearch;
  });

  const toggleDiff = (d: string) =>
    setDiff(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Q&A Bank</h1>
          <p className="text-[13px] text-ink-3 mt-1">Master technical concepts with our curated question database.</p>
        </div>
        <div className="relative flex items-center flex-shrink-0">
          <svg width="14" height="14" className="absolute left-2.5 text-ink-3 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            className="pl-8 pr-3 py-1.5 border border-line rounded-sm bg-white text-[13px] text-ink-1 placeholder-ink-3 focus:outline-none focus:border-line-strong w-60"
            placeholder="Search questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[12px] font-medium text-ink-3 mr-1">Category:</span>
          {CATEGORIES.map(c => (
            <button key={c}
              onClick={() => setCat(c)}
              className={cn("px-3 py-1 rounded-full text-[12.5px] font-medium border transition-all duration-100",
                cat === c
                  ? "bg-ink-1 text-white border-ink-1"
                  : "bg-white text-ink-2 border-line hover:border-line-strong hover:text-ink-1"
              )}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-medium text-ink-3 mr-1">Difficulty:</span>
          {DIFFICULTIES.map(d => (
            <button key={d}
              onClick={() => toggleDiff(d)}
              className={cn("px-3 py-1 rounded-full text-[12.5px] font-medium border transition-all duration-100",
                diff.includes(d)
                  ? "bg-ink-1 text-white border-ink-1"
                  : "bg-white text-ink-2 border-line hover:border-line-strong hover:text-ink-1"
              )}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-line rounded shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-line">
          <span className="text-[12px] text-ink-3">{filtered.length} questions</span>
        </div>
        {filtered.map((q) => (
          <div key={q.id}
            onClick={() => navigate(`/questions/${q.id}`)}
            className="flex items-center px-5 py-3.5 border-b border-line last:border-b-0 gap-3 cursor-pointer hover:bg-surface-alt transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-medium text-[13.5px] text-ink-1">{q.title}</span>
                {q.isPro && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-semibold bg-ink-1 text-white">Pro</span>
                )}
              </div>
              <div className="flex gap-1 flex-wrap">
                {q.tags.map(t => (
                  <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#F0F0F0] text-[#555]">{t}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-semibold", DIFFICULTY_STYLE[q.difficulty])}>
                {q.difficulty}
              </span>
              <button
                className="px-2.5 py-1 rounded-sm text-[12px] font-medium text-ink-2 hover:bg-canvas hover:text-ink-1 transition-colors"
                onClick={e => { e.stopPropagation(); navigate(`/questions/${q.id}`); }}>
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-1.5">
        {[1, 2, 3, "...", 12].map((p, i) => (
          <button key={i}
            className={cn("min-w-[32px] px-2.5 py-1 rounded-sm text-[12px] font-medium border transition-colors",
              p === 1
                ? "bg-ink-1 text-white border-ink-1"
                : "bg-canvas text-ink-1 border-line-strong hover:bg-[#EAEAEA]"
            )}>
            {p}
          </button>
        ))}
        <button className="px-2.5 py-1 rounded-sm text-[12px] font-medium bg-canvas text-ink-1 border border-line-strong hover:bg-[#EAEAEA] transition-colors">
          ›
        </button>
      </div>
    </div>
  );
}
