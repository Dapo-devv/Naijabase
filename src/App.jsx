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

        <div className="h-screen overflow-hidden bg-neutral-bg dark:bg-gray-900 flex flex-col transition-colors duration-300">
          <Navbar />

          <main className="flex-1 overflow-y-auto pt-safe pb-[calc(env(safe-area-inset-bottom)+90px)] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-smooth">
            <div className="min-h-full pb-0">
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
            </div>
          </main>

          <div className="flex flex-col items-center justify-end w-full z-30 bg-neutral-bg dark:bg-gray-900 flex-shrink-0">
            <div className="w-full max-w-[360px] pb-1 px-2 sm:hidden">
              <AdSlot
                width={320}
                height={50}
                label="Ad Space"
                className="!py-1 w-full"
              />
            </div>
            <BottomNav />
          </div>

          {/* Footer for Desktop only */}
          <footer className="hidden md:block bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 break-words">
                © {new Date().getFullYear()}{" "}
                <span className="font-semibold text-primary dark:text-primary-400">
                  TrackCash
                </span>
                . All rights reserved.
              </p>
              <div className="flex items-center gap-5">
                {/* 🚨 UPDATED INSTAGRAM HANDLE */}
                <a
                  href="https://www.instagram.com/trackcash.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                {/* 🚨 UPDATED TWITTER/X HANDLE */}
                <a
                  href="https://x.com/trackcash.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors"
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
