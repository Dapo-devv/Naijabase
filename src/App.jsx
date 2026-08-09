import { Routes, Route, useLocation } from "react-router-dom";
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
import ResetPassword from "./pages/ResetPassword"; // <--- NEW IMPORT
import { useState, useEffect } from "react";

// Page transition wrapper
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
  // ... unchanged
  return children;
}

function ThemeManager() {
  // ... unchanged
  return null;
}

export default function App() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <NaijaBaseProvider>
        <ThemeManager />

        <div className="h-screen overflow-hidden bg-neutral-bg dark:bg-gray-900 flex flex-col transition-colors duration-300">
          <Navbar />

          <main className="flex-1 overflow-y-auto pt-safe pb-[calc(env(safe-area-inset-bottom)+90px)] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-smooth">
            <div className="min-h-full pb-0">
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route
                    path="/login"
                    element={
                      <PageWrapper>
                        <Login />
                      </PageWrapper>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PageWrapper>
                        <Register />
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
                  />{" "}
                  {/* <--- NEW ROUTE */}
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
                  {/* ... all other existing routes ... */}
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

          {/* ... footer ... */}
        </div>
      </NaijaBaseProvider>
    </ErrorBoundary>
  );
}
