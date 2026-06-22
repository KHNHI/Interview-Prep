import client from "./client";

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export interface RegisterResult {
  email: string;
  message: string;
}

export const authApi = {
  // Register no longer logs the user in — it returns a "check your email" message.
  register: (email: string, name: string, password: string) =>
    client.post<{ data: RegisterResult }>("/auth/register", { email, name, password }),

  login: (email: string, password: string) =>
    client.post<{ data: AuthResult }>("/auth/login", { email, password }),

  // Activates the account from the email link; returns a session (auto-login).
  verifyEmail: (token: string) =>
    client.post<{ data: AuthResult }>("/auth/verify-email", { token }),

  resendVerification: (email: string) =>
    client.post("/auth/resend-verification", { email }),
};
