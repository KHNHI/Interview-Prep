import { useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { INTERVIEW_STEPS, URL_SHORTENER_LESSON } from "./interviewFramework";
import { MarkdownRenderer } from "../../components/ui/MarkdownRenderer";
import { ArchitectureWhiteboard } from "./ArchitectureWhiteboard";
import { getArchitectureBoard } from "./architectureBoards";
import "./interview-lesson.css";

export function InterviewLesson({ title }: { title: string }) {
  const [params, setParams] = useSearchParams();
  const index = Math.max(0, INTERVIEW_STEPS.findIndex(step => step.id === params.get("step")));
  const step = INTERVIEW_STEPS[index];
  const lesson = URL_SHORTENER_LESSON[index];
  const heading = useRef<HTMLHeadingElement>(null);
  function go(next: number) {
    const updated = new URLSearchParams(params); updated.set("step", INTERVIEW_STEPS[next].id);
    setParams(updated);
    requestAnimationFrame(() => { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: "start" }); });
  }
  const board = index === 3 ? getArchitectureBoard(title) : undefined;
  return <div className="interview-lesson">
    <header className="lesson-intro">
      <p className="lesson-kicker">Worked interview · 45-minute practice</p>
      <h1>{title}</h1>
      <p>Build the answer one decision at a time. Read the example, then practise saying it in your own words.</p>
      <Link to="/system-design/guide">Review the six-step framework</Link>
    </header>
    <nav className="lesson-steps" aria-label="Interview steps">
      {INTERVIEW_STEPS.map((item, i) => <button key={item.id} aria-current={i === index ? "step" : undefined} onClick={() => go(i)}>
        <span className="lesson-step-number">0{i + 1}</span><span>{item.title}<small>{item.minutes} min</small></span>
      </button>)}
    </nav>
    <p className="lesson-timing">Suggested pacing, not a timer or a grading rule. Adapt the depth to the interviewer and the problem.</p>
    <header className="lesson-step-heading">
      <p className="lesson-kicker">Step {index + 1} of 6 · About {step.minutes} minutes</p>
      <h2 ref={heading} tabIndex={-1}>{step.title}</h2>
    </header>
    <div className="lesson-primer">
      <section><h3>What to do</h3><p>{step.goal}</p><p className="lesson-deliverable"><strong>Leave this step with:</strong> {step.output}</p></section>
      <section><h3>Ask the interviewer</h3><ul>{step.questions.map(question => <li key={question}>{question}</li>)}</ul></section>
    </div>
    {board && <ArchitectureWhiteboard board={board} />}
    <section className="lesson-example" aria-label="Worked example"><p className="lesson-kicker">Worked example · URL Shortener</p><MarkdownRenderer text={lesson.example} /></section>
    <section className="lesson-speaking"><p className="lesson-kicker">What to say</p><h3>Try explaining it out loud</h3><blockquote>{lesson.say}</blockquote><p>Use this as a starting point. Explain the reasoning rather than memorizing the wording.</p></section>
    <section className="lesson-mistakes"><h3>Common mistakes</h3><ul>{lesson.mistakes.map(mistake => <li key={mistake}>{mistake}</li>)}</ul></section>
    <footer className="lesson-pagination">
      <button disabled={index === 0} onClick={() => go(index - 1)}>Previous step</button>
      <span>{index + 1} / 6</span>
      {index < 5 ? <button onClick={() => go(index + 1)}>Next: {INTERVIEW_STEPS[index + 1].title}</button>
        : <Link to="/system-design">Browse other cases</Link>}
    </footer>
  </div>;
}

export function FrameworkGuide() {
  return <div className="interview-lesson">
    <Link className="lesson-back" to="/system-design">Back to System Design</Link>
    <header className="lesson-intro"><p className="lesson-kicker">Interview framework</p><h1>From a question to a system design</h1>
      <p>A six-step approach for a 45-minute interview. Ask, estimate, define the contract, draw the system, examine key decisions, then check its limits.</p></header>
    <nav className="framework-timeline" aria-label="Framework sections">
      {INTERVIEW_STEPS.map((step, i) => <a href={`#${step.id}`} key={step.id}><span>0{i + 1}</span><strong>{step.title}</strong><small>{step.minutes} min</small></a>)}
    </nav>
    <p className="lesson-timing">These times add up to 45 minutes. Use them as guidance: a small problem may need only a brief estimate, while a difficult trade-off may deserve more time.</p>
    {INTERVIEW_STEPS.map((step, i) => <section key={step.id} id={step.id} className="framework-section">
      <p className="lesson-kicker">Step {i + 1} · {step.minutes} minutes</p><h2>{step.title}</h2>
      <h3>What to do</h3><p>{step.goal}</p><p className="lesson-deliverable"><strong>Expected output:</strong> {step.output}</p>
      <h3>Ask the interviewer</h3><ul>{step.questions.map(question => <li key={question}>{question}</li>)}</ul>
      <h3>What to say</h3><blockquote>{step.say}</blockquote>
      <h3>Common mistake</h3><p>{step.mistake}</p>
    </section>)}
    <section className="lesson-speaking"><h2>Practise the complete example</h2><p>URL Shortener follows all six steps, including capacity calculations, API examples, the interactive whiteboard and failure scenarios. The other cases currently use the shorter reference format.</p><Link to="/system-design">Choose URL Shortener from the case list</Link></section>
  </div>;
}
