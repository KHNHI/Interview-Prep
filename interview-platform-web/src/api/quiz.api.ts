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

export const quizApi = {
  getQuestions: (params: GetQuizQuestionsParams = {}) =>
    client.get<QuizQuestionsResponse>("/quiz/questions", { params }),
};
