import { Routes, Route } from 'react-router-dom';
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
import GeneratorPage from './pages/GeneratorPage';
import TripPage from './pages/TripPage';
import SavingsPage from './pages/SavingsPage';
import AdminPanel from './pages/AdminPanel';
import AdminBlogManager from './pages/AdminBlogManager';
import BlogIndex from './pages/BlogIndex';
import BlogDetail from './pages/BlogDetail';

export default function App() {
  return (
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
            <Route path="/generator" element={<ProtectedRoute><GeneratorPage /></ProtectedRoute>} />
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
      </div>
    </NaijaBaseProvider>
  );
}