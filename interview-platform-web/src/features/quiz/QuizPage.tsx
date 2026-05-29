import { useState, useEffect } from "react";
import { cn } from "../../utils/cn";

const QUESTIONS = [
  {
    id: 1, category: "System Design",
    question: "How do you ensure data consistency in a distributed microservices architecture when dealing with concurrent transactions?",
    context: "Consider a scenario where multiple independent services need to update their respective databases as part of a single logical user action (e.g., placing an e-commerce order, reserving inventory, and processing payment).",
    code: "Service A (Order) → Service B (Inventory) → Service C (Payment)",
    options: [
      { id: "a", label: "Two-Phase Commit (2PC)",      desc: "Use a coordinator to enforce immediate consistency across all participating databases, ensuring ACID properties globally." },
      { id: "b", label: "Saga Pattern",                desc: "Implement local transactions with compensating actions to handle failures, aiming for eventual consistency without locking." },
      { id: "c", label: "Shared Database",             desc: "Consolidate all microservice schemas into a single monolithic database cluster to leverage built-in relational transactions." },
      { id: "d", label: "Synchronous Orchestration",   desc: "Rely on chained synchronous REST calls with aggressive retry policies and long timeouts to ensure all updates succeed sequentially." },
    ],
    correct: "b",
    explanation: "The Saga Pattern is the industry standard for distributed transactions in microservices. It avoids distributed locks while maintaining eventual consistency through compensating transactions.",
  },
  {
    id: 2, category: "DSA",
    question: "What is the time complexity of searching in a balanced binary search tree?",
    context: null, code: null,
    options: [
      { id: "a", label: "O(1)",       desc: "Constant time — doesn't depend on the number of elements." },
      { id: "b", label: "O(n)",       desc: "Linear time — must visit every node in the worst case." },
      { id: "c", label: "O(log n)",   desc: "Logarithmic time — the height of a balanced BST is log n." },
      { id: "d", label: "O(n log n)", desc: "Typically associated with efficient sorting algorithms." },
    ],
    correct: "c",
    explanation: "In a balanced BST (e.g., AVL, Red-Black Tree), the height is O(log n), so search, insert, and delete all run in O(log n) time.",
  },
];

export function QuizPage() {
  const [current,  setCurrent]  = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);
  const total = 10;
  const q = QUESTIONS[current % QUESTIONS.length];

  useEffect(() => { setSelected(null); setRevealed(false); }, [current]);
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const pct  = (current / total) * 100;

  return (
    <div className="flex flex-col gap-0 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-bold tracking-tight">Quiz Session</h1>
          <p className="text-[12px] text-ink-3 mt-0.5">System Design · Mixed difficulty</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[12px] font-medium text-ink-3">
            Question <strong className="text-ink-1">{Math.min(current + 1, total)}</strong> / {total}
          </span>
          <div className="flex items-center gap-1.5 bg-white border border-line rounded-md px-2.5 py-1.5">
            <svg width="13" height="13" className="text-ink-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span className="font-mono text-[13px] font-medium text-ink-1">{mins}:{secs}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-line rounded-full overflow-hidden mb-5">
        <div className="h-full bg-ink-1 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-2 gap-5 flex-1">
        {/* Left — question */}
        <div className="flex flex-col gap-3.5">
          <div className="bg-white border border-line rounded shadow-card p-5 flex-1">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-semibold bg-[#E5E5E5] text-[#252525] mb-3">
              {q.category}
            </span>
            <p className="text-[15px] font-semibold leading-snug text-ink-1 mb-3.5">{q.question}</p>
            {q.context && <p className="text-[13px] text-ink-2 leading-relaxed mb-3.5">{q.context}</p>}
            {q.code && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-label text-ink-3 mb-1.5">Architecture Context</div>
                <pre className="bg-[#F4F4F4] border border-line rounded-md px-3.5 py-2.5 text-[12px] font-mono text-ink-1 overflow-x-auto">
                  {q.code}
                </pre>
              </div>
            )}
          </div>
          {revealed && (
            <div className="bg-white border-l-2 border-l-ink-1 border border-line rounded shadow-card px-5 py-4">
              <div className="text-[10px] font-semibold uppercase tracking-label text-ink-3 mb-1.5">Explanation</div>
              <p className="text-[13px] text-ink-2 leading-relaxed">{q.explanation}</p>
            </div>
          )}
        </div>

        {/* Right — options */}
        <div className="flex flex-col gap-2.5">
          {q.options.map(opt => {
            const isSelected = selected === opt.id;
            const isCorrect  = revealed && opt.id === q.correct;
            const isWrong    = revealed && isSelected && opt.id !== q.correct;
            return (
              <div key={opt.id}
                onClick={() => !revealed && setSelected(opt.id)}
                className={cn(
                  "flex items-start gap-3 p-3.5 border-[1.5px] rounded cursor-pointer transition-all",
                  isCorrect  ? "border-ink-1 bg-[#F5F5F5]" :
                  isWrong    ? "border-line-strong opacity-60" :
                  isSelected ? "border-ink-1 bg-surface-alt" :
                               "border-line bg-white hover:border-line-strong"
                )}>
                <div className={cn(
                  "w-[18px] h-[18px] rounded-full border-[1.5px] flex-shrink-0 mt-0.5 flex items-center justify-center transition-all",
                  isSelected ? "border-ink-1 bg-ink-1" : "border-line-strong"
                )}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[13px] text-ink-1 mb-1">
                    {opt.label}
                    {isCorrect && <span className="ml-2 text-[11px] font-medium text-ink-2">✓ Correct</span>}
                  </div>
                  <div className="text-[12.5px] text-ink-2 leading-relaxed">{opt.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line mt-5 pt-4 flex items-center justify-between">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-[13px] font-medium bg-canvas text-ink-1 border border-line-strong hover:bg-[#EAEAEA] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Previous
        </button>
        <span className="text-[12.5px] text-ink-3">
          {!selected ? "Select an answer" : !revealed ? "Click 'Check' to see the answer" : "Explanation shown"}
        </span>
        {!revealed ? (
          <button onClick={() => selected && setRevealed(true)} disabled={!selected}
            className="px-3.5 py-1.5 rounded-sm text-[13px] font-medium bg-ink-1 text-white hover:bg-[#2A2A2A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Check Answer
          </button>
        ) : (
          <button onClick={() => setCurrent(c => c + 1)}
            className="px-3.5 py-1.5 rounded-sm text-[13px] font-medium bg-ink-1 text-white hover:bg-[#2A2A2A] transition-colors">
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
