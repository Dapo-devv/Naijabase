import { Routes, Route } from "react-router-dom";
import { Instagram, Twitter } from "lucide-react";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import AdSlot from "./components/AdSlot";
import ProtectedRoute from "./components/ProtectedRoute";
import { NaijaBaseProvider, useNaijaBase } from "./context/NaijaBaseContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import MarketPage from "./pages/MarketPage";
import FinanceHubPage from "./pages/FinanceHubPage";
import TripPage from "./pages/TripPage";
import SavingsPage from "./pages/SavingsPage";
import AdminPanel from "./pages/AdminPanel";
import AdminBlogManager from "./pages/AdminBlogManager";
import BlogIndex from "./pages/BlogIndex";
import BlogDetail from "./pages/BlogDetail";
import { useState, useEffect } from "react";

// 🚀 ERROR BOUNDARY COMPONENT
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleError = (event) => {
      setHasError(true);
      setErrorMessage(event.error?.message || "Unknown error occurred");
      console.error("React Error:", event.error);
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-red-50 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Oops! Something crashed.
        </h1>
        <p className="text-red-500 mb-4 font-mono text-sm bg-red-100 p-4 rounded border border-red-200 max-w-lg break-all">
          {errorMessage}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reload Page
        </button>
      </div>
    );
  }
  return children;
}

// 🚀 THEME MANAGER COMPONENT
function ThemeManager() {
  const { currentUser } = useNaijaBase();

  useEffect(() => {
    if (currentUser?.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [currentUser?.theme]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <NaijaBaseProvider>
        <ThemeManager />

        <div className="min-h-screen bg-neutral-bg dark:bg-gray-900 flex flex-col transition-colors duration-300">
          <Navbar />

          <main className="flex-1 pt-safe pb-safe w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/market"
                element={
                  <ProtectedRoute>
                    <MarketPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance"
                element={
                  <ProtectedRoute>
                    <FinanceHubPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trip"
                element={
                  <ProtectedRoute>
                    <TripPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/savings"
                element={
                  <ProtectedRoute>
                    <SavingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/blog"
                element={
                  <ProtectedRoute>
                    <AdminBlogManager />
                  </ProtectedRoute>
                }
              />

              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
            </Routes>
          </main>

          {/* 🚀 FIX: Static Mobile Ad (Doesn't overlay social links) */}
          <div className="md:hidden w-full flex justify-center px-4 pb-4 bg-neutral-bg dark:bg-gray-900 transition-colors duration-300">
            <div className="w-full max-w-[350px]">
              <AdSlot
                width={320}
                height={50}
                label="Ad Space"
                className="!py-2 w-full"
              />
            </div>
          </div>

          <BottomNav />

          {/* 🚀 FIXED: Removed 'mt-8' to resolve Tailwind conflict. Kept only 'mt-auto'. */}
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()}{" "}
                <span className="font-semibold text-primary dark:text-primary-400">
                  KudiTrack
                </span>
                . All rights reserved.
              </p>
              <div className="flex items-center gap-5">
                <a
                  href="https://www.instagram.com/kudi.track"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors"
                  aria-label="Follow KudiTrack on Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://x.com/kuditracknaija"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors"
                  aria-label="Follow KudiTrack on X"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://kuditrack.space"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Visit App
                </a>
              </div>
            </div>
          </footer>
        </div>
      </NaijaBaseProvider>
    </ErrorBoundary>
  );
}
