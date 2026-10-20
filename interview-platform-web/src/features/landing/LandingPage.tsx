import { useState } from "react";
import { Link } from "react-router-dom";
import "./landing.css";

const TOPICS = [
  {
    name: "DSA",
    label: "Data structures",
    count: 24,
    question: "When is a hash map a better choice than an array?",
    answer:
      "When you need fast lookups by a key rather than by position. A hash map gives expected O(1) lookup, but uses more memory. An array is usually better for ordered traversal and indexed access.",
    note: "Explain the trade-off, not just the time complexity.",
  },
  {
    name: "Networking",
    label: "Networking",
    count: 22,
    question: "A request times out. Is the server definitely down?",
    answer:
      "Not necessarily. A timeout means the request did not finish before its deadline. Check DNS, routing, firewall rules and the listening port, then inspect the service and its dependencies.",
    note: "Treat a symptom as a clue, not a diagnosis.",
  },
  {
    name: "DB",
    label: "Databases",
    count: 22,
    question: "Can a replica replace a database backup?",
    answer:
      "No. A replica follows changes, including accidental deletions. A backup gives you an earlier recoverable copy. You need to test restores to know that your backup is actually useful.",
    note: "A recovery plan is only useful if you can carry it out.",
  },
  {
    name: "OS",
    label: "Operating systems",
    count: 22,
    question: "Why can load be high while CPU usage is low?",
    answer:
      "On Linux, load includes runnable tasks and tasks in uninterruptible sleep, often waiting on I/O. A slow disk can therefore increase load even when the CPUs are not busy.",
    note: "Look at task states and I/O, not just CPU percentage.",
  },
  {
    name: "Cloud",
    label: "Cloud & reliability",
    count: 22,
    question: "Does a passing health check mean everything works?",
    answer:
      "No. A simple liveness check only shows that a process responds. Readiness and end-to-end checks answer different questions, such as whether the service can query its database or complete a user journey.",
    note: "First decide what you want the check to tell you.",
  },
];
const FAQ = [
  [
    "Do I need an account?",
    "You can read the question bank, explore system design and take quizzes without an account. Create one when you want to save quiz attempts, use flashcards and see your progress.",
  ],
  [
    "Is any content behind a subscription?",
    "No. InterviewPrep is a personal, non-commercial learning project. There are no paid plans or upgrade screens.",
  ],
  [
    "Where should I start?",
    "Pick a topic you find difficult, explain one answer out loud, then take a short quiz. Come back to your mistakes rather than trying to finish everything in one sitting.",
  ],
  [
    "What is available right now?",
    "112 technical Q&A entries, multiple-choice quizzes, spaced-repetition flashcards and four worked system-design cases. The study material is currently primarily in English.",
  ],
];
export function LandingPage() {
  const [topic, setTopic] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(15);
  const sample = TOPICS[topic];
  function chooseTopic(index: number) {
    setTopic(index);
    setRevealed(false);
    setReflection(null);
  }
  return (
    <div className="study-home">
      <main id="main-content">
        <section className="home-hero home-width">
          <div className="hero-copy home-enter">
            <p className="home-eyebrow">A small, independent study space</p>
            <h1>
              A little practice.
              <br />A clearer <em>answer.</em>
            </h1>
            <p className="hero-description">
              For the questions you almost know how to answer. Work through the
              fundamentals, say it in your own words, and build from there.
            </p>
            <div className="home-actions">
              <Link className="home-button" to="/questions">
                Find your first question
              </Link>
              <a className="home-text-link" href="#practice">
                Try one here
              </a>
            </div>
            <p className="hero-footnote">
              Free to learn. No subscriptions. At your own pace.
            </p>
            <div className="hero-index">
              <span>
                <strong>112</strong> questions to think through
              </span>
              <span>
                <strong>05</strong> core topics
              </span>
            </div>
          </div>
          <div id="practice" className="practice-sheet home-enter">
            <div className="sheet-heading">
              <span>A QUESTION TO START WITH</span>
              <span>0{topic + 1} / 05</span>
            </div>
            <div
              className="practice-topics"
              aria-label="Choose a practice topic"
            >
              {TOPICS.map((t, i) => (
                <button
                  key={t.name}
                  aria-pressed={topic === i}
                  onClick={() => chooseTopic(i)}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <p className="practice-label">Think it through before you peek.</p>
            <h2>{sample.question}</h2>
            {!revealed ? (
              <div className="answer-prompt">
                <p>How would you explain this to a teammate?</p>
                <button
                  className="sheet-button"
                  onClick={() => setRevealed(true)}
                >
                  Compare your answer
                </button>
              </div>
            ) : (
              <div className="practice-answer" aria-live="polite">
                <p>{sample.answer}</p>
                <aside>{sample.note}</aside>
                <div className="reflection-controls">
                  <span>How did it feel?</span>
                  {["Got it", "Worth revisiting"].map((value) => (
                    <button
                      aria-pressed={reflection === value}
                      key={value}
                      onClick={() => setReflection(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                {reflection && (
                  <p className="reflection-note" role="status">
                    {reflection === "Got it"
                      ? "A good start. Try another topic to keep going."
                      : "That is what practice is for. Read the explanation once, then try saying it again."}
                  </p>
                )}
              </div>
            )}
            <div className="sheet-footer">
              <span>A preview. No account needed.</span>
              <button onClick={() => chooseTopic((topic + 1) % TOPICS.length)}>
                Next question
              </button>
            </div>
          </div>
        </section>
        <section id="library" className="library-section">
          <div className="home-width library-layout">
            <div className="section-intro">
              <p className="home-eyebrow">The reading room</p>
              <h2>
                Start with what
                <br />
                you are curious about.
              </h2>
              <p>
                No perfect order. Pick a topic, follow a question, and take your
                time.
              </p>
              <Link className="home-text-link" to="/questions">
                Browse the whole bank
              </Link>
            </div>
            <div className="topic-directory">
              {TOPICS.map((t, i) => (
                <Link
                  key={t.name}
                  to={`/questions?category=${t.name}`}
                  className="topic-row"
                >
                  <span className="topic-number">0{i + 1}</span>
                  <span className="topic-name">{t.label}</span>
                  <span className="topic-count">{t.count} questions</span>
                  <span className="topic-open">Explore</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section id="your-session" className="home-width session-section">
          <div className="section-intro">
            <p className="home-eyebrow">Make a little room</p>
            <h2>
              How much time
              <br />
              do you have today?
            </h2>
            <p>
              A small session is still a session. Here is a simple place to
              begin.
            </p>
            <div className="time-options" aria-label="Choose session length">
              {[10, 15, 30].map((n) => (
                <button
                  key={n}
                  aria-pressed={minutes === n}
                  onClick={() => setMinutes(n)}
                >
                  {n} min
                </button>
              ))}
            </div>
          </div>
          <div className="session-plan" aria-live="polite">
            <div className="plan-top">
              <span>YOUR {minutes}-MINUTE PLAN</span>
              <span>Keep it manageable</span>
            </div>
            <ol>
              <li>
                <span>01</span>
                <div>
                  <h3>
                    {minutes === 10
                      ? "Read one answer carefully"
                      : "Warm up with the fundamentals"}
                  </h3>
                  <p>
                    Explain the idea out loud before reading the explanation.
                  </p>
                </div>
                <Link to={`/questions?category=${sample.name}`}>Read</Link>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3>
                    {minutes === 30
                      ? "Take a focused quiz"
                      : "Check what stayed with you"}
                  </h3>
                  <p>
                    A short quiz in {sample.label.toLowerCase()}. Mistakes are
                    useful here.
                  </p>
                </div>
                <Link to={`/quiz?category=${sample.name}`}>Practice</Link>
              </li>
              {minutes === 30 && (
                <li>
                  <span>03</span>
                  <div>
                    <h3>Think about a bigger system</h3>
                    <p>
                      Follow a worked example, one design decision at a time.
                    </p>
                  </div>
                  <Link to="/system-design">Explore</Link>
                </li>
              )}
            </ol>
            <p className="plan-note">
              A suggested rhythm, not a timer. You set the pace.
            </p>
          </div>
        </section>
        <section className="home-width design-note">
          <p className="home-eyebrow">Beyond the short answer</p>
          <div>
            <h2>
              Learn to connect
              <br />
              the pieces.
            </h2>
            <p>
              What happens when traffic grows? Where does the data live? Our
              system-design guides walk through the decisions, including the
              parts without a perfect answer.
            </p>
            <Link
              className="home-button home-button-light"
              to="/system-design/guide"
            >
              Read the design framework
            </Link>
          </div>
          <ol>
            <li>Clarify the problem</li>
            <li>Sketch a simple design</li>
            <li>Talk through the trade-offs</li>
          </ol>
        </section>
        <section className="home-width faq-section">
          <div className="section-intro">
            <p className="home-eyebrow">Before you settle in</p>
            <h2>
              A few things
              <br />
              you might wonder.
            </h2>
          </div>
          <div>
            {FAQ.map(([q, a], i) => (
              <details key={q}>
                <summary>
                  <span className="faq-number">0{i + 1}</span>
                  {q}
                  <span className="faq-toggle">Read</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="home-width closing-note">
          <span className="home-eyebrow">
            One question is a good beginning.
          </span>
          <Link to="/questions">Let’s make a start.</Link>
          <p>An independent project, built for learning. Free for everyone.</p>
        </section>
      </main>
      <footer className="home-width home-footer">
        <Link to="/">
          InterviewPrep<span>A place to figure things out.</span>
        </Link>
        <nav aria-label="Footer">
          <Link to="/questions">Question bank</Link>
          <Link to="/quiz">Quizzes</Link>
          <a
            href="https://github.com/KHNHI/Interview-Prep"
            target="_blank"
            rel="noreferrer"
          >
            Source code
          </a>
        </nav>
        <span>Made with care. {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
