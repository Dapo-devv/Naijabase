import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
import ResetPassword from "./pages/ResetPassword";
import { useState, useEffect } from "react";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const PageWrapper = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const handler = (event) => {
      console.error("Global Error:", event.error);
      setHasError(true);
    };
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-red-50 dark:bg-red-900 text-center">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-300 mb-2">
          Something went wrong.
        </h1>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded"
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
    const theme = currentUser?.theme || "light";
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [currentUser?.theme]);
  return null;
}

function AuthGuard({ children }) {
  const { state, isPasswordRecovery } = useNaijaBase();
  const location = useLocation();

  // If user is logged in and not in recovery, redirect away from auth pages
  if (state.currentUserId != null && !isPasswordRecovery) {
    // Allow access to /reset-password only if in recovery mode (already handled)
    if (location.pathname === "/reset-password") {
      return children;
    }
    return <Navigate to="/" replace />;
  }

  // If not logged in, allow access to public pages
  return children;
}

export default function App() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <NaijaBaseProvider>
        <ThemeManager />

        <div className="h-screen overflow-hidden bg-[#F8F9FA] dark:bg-[#111827] flex flex-col transition-colors duration-300">
          <Navbar />

          <main className="flex-1 overflow-y-auto pt-safe pb-[calc(env(safe-area-inset-bottom)+90px)] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-smooth">
            <div className="min-h-full pb-0">
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  {/* Public routes with AuthGuard */}
                  <Route
                    path="/login"
                    element={
                      <AuthGuard>
                        <PageWrapper>
                          <Login />
                        </PageWrapper>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <AuthGuard>
                        <PageWrapper>
                          <Register />
                        </PageWrapper>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <AuthGuard>
                        <PageWrapper>
                          <ResetPassword />
                        </PageWrapper>
                      </AuthGuard>
                    }
                  />

                  {/* Protected routes (require login) */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <PageWrapper>
                          <Dashboard />
                        </PageWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <PageWrapper>
                          <Profile />
                        </PageWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/market"
                    element={
                      <ProtectedRoute>
                        <PageWrapper>
                          <MarketPage />
                        </PageWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/finance"
                    element={
                      <ProtectedRoute>
                        <PageWrapper>
                          <FinanceHubPage />
                        </PageWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/trip"
                    element={
                      <ProtectedRoute>
                        <PageWrapper>
                          <TripPage />
                        </PageWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/savings"
                    element={
                      <ProtectedRoute>
                        <PageWrapper>
                          <SavingsPage />
                        </PageWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <PageWrapper>
                          <AdminPanel />
                        </PageWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/blog"
                    element={
                      <ProtectedRoute>
                        <PageWrapper>
                          <AdminBlogManager />
                        </PageWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/blog"
                    element={
                      <PageWrapper>
                        <BlogIndex />
                      </PageWrapper>
                    }
                  />
                  <Route
                    path="/blog/:slug"
                    element={
                      <PageWrapper>
                        <BlogDetail />
                      </PageWrapper>
                    }
                  />
                </Routes>
              </AnimatePresence>
            </div>
          </main>

          <div className="flex flex-col items-center justify-end w-full z-30 bg-[#F8F9FA] dark:bg-[#111827] flex-shrink-0">
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

          <footer className="hidden md:block bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()}{" "}
                <span className="font-semibold text-primary dark:text-primary-400">
                  TrackCash
                </span>
                . All rights reserved.
              </p>
              <div className="flex items-center gap-5">
                <a
                  href="https://www.instagram.com/trackcash.ng"
                  target="_blank"
                  rel="noopener"
                  className="text-gray-400 hover:text-primary"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://x.com/trackcash.ng"
                  target="_blank"
                  rel="noopener"
                  className="text-gray-400 hover:text-primary"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://trackcash.online"
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
