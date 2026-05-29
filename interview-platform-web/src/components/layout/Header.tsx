import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export default function Header() {
  const { accessToken, clearAuth } = useAuthStore();

  return (
    <header className="h-14 bg-white border-b flex items-center justify-end px-6 gap-4">
      {accessToken ? (
        <button onClick={clearAuth} className="text-sm text-gray-600 hover:text-red-500">
          Sign out
        </button>
      ) : (
        <>
          <Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600">Sign in</Link>
          <Link to="/register" className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700">
            Sign up
          </Link>
        </>
      )}
    </header>
  );
}
