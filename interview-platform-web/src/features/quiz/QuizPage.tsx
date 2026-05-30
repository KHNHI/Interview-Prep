import { useState, useEffect, useRef } from "react";
import { cn } from "../../utils/cn";
import { quizApi, type QuizQuestionDto } from "../../api/quiz.api";

// ── Types ─────────────────────────────────────────────────────────────────────

type Screen = "setup" | "quiz" | "results";

type FilterCategory   = "All" | "DSA" | "Networking" | "DB" | "OS" | "Cloud";
type FilterDifficulty = "Mixed" | "Easy" | "Medium" | "Hard";

interface QuizConfig {
  category:    FilterCategory;
  difficulty:  FilterDifficulty;
  length:      number;
  timeSeconds: number;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const CATEGORIES:   FilterCategory[]   = ["All", "DSA", "Networking", "DB", "OS", "Cloud"];
const DIFFICULTIES: FilterDifficulty[] = ["Mixed", "Easy", "Medium", "Hard"];

const QUIZ_LENGTHS = [
  { value: 10, label: "10 Q", timeSeconds: 600,  timeLabel: "10 min" },
  { value: 15, label: "15 Q", timeSeconds: 900,  timeLabel: "15 min" },
  { value: 20, label: "20 Q", timeSeconds: 1200, timeLabel: "20 min" },
  { value: 25, label: "25 Q", timeSeconds: 1500, timeLabel: "25 min" },
] as const;

const DEFAULT_CONFIG: QuizConfig = {
  category:    "All",
  difficulty:  "Mixed",
  length:      15,
  timeSeconds: 900,
};

const DIFFICULTY_BADGE: Record<string, string> = {
  Easy:   "bg-[#EFEFEF] text-[#3A3A3A]",
  Medium: "bg-[#E5E5E5] text-[#252525]",
  Hard:   "bg-[#DCDCDC] text-[#1A1A1A]",
};

// ── Main component ────────────────────────────────────────────────────────────

export function QuizPage() {
  const [screen,    setScreen]    = useState<Screen>("setup");
  const [config,    setConfig]    = useState<QuizConfig>(DEFAULT_CONFIG);
  const [questions, setQuestions] = useState<QuizQuestionDto[]>([]);
  const [current,   setCurrent]   = useState(0);
  const [answers,   setAnswers]   = useState<(string | null)[]>([]);
  const [timeLeft,  setTimeLeft]  = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function startQuiz() {
    setLoading(true);
    setError(null);
    try {
      const res = await quizApi.getQuestions({
        category:   config.category !== "All" ? config.category : undefined,
        difficulty: config.difficulty !== "Mixed" ? config.difficulty : undefined,
        count:      config.length,
      });
      const qs = res.data.data;
      if (qs.length === 0) {
        setError("No questions found for this combination. Try a different filter.");
        return;
      }
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(null));
      setCurrent(0);
      setTimeLeft(config.timeSeconds);
      setScreen("quiz");
    } catch {
      setError("Failed to load questions. Make sure the API is running.");
    } finally {
      setLoading(false);
    }
  }

  function submitQuiz() {
    if (timerRef.current) clearInterval(timerRef.current);
    setScreen("results");
  }

  // Timer countdown
  useEffect(() => {
    if (screen !== "quiz") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setScreen("results");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [screen]);

  function selectAnswer(optionId: string) {
    setAnswers(prev => {
      const next = [...prev];
      next[current] = optionId;
      return next;
    });
  }

  const timeTaken = config.timeSeconds - timeLeft;

  if (screen === "setup") {
    return (
      <SetupScreen
        config={config}
        setConfig={setConfig}
        loading={loading}
        error={error}
        onStart={startQuiz}
      />
    );
  }

  if (screen === "results") {
    return (
      <ResultsScreen
        questions={questions}
        answers={answers}
        timeTaken={timeTaken}
        onRetry={startQuiz}
        onNewQuiz={() => setScreen("setup")}
      />
    );
  }

  return (
    <QuizScreen
      questions={questions}
      current={current}
      answers={answers}
      timeLeft={timeLeft}
      config={config}
      onSelect={selectAnswer}
      onPrev={() => setCurrent(c => Math.max(0, c - 1))}
      onNext={() => {
        if (current < questions.length - 1) setCurrent(c => c + 1);
        else submitQuiz();
      }}
      onSubmit={submitQuiz}
    />
  );
}

// ── Setup Screen ──────────────────────────────────────────────────────────────

function SetupScreen({ config, setConfig, loading, error, onStart }: {
  config:    QuizConfig;
  setConfig: React.Dispatch<React.SetStateAction<QuizConfig>>;
  loading:   boolean;
  error:     string | null;
  onStart:   () => void;
}) {
  return (
    <div className="flex flex-col gap-5 max-w-[640px]">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight">Quiz Setup</h1>
        <p className="text-[13px] text-ink-3 mt-1">
          Choose your difficulty, topic, and length — then start the timer.
        </p>
      </div>

      <div className="bg-white border border-line rounded shadow-card divide-y divide-line">
        {/* Difficulty */}
        <div className="px-5 py-4">
          <div className="text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-3">Difficulty</div>
          <div className="flex gap-2 flex-wrap">
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setConfig(c => ({ ...c, difficulty: d }))}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all",
                  config.difficulty === d
                    ? "bg-ink-1 text-white border-ink-1"
                    : "bg-canvas text-ink-2 border-line hover:border-line-strong hover:text-ink-1"
                )}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="px-5 py-4">
          <div className="text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-3">Topic</div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setConfig(cfg => ({ ...cfg, category: c }))}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all",
                  config.category === c
                    ? "bg-ink-1 text-white border-ink-1"
                    : "bg-canvas text-ink-2 border-line hover:border-line-strong hover:text-ink-1"
                )}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Length */}
        <div className="px-5 py-4">
          <div className="text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-3">Length</div>
          <div className="flex gap-2 flex-wrap">
            {QUIZ_LENGTHS.map(opt => (
              <button key={opt.value}
                onClick={() => setConfig(c => ({ ...c, length: opt.value, timeSeconds: opt.timeSeconds }))}
                className={cn(
                  "flex flex-col items-center px-5 py-2.5 rounded border transition-all min-w-[80px]",
                  config.length === opt.value
                    ? "bg-ink-1 text-white border-ink-1"
                    : "bg-canvas text-ink-2 border-line hover:border-line-strong hover:text-ink-1"
                )}>
                <span className="text-[13px] font-semibold">{opt.label}</span>
                <span className={cn("text-[11px] mt-0.5", config.length === opt.value ? "text-white/70" : "text-ink-3")}>
                  {opt.timeLabel}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Start */}
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          {error ? (
            <p className="text-[13px] text-ink-3">{error}</p>
          ) : (
            <p className="text-[13px] text-ink-2">
              {config.category === "All" ? "All topics" : config.category}
              {" · "}
              {config.difficulty === "Mixed" ? "Mixed difficulty" : config.difficulty}
              {" · "}
              {config.length} questions · {QUIZ_LENGTHS.find(l => l.value === config.length)?.timeLabel}
            </p>
          )}
          <button
            onClick={onStart}
            disabled={loading}
            className="px-5 py-2 rounded-sm text-[13.5px] font-semibold bg-ink-1 text-white
                       hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
            {loading ? "Loading…" : "Start Quiz →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Quiz Screen ───────────────────────────────────────────────────────────────

function QuizScreen({ questions, current, answers, timeLeft, config, onSelect, onPrev, onNext, onSubmit }: {
  questions:  QuizQuestionDto[];
  current:    number;
  answers:    (string | null)[];
  timeLeft:   number;
  config:     QuizConfig;
  onSelect:   (id: string) => void;
  onPrev:     () => void;
  onNext:     () => void;
  onSubmit:   () => void;
}) {
  const q        = questions[current];
  const total    = questions.length;
  const selected = answers[current];
  const pct      = (current / total) * 100;
  const mins     = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs     = String(timeLeft % 60).padStart(2, "0");
  const isLast   = current === total - 1;
  const isLow    = timeLeft <= 60;

  return (
    <div className="flex flex-col gap-0 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-bold tracking-tight">Quiz</h1>
          <p className="text-[12px] text-ink-3 mt-0.5">
            {config.category === "All" ? "Mixed Topics" : config.category}
            {" · "}
            {config.difficulty === "Mixed" ? "Mixed difficulty" : config.difficulty}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[12px] font-medium text-ink-3">
            <strong className="text-ink-1">{current + 1}</strong> / {total}
          </span>
          <div className={cn(
            "flex items-center gap-1.5 border rounded-md px-2.5 py-1.5 transition-colors",
            isLow ? "bg-[#1A1A1A] border-[#1A1A1A]" : "bg-white border-line"
          )}>
            <svg width="13" height="13" className={isLow ? "text-white/60" : "text-ink-3"}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className={cn("font-mono text-[13px] font-semibold", isLow ? "text-white" : "text-ink-1")}>
              {mins}:{secs}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] bg-line rounded-full overflow-hidden mb-5">
        <div className="h-full bg-ink-1 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }} />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-2 gap-5 flex-1">
        {/* Left — question */}
        <div className="bg-white border border-line rounded shadow-card p-5 flex flex-col gap-3.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-semibold bg-[#E5E5E5] text-[#252525]">
              {q.category}
            </span>
            <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-semibold",
              DIFFICULTY_BADGE[q.difficulty] ?? "bg-[#EFEFEF] text-[#3A3A3A]")}>
              {q.difficulty}
            </span>
          </div>
          <p className="text-[15px] font-semibold leading-snug text-ink-1">{q.titleEn}</p>
          {q.contextEn && (
            <p className="text-[13px] text-ink-2 leading-relaxed">{q.contextEn}</p>
          )}
          {q.codeSnippet && (
            <pre className="bg-[#F4F4F4] border border-line rounded-md px-3.5 py-2.5
                            text-[12px] font-mono text-ink-1 overflow-x-auto leading-relaxed">
              {q.codeSnippet}
            </pre>
          )}
        </div>

        {/* Right — options */}
        <div className="flex flex-col gap-2.5">
          {q.options.map(opt => {
            const isSelected = selected === opt.id;
            return (
              <div key={opt.id} onClick={() => onSelect(opt.id)}
                className={cn(
                  "flex items-start gap-3 p-3.5 border-[1.5px] rounded cursor-pointer transition-all",
                  isSelected
                    ? "border-ink-1 bg-surface-alt"
                    : "border-line bg-white hover:border-line-strong"
                )}>
                <div className={cn(
                  "w-[18px] h-[18px] rounded-full border-[1.5px] flex-shrink-0 mt-0.5 flex items-center justify-center",
                  isSelected ? "border-ink-1 bg-ink-1" : "border-line-strong"
                )}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[13px] text-ink-1 mb-0.5">{opt.label}</div>
                  <div className="text-[12.5px] text-ink-2 leading-relaxed">{opt.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line mt-5 pt-4 flex items-center justify-between">
        <button onClick={onPrev} disabled={current === 0}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-[13px] font-medium
                     bg-canvas text-ink-1 border border-line-strong hover:bg-[#EAEAEA]
                     transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Previous
        </button>

        {/* Dot progress */}
        <div className="flex items-center gap-1">
          {questions.map((_, i) => (
            <div key={i} className={cn(
              "rounded-full transition-all",
              i === current   ? "w-4 h-2 bg-ink-1"
              : answers[i]   ? "w-2 h-2 bg-ink-2"
                             : "w-2 h-2 bg-line-strong"
            )} />
          ))}
        </div>

        {isLast ? (
          <button onClick={onSubmit}
            className="px-3.5 py-1.5 rounded-sm text-[13px] font-semibold bg-ink-1 text-white
                       hover:bg-[#2A2A2A] transition-colors">
            Submit Quiz
          </button>
        ) : (
          <button onClick={onNext}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-[13px] font-medium
                       bg-ink-1 text-white hover:bg-[#2A2A2A] transition-colors">
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Results Screen ────────────────────────────────────────────────────────────

function ResultsScreen({ questions, answers, timeTaken, onRetry, onNewQuiz }: {
  questions: QuizQuestionDto[];
  answers:   (string | null)[];
  timeTaken: number;
  onRetry:   () => void;
  onNewQuiz: () => void;
}) {
  const correct = questions.filter((q, i) => answers[i] === q.correctOptionId).length;
  const total   = questions.length;
  const pct     = Math.round((correct / total) * 100);
  const mins    = String(Math.floor(timeTaken / 60)).padStart(2, "0");
  const secs    = String(timeTaken % 60).padStart(2, "0");
  const grade   = pct >= 80 ? "Excellent" : pct >= 60 ? "Good" : pct >= 40 ? "Fair" : "Keep Practicing";

  return (
    <div className="flex flex-col gap-5 max-w-[820px]">
      {/* Score card */}
      <div className="bg-white border border-line rounded shadow-card px-6 py-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-1">Quiz Complete</div>
            <div className="flex items-end gap-3">
              <span className="text-[36px] font-bold tracking-tight leading-none">{correct}/{total}</span>
              <span className="text-[15px] font-medium text-ink-2 mb-1">({pct}%)</span>
            </div>
            <div className="text-[13px] text-ink-3 mt-1">{grade} · {mins}:{secs} used</div>
          </div>
          <div className="flex-1 min-w-[160px] max-w-[220px]">
            <div className="h-2 bg-line rounded-full overflow-hidden mb-2">
              <div className="h-full bg-ink-1 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-ink-3">
              <span>{correct} correct</span>
              <span>{total - correct} wrong / skipped</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onNewQuiz}
              className="px-3.5 py-1.5 rounded-sm text-[13px] font-medium bg-canvas text-ink-1
                         border border-line-strong hover:bg-[#EAEAEA] transition-colors">
              New Quiz
            </button>
            <button onClick={onRetry}
              className="px-3.5 py-1.5 rounded-sm text-[13px] font-semibold bg-ink-1 text-white
                         hover:bg-[#2A2A2A] transition-colors">
              Retry Same
            </button>
          </div>
        </div>
      </div>

      {/* Per-question breakdown */}
      <div className="text-[13px] font-semibold text-ink-1">Question Breakdown</div>
      {questions.map((q, i) => {
        const userAnswer = answers[i];
        const isCorrect  = userAnswer === q.correctOptionId;
        const correctOpt = q.options.find(o => o.id === q.correctOptionId)!;
        const userOpt    = userAnswer ? q.options.find(o => o.id === userAnswer) : null;

        return (
          <div key={q.id} className="bg-white border border-line rounded shadow-card overflow-hidden">
            {/* Question header */}
            <div className="px-5 py-3.5 flex items-start gap-3">
              <div className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5",
                isCorrect ? "bg-ink-1 text-white" : "bg-[#E8E8E8] text-ink-2"
              )}>
                {isCorrect ? "✓" : "✗"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-ink-3">{q.category}</span>
                  <span className={cn("text-[11px] font-medium px-1.5 py-0.5 rounded-[3px]",
                    DIFFICULTY_BADGE[q.difficulty] ?? "bg-[#EFEFEF] text-[#3A3A3A]")}>
                    {q.difficulty}
                  </span>
                </div>
                <p className="text-[13.5px] font-medium text-ink-1 leading-snug">{q.titleEn}</p>
              </div>
            </div>

            {/* Answer review */}
            <div className="border-t border-line px-5 py-3.5 flex flex-col gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-[18px] h-[18px] rounded-full bg-ink-1 flex-shrink-0 mt-0.5
                                flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-ink-3 mb-0.5">Correct Answer</div>
                  <div className="text-[13px] font-semibold text-ink-1">{correctOpt.label}</div>
                  <div className="text-[12px] text-ink-2">{correctOpt.desc}</div>
                </div>
              </div>

              {!isCorrect && (
                <div className="flex items-start gap-2.5">
                  <div className="w-[18px] h-[18px] rounded-full border-[1.5px] border-line-strong
                                  flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] font-semibold text-ink-3 mb-0.5">Your Answer</div>
                    {userOpt ? (
                      <>
                        <div className="text-[13px] text-ink-2 line-through">{userOpt.label}</div>
                        <div className="text-[12px] text-ink-3">{userOpt.desc}</div>
                      </>
                    ) : (
                      <div className="text-[13px] text-ink-3 italic">Not answered</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Explanation */}
            <div className="border-t border-line px-5 py-3.5 bg-[#FAFAFA]">
              <div className="text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-1.5">
                Explanation
              </div>
              <p className="text-[13px] text-ink-2 leading-relaxed">{q.explanationEn}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
