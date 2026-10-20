import { Link, useLocation } from "react-router-dom";
const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  questions: "Question bank",
  quiz: "Quizzes",
  flashcard: "Flashcards",
  "system-design": "System design",
  progress: "Your progress",
};
export default function Header() {
  const { pathname } = useLocation();
  return (
    <header className="workspace-header">
      <nav aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>{LABELS[pathname.split("/")[1]] ?? "Workspace"}</span>
      </nav>
      <span className="workspace-caption">A little progress, every day.</span>
    </header>
  );
}
