import { Routes, Route } from 'react-router-dom';
import { Instagram, Twitter } from 'lucide-react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import AdSlot from './components/AdSlot';
import ProtectedRoute from './components/ProtectedRoute';
import { NaijaBaseProvider } from './context/NaijaBaseContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import MarketPage from './pages/MarketPage';
// 🚨 CHANGED IMPORT: Use the new name
import FinanceHubPage from './pages/FinanceHubPage'; 
import TripPage from './pages/TripPage';
import SavingsPage from './pages/SavingsPage';
import AdminPanel from './pages/AdminPanel';
import AdminBlogManager from './pages/AdminBlogManager';
import BlogIndex from './pages/BlogIndex';
import BlogDetail from './pages/BlogDetail';
import { useState, useEffect } from 'react';

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleError = (event) => {
      setHasError(true);
      setErrorMessage(event.error?.message || 'Unknown error occurred');
      console.error('React Error:', event.error);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-red-50 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Oops! Something crashed.</h1>
        <p className="text-red-500 mb-4 font-mono text-sm bg-red-100 p-4 rounded border border-red-200 max-w-lg break-all">
          {errorMessage}
        </p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Reload Page
        </button>
      </div>
    );
  }
  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <NaijaBaseProvider>
        <div className="min-h-screen bg-neutral-bg flex flex-col">
          <Navbar />
          <main className="flex-1 pb-20 md:pb-6">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/market" element={<ProtectedRoute><MarketPage /></ProtectedRoute>} />
              {/* 🚨 CHANGED ROUTE: /generator to /finance */}
              <Route path="/finance" element={<ProtectedRoute><FinanceHubPage /></ProtectedRoute>} />
              <Route path="/trip" element={<ProtectedRoute><TripPage /></ProtectedRoute>} />
              <Route path="/savings" element={<ProtectedRoute><SavingsPage /></ProtectedRoute>} />
              
              <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
              <Route path="/admin/blog" element={<ProtectedRoute><AdminBlogManager /></ProtectedRoute>} />
              
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
            </Routes>
          </main>

          <div className="md:hidden fixed bottom-14 left-0 w-full z-30 px-2">
            <AdSlot width={320} height={50} label="Ad Space" className="!py-2" />
          </div>
          
          <BottomNav />

          <footer className="bg-white border-t border-gray-200 py-6 mt-8">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} <span className="font-semibold text-primary">NaijaBase</span>. All rights reserved.
              </p>
              <div className="flex items-center gap-5">
                <a href="https://www.instagram.com/naijabase9" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors" aria-label="Follow NaijaBase on Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://x.com/naijabase9" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors" aria-label="Follow NaijaBase on X">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://naijabase.space" className="text-sm font-medium text-primary hover:underline">Visit App</a>
              </div>
            </div>
          </footer>

        </div>
      </NaijaBaseProvider>
    </ErrorBoundary>
  );
}