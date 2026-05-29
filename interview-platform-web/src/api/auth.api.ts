import client from "./client";

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export const authApi = {
  register: (email: string, name: string, password: string) =>
    client.post<{ data: AuthResult }>("/auth/register", { email, name, password }),

  login: (email: string, password: string) =>
    client.post<{ data: AuthResult }>("/auth/login", { email, password }),
};
