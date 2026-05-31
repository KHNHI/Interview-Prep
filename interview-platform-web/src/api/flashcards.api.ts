import client from "./client";

export interface FlashcardDto {
  id:           string;
  category:     string;
  difficulty:   string;
  front:        string;
  back:         string;
  easeFactor:   number;
  intervalDays: number;
  repetitions:  number;
  nextReviewAt: string | null;
}

export interface ReviewResult {
  intervalDays: number;
  nextReviewAt: string;
}

export const flashcardsApi = {
  getCards: () =>
    client.get<{ success: boolean; data: FlashcardDto[] }>("/flashcards"),

  reviewCard: (id: string, rating: 0 | 3 | 4 | 5) =>
    client.post<{ success: boolean; data: ReviewResult }>(`/flashcards/${id}/review`, { rating }),
};
