import client from "./client";

export interface QuizOption {
  id:    string;
  label: string;
  desc:  string;
}

export interface QuizQuestionDto {
  id:              string;
  category:        string;
  difficulty:      string;
  titleEn:         string;
  contextEn?:      string;
  codeSnippet?:    string;
  options:         QuizOption[];
  correctOptionId: string;
  explanationEn:   string;
  isPro:           boolean;
}

export interface QuizQuestionsResponse {
  success: boolean;
  data:    QuizQuestionDto[];
}

export interface GetQuizQuestionsParams {
  category?:   string;
  difficulty?: string;
  count?:      number;
}

export interface SubmitAnswerItem {
  quizQuestionId:   string;
  selectedOptionId: string | null;
  timeTakenMs:      number;
}

export interface SubmitQuizResponse {
  success: boolean;
  data:    { correctCount: number; totalCount: number };
}

export const quizApi = {
  getQuestions: (params: GetQuizQuestionsParams = {}) =>
    client.get<QuizQuestionsResponse>("/quiz/questions", { params }),

  // Uses fetch directly so a 401 (expired token mid-quiz) doesn't trigger the
  // shared Axios interceptor and bounce the user off the results page.
  submit: (answers: SubmitAnswerItem[]): Promise<void> => {
    const token = localStorage.getItem("access_token");
    if (!token) return Promise.resolve();
    return fetch(
      (import.meta.env.VITE_API_URL ?? "") + "/api/quiz/submit",
      {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ answers }),
      }
    ).then(() => undefined);
  },
};
