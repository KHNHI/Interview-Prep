import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";

const links = [
  { to: "/questions", label: "Q&A" },
  { to: "/quiz", label: "Quiz" },
  { to: "/flashcard", label: "Flashcards" },
  { to: "/system-design", label: "System Design" },
  { to: "/progress", label: "Progress" },
  { to: "/pricing", label: "Pricing" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r flex flex-col py-6 px-3 gap-1">
      <div className="text-lg font-bold px-3 mb-4 text-indigo-600">InterviewPrep</div>
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            cn("px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100")
          }
        >
          {l.label}
        </NavLink>
      ))}
    </aside>
  );
}
