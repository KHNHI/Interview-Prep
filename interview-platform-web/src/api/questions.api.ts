import client from "./client";

export interface Question {
  id: string;
  category: string;
  subcategory?: string;
  title: string;
  content: string;
  difficulty: string;
  tags: string[];
  isPro: boolean;
}

export const questionsApi = {
  getAll: (params: { category?: string; difficulty?: string; lang?: string; page?: number; pageSize?: number }) =>
    client.get<{ data: Question[]; meta: { page: number; total: number } }>("/questions", { params }),
};
