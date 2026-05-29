import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout/Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, lazy: () => import("./features/questions/QuestionsPage") },
      { path: "questions", lazy: () => import("./features/questions/QuestionsPage") },
      { path: "quiz", lazy: () => import("./features/quiz/QuizPage") },
      { path: "flashcard", lazy: () => import("./features/flashcard/FlashcardPage") },
      { path: "system-design", lazy: () => import("./features/system-design/SystemDesignPage") },
      { path: "progress", lazy: () => import("./features/progress/ProgressPage") },
      { path: "pricing", lazy: () => import("./features/pricing/PricingPage") },
    ],
  },
  { path: "/login", lazy: () => import("./features/auth/LoginPage") },
  { path: "/register", lazy: () => import("./features/auth/RegisterPage") },
]);

export default router;
