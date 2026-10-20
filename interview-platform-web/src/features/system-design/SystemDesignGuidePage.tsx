import { useNavigate } from "react-router-dom";

const STEPS = [
  {
    n: 1,
    title: "Clarify requirements & scope",
    time: "~5 min",
    points: [
      "Ask questions before designing — never assume. Who are the users and what are the core use cases?",
      "Separate functional requirements (what it does) from non-functional ones (scale, latency, availability).",
      "Explicitly state what is out of scope so you don't boil the ocean.",
    ],
  },
  {
    n: 2,
    title: "Estimate the scale",
    time: "~5 min",
    points: [
      "Do back-of-the-envelope math: daily active users, reads/sec, writes/sec, storage, bandwidth.",
      "Identify the read:write ratio — it drives most architectural decisions (caching, replication).",
      "Round aggressively. The goal is the right order of magnitude, not precision.",
    ],
  },
  {
    n: 3,
    title: "Define the API",
    time: "~5 min",
    points: [
      "List the core endpoints (e.g. createX, getX) with their inputs and outputs.",
      "This nails down the contract before you design internals and keeps the discussion concrete.",
      "Prefer simple REST signatures unless the problem calls for streaming or RPC.",
    ],
  },
  {
    n: 4,
    title: "Design the data model",
    time: "~5 min",
    points: [
      "Identify the main entities and their relationships.",
      "Decide SQL vs NoSQL based on access patterns, not hype — joins & transactions vs scale & flexibility.",
      "Think about the primary key / partition key early; it determines how you shard later.",
    ],
  },
  {
    n: 5,
    title: "Sketch the high-level design",
    time: "~10 min",
    points: [
      "Draw the major components: clients, load balancer, services, databases, caches, queues.",
      "Trace a request end-to-end for each core use case (the write path and the read path).",
      "Keep it simple first — get a working skeleton before optimizing.",
    ],
  },
  {
    n: 6,
    title: "Deep dive into key components",
    time: "~10 min",
    points: [
      "Pick the 1-2 most interesting/critical parts and go deep (the interviewer will steer you).",
      "Show how you'd scale a bottleneck: caching, sharding, replication, async processing.",
      "Discuss concrete algorithms or data structures where relevant.",
    ],
  },
  {
    n: 7,
    title: "Identify bottlenecks & trade-offs",
    time: "~5 min",
    points: [
      "Name the single points of failure and how you'd remove them.",
      "Discuss consistency vs availability (CAP) for your datastore choices.",
      "Be explicit about trade-offs — there is no perfect design, only the right one for the constraints.",
    ],
  },
];

const PILLARS = [
  { label: "Scalability", desc: "Horizontal scaling, load balancing, sharding, stateless services." },
  { label: "Availability", desc: "Replication, failover, redundancy, no single point of failure." },
  { label: "Performance", desc: "Caching, CDNs, indexes, async/queues to cut latency." },
  { label: "Consistency", desc: "Strong vs eventual; pick per the domain's tolerance for staleness." },
];

export function SystemDesignGuidePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-[840px] flex flex-col gap-6">
      {/* Back */}
      <button onClick={() => navigate("/system-design")}
        className="self-start flex items-center gap-1.5 px-2 py-1 rounded-sm text-[13px]
                   font-medium text-ink-2 hover:bg-canvas hover:text-ink-1 transition-colors -ml-1">

        Back to System Design
      </button>

      {/* Hero */}
      <div className="bg-sidebar rounded-lg px-8 py-7 text-white">
        <div className="text-[10.5px] font-semibold uppercase tracking-label text-white/40 mb-2">
          Interview Framework
        </div>
        <h1 className="text-[24px] font-bold tracking-tight mb-2">How to approach a system design interview</h1>
        <p className="text-[13.5px] text-white/60 leading-relaxed max-w-[620px]">
          A repeatable, structured method that works for almost any design question.
          Follow these seven steps in order — they keep you organized, surface the right
          trade-offs, and show the interviewer how you think.
        </p>
      </div>

      {/* The 7 steps */}
      <div className="flex flex-col gap-3.5">
        {STEPS.map(s => (
          <div key={s.n} className="bg-white border border-line rounded shadow-card px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-ink-1 text-white flex items-center
                              justify-center text-[14px] font-bold">
                {s.n}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h2 className="text-[15px] font-semibold text-ink-1 tracking-tight">{s.title}</h2>
                  <span className="flex-shrink-0 text-[11px] font-medium text-ink-3 bg-canvas
                                   border border-line rounded-sm px-2 py-0.5">{s.time}</span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {s.points.map((p, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-ink-2 leading-relaxed">
                      <span className="text-ink-3 flex-shrink-0 mt-0.5">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pillars */}
      <div className="bg-white border border-line rounded shadow-card px-6 py-5">
        <h2 className="text-[15px] font-semibold text-ink-1 mb-1">The four pillars to keep in mind</h2>
        <p className="text-[12.5px] text-ink-3 mb-4">Tie your decisions back to these throughout the interview.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PILLARS.map(p => (
            <div key={p.label} className="border border-line rounded p-3.5 bg-surface-alt">
              <div className="text-[13px] font-semibold text-ink-1 mb-1">{p.label}</div>
              <div className="text-[12px] text-ink-2 leading-relaxed">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white border border-line rounded shadow-card px-6 py-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-[14px] font-semibold text-ink-1">See the framework in action</div>
          <div className="text-[12.5px] text-ink-3 mt-0.5">Read worked examples that follow these exact steps.</div>
        </div>
        <button onClick={() => navigate("/system-design")}
          className="flex-shrink-0 px-4 py-2 rounded-sm text-[13px] font-medium bg-ink-1 text-white
                     hover:bg-[#3b614e] transition-colors">
          Browse cases
        </button>
      </div>
    </div>
  );
}
