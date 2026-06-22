import { createBrowserRouter } from "react-router-dom";
import type { ComponentType } from "react";
import Layout          from "./components/layout/Layout";
import PublicLayout    from "./components/layout/PublicLayout";
import ProtectedLayout from "./components/layout/ProtectedLayout";

/**
 * Maps a named export to the { Component } shape React Router lazy expects.
 * Keeps each page file exporting a descriptive function name instead of
 * the generic `Component`.
 */
function lazy<T extends Record<string, ComponentType>>(
  importFn: () => Promise<T>,
  name: keyof T
) {
  return {
    lazy: async () => {
      const mod = await importFn();
      return { Component: mod[name] };
    },
  };
}

const router = createBrowserRouter([

  // ── Public layout (Navbar, dark, no auth required) ──────────────────────
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/",
        ...lazy(() => import("./features/landing/LandingPage"), "LandingPage"),
      },
    ],
  },

  // ── App layout (Sidebar — accessible without login) ──────────────────────
  {
    element: <Layout />,
    children: [
      { path: "questions",      ...lazy(() => import("./features/questions/QuestionsPage"),      "QuestionsPage") },
      { path: "questions/:id",  ...lazy(() => import("./features/questions/QuestionDetailPage"), "QuestionDetailPage") },
      { path: "quiz",           ...lazy(() => import("./features/quiz/QuizPage"),                "QuizPage") },
      { path: "system-design",       ...lazy(() => import("./features/system-design/SystemDesignPage"),       "SystemDesignPage") },
      { path: "system-design/guide", ...lazy(() => import("./features/system-design/SystemDesignGuidePage"),  "SystemDesignGuidePage") },
      { path: "system-design/:id",   ...lazy(() => import("./features/system-design/SystemDesignDetailPage"), "SystemDesignDetailPage") },
      { path: "pricing",        ...lazy(() => import("./features/pricing/PricingPage"),          "PricingPage") },
    ],
  },

  // ── Protected layout (Sidebar + redirect to /login if no token) ──────────
  {
    element: <ProtectedLayout />,
    children: [
      { path: "dashboard",         ...lazy(() => import("./features/dashboard/DashboardPage"),               "DashboardPage") },
      { path: "flashcard",         ...lazy(() => import("./features/flashcard/FlashcardPage"),               "FlashcardPage") },
      { path: "progress",          ...lazy(() => import("./features/progress/ProgressPage"),                 "ProgressPage") },
    ],
  },

  // ── Auth pages (no layout) ───────────────────────────────────────────────
  { path: "/login",        ...lazy(() => import("./features/auth/LoginPage"),       "LoginPage") },
  { path: "/register",     ...lazy(() => import("./features/auth/RegisterPage"),    "RegisterPage") },
  { path: "/verify-email", ...lazy(() => import("./features/auth/VerifyEmailPage"), "VerifyEmailPage") },

]);

export default router;
