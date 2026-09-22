import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Instagram, Twitter } from "lucide-react";
import { useEffect, useState } from "react";
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
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Landing from "./pages/Landing";

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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

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

  if (state.currentUserId != null && !isPasswordRecovery) {
    if (location.pathname === "/login" || location.pathname === "/register") {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

function HomeRoute() {
  const { state } = useNaijaBase();

  if (state.loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (state.currentUserId != null) {
    return (
      <ProtectedRoute>
        <PageWrapper>
          <Dashboard />
        </PageWrapper>
      </ProtectedRoute>
    );
  }

  return (
    <PageWrapper>
      <Landing />
    </PageWrapper>
  );
}

// 🆕 Inner shell component that has access to the auth context
function AppShell() {
  const location = useLocation();
  const { state } = useNaijaBase();

  const isGuest = state.currentUserId == null;

  // 🎯 Hide Navbar + BottomNav + AdSlot on these routes
  //    for guests who haven't logged in yet:
  //    - Landing page (/)
  //    - Login (/login)
  //    - Register (/register)
  //    - Reset Password (/reset-password)
  const hideNavOnMobile =
    isGuest &&
    (location.pathname === "/" ||
      location.pathname === "/login" ||
      location.pathname === "/register" ||
      location.pathname === "/reset-password");

  return (
    <div className="h-screen overflow-hidden bg-[#F8F9FA] dark:bg-[#111827] flex flex-col transition-colors duration-300">
      {/* 📱 Mobile: hide Navbar on guest auth pages. Desktop: always show it. */}
      <div className={hideNavOnMobile ? "hidden md:block" : ""}>
        <Navbar />
      </div>

      <main
        className={`flex-1 overflow-y-auto pt-safe w-full ${
          hideNavOnMobile
            ? "pb-0"
            : "pb-[calc(env(safe-area-inset-bottom)+90px)]"
        } max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-smooth`}
      >
        <div className="min-h-full pb-0">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* PUBLIC ROUTES */}
              <Route
                path="/login"
                element={
                  <PageWrapper>
                    <AuthGuard>
                      <Login />
                    </AuthGuard>
                  </PageWrapper>
                }
              />
              <Route
                path="/register"
                element={
                  <PageWrapper>
                    <AuthGuard>
                      <Register />
                    </AuthGuard>
                  </PageWrapper>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PageWrapper>
                    <ResetPassword />
                  </PageWrapper>
                }
              />
              <Route
                path="/privacy"
                element={
                  <PageWrapper>
                    <Privacy />
                  </PageWrapper>
                }
              />
              <Route
                path="/terms"
                element={
                  <PageWrapper>
                    <Terms />
                  </PageWrapper>
                }
              />

              {/* HOME ROUTE — Landing for guests, Dashboard for users */}
              <Route path="/" element={<HomeRoute />} />

              {/* PROTECTED ROUTES */}
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

      {/* 📱 Mobile: hide AdSlot + BottomNav on guest auth pages */}
      {!hideNavOnMobile && (
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
      )}

      {/* Footer (desktop only) */}
      <footer className="hidden md:block bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
            <p className="text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-primary dark:text-primary-400">
                TrackCash
              </span>
              . All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="/privacy"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>

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
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <NaijaBaseProvider>
        <ThemeManager />
        <ScrollToTop />
        <AppShell />
      </NaijaBaseProvider>
    </ErrorBoundary>
  );
}
