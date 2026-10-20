import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    // Don't redirect on 401 from auth endpoints — the catch block in the
    // login/register page handles those and shows the error in-place.
    const isAuthEndpoint = err.config?.url?.startsWith("/auth/");
    const isAnswerFeedback = /\/questions\/[^/]+\/feedback$/.test(err.config?.url ?? "");
    if (err.response?.status === 401 && !isAuthEndpoint && !isAnswerFeedback) {
      // Clear both token keys then hard-reload to /login.
      // A full page reload resets Zustand in-memory state so ProtectedLayout
      // sees no token and the user is properly signed out.
      localStorage.removeItem("access_token");
      localStorage.removeItem("auth-store");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default client;
