import client from "./client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Question {
  id:          string;
  category:    string;
  subcategory?: string;
  title:       string;
  content:     string;
  difficulty:  string;
  tags:        string[];
  isPro:       boolean;
}

export interface QuestionListMeta {
  page:     number;
  pageSize: number;
  total:    number;
}

export interface QuestionsResponse {
  success: boolean;
  data:    Question[];
  meta:    QuestionListMeta;
}

export interface QuestionDetailResponse {
  success: boolean;
  data:    Question;
}

export interface AnswerFeedback {
  summary: string;
  strengths: string[];
  improvements: string[];
  englishFeedback: string;
  sampleAnswer: string;
  followUpQuestion: string;
}

export interface GetQuestionsParams {
  category?:  string;
  difficulty?: string;
  lang?:      string;
  page?:      number;
  pageSize?:  number;
}

// ── API calls ──────────────────────────────────────────────────────────────

export const questionsApi = {
  feedbackStatus: () => client.get<{ data: { available: boolean; dailyLimit: number; maxAnswerLength: number } }>("/questions/feedback-status"),
  reviewAnswer: (id: string, answer: string, signal: AbortSignal) =>
    client.post<{ data: AnswerFeedback }>(`/questions/${id}/feedback`, { answer }, { signal, timeout: 40000 }),
  getAll: (params: GetQuestionsParams = {}) =>
    client.get<QuestionsResponse>("/questions", { params }),

  getById: (id: string, lang = "en") =>
    client.get<QuestionDetailResponse>(`/questions/${id}`, { params: { lang } }),
};
