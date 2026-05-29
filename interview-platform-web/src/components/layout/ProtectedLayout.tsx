import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import Layout from "./Layout";

export default function ProtectedLayout() {
  const { accessToken } = useAuthStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  return <Layout />;
}
