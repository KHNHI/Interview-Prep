import axios from "axios";

export function authErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 429)
      return "Too many attempts. Wait a minute and try again.";
    if (!error.response)
      return "Could not connect. Check your connection and try again.";
    if ((error.response.status ?? 0) >= 500)
      return "Something went wrong. Please try again shortly.";
  }
  return fallback;
}
