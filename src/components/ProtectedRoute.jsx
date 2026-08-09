import { Navigate } from "react-router-dom";
import { useNaijaBase } from "../context/NaijaBaseContext";

export default function ProtectedRoute({ children }) {
  const { state, isPasswordRecovery } = useNaijaBase();

  if (state.loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        Loading your dashboard...
      </div>
    );
  }

  // If not logged in, go to login
  if (state.currentUserId == null) {
    return <Navigate to="/login" replace />;
  }

  // If it's a password recovery session, DO NOT redirect to home.
  // The user should stay on the reset page (but this component is only used for protected routes,
  // so this condition is a safety net).
  if (isPasswordRecovery) {
    return children;
  }

  // Normal logged-in user, allow access to protected routes
  return children;
}
