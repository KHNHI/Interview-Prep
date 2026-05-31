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

  submit: (answers: SubmitAnswerItem[]) =>
    client.post<SubmitQuizResponse>("/quiz/submit", { answers }),
};
