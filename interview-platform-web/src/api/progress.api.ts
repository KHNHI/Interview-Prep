import client from "./client";

export interface HeatmapEntry {
  date:  string;
  count: number;
}

export interface DashboardDto {
  questionsAttempted: number;
  quizzesTaken:       number;
  correctRate:        number;
  currentStreak:      number;
  heatmap:            HeatmapEntry[];
}

export interface RadarItemDto {
  category: string;
  score:    number;
}

export const progressApi = {
  getDashboard: () =>
    client.get<{ success: boolean; data: DashboardDto }>("/progress/dashboard"),
  getRadar: () =>
    client.get<{ success: boolean; data: RadarItemDto[] }>("/progress/radar"),
};
