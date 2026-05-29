import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "../../api/auth.api";
import { useAuthStore } from "../../stores/authStore";
import { Link, useNavigate } from "react-router-dom";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type FormData = z.infer<typeof schema>;

export function Component() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    const res = await authApi.login(data.email, data.password);
    setAuth(res.data.data.accessToken, res.data.data.userId);
    localStorage.setItem("access_token", res.data.data.accessToken);
    navigate("/questions");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-sm w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
        <div>
          <input {...register("email")} placeholder="Email" type="email"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <input {...register("password")} placeholder="Password" type="password"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
        <p className="text-sm text-center text-gray-500">
          No account? <Link to="/register" className="text-indigo-600 hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
