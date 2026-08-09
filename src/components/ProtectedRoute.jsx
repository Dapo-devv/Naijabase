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

  // If it's a password recovery session, allow access (though this route shouldn't be used during recovery)
  if (isPasswordRecovery) {
    return children;
  }

  // Normal logged-in user, allow access to protected routes
  return children;
}
