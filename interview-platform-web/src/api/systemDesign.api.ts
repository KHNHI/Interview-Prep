import client from "./client";

export interface SystemDesignCaseListItem {
  id:         string;
  title:      string;
  difficulty: string;
  summary?:   string;
  tags:       string[];
  isPro:      boolean;
}

export interface SystemDesignCaseDetail {
  id:              string;
  title:           string;
  difficulty:      string;
  tags:            string[];
  isPro:           boolean;
  summary?:        string;
  overview?:       string;
  requirements?:   string;
  highLevelDesign?: string;
  deepDive?:       string;
  tradeoffs?:      string;
  hints?:          string;
}

export const systemDesignApi = {
  getAll: () =>
    client.get<{ success: boolean; data: SystemDesignCaseListItem[] }>("/system-design"),

  getById: (id: string) =>
    client.get<{ success: boolean; data: SystemDesignCaseDetail }>(`/system-design/${id}`),
};
