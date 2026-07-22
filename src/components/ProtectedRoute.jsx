import { Navigate } from 'react-router-dom';
import { useNaijaBase } from '../context/NaijaBaseContext';

export default function ProtectedRoute({ children }) {
  const { state } = useNaijaBase();
  if (state.loading) {
    return <div className="h-screen flex items-center justify-center text-gray-400">Loading your dashboard...</div>;
  }
  if (state.currentUserId == null) {
    return <Navigate to="/login" replace />;
  }
  return children;
}