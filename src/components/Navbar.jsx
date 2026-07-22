import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Zap, MapPin, PiggyBank, BookOpen, User, LogIn, UserPlus, LogOut, Shield } from 'lucide-react';
import { useNaijaBase } from '../context/NaijaBaseContext';

export default function Navbar() {
  const { state, logout, currentUser } = useNaijaBase();
  const location = useLocation();
  const navigate = useNavigate();
  const loggedIn = state.currentUserId != null;
  
  // --- SECURITY: Only show Admin button to you ---
  const ADMIN_EMAIL = "dapodevv@gmail.com"; 
  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkBase = 'px-3 py-2 rounded-lg text-sm font-medium transition-colors';
  const active = 'text-primary bg-primary-50';
  const idle = 'text-gray-600 hover:text-primary hover:bg-gray-100';

  const isActive = (path) => (location.pathname === path ? active : idle);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* --- REPLACED WITH YOUR REAL LOGO --- */}
        <Link to="/" className="flex items-center gap-2 group">
          <img 
            src="/naijabase-logo.png" 
            alt="NaijaBase Logo" 
            className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" 
          />
          <span className="text-xl font-extrabold text-primary tracking-tight">NaijaBase</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {loggedIn ? (
            <>
              <Link to="/" className={`${linkBase} ${isActive('/')}`}>Dashboard</Link>
              <Link to="/market" className={`${linkBase} ${isActive('/market')}`}>Market</Link>
              <Link to="/generator" className={`${linkBase} ${isActive('/generator')}`}>Gen</Link>
              <Link to="/trip" className={`${linkBase} ${isActive('/trip')}`}>Trip</Link>
              <Link to="/savings" className={`${linkBase} ${isActive('/savings')}`}>Savings</Link>
              <Link to="/blog" className={`${linkBase} ${isActive('/blog')}`}>Blog</Link>
              <Link to="/profile" className={`${linkBase} ${isActive('/profile')}`}>Profile</Link>
              
              {/* Admin Link - Only visible to you */}
              {isAdmin && (
                <Link to="/admin" className={`${linkBase} ${isActive('/admin')} text-red-600 hover:bg-red-50 border border-red-200`}>
                  <Shield className="w-4 h-4 inline mr-1" /> Admin
                </Link>
              )}

              <button onClick={handleLogout} className={`${linkBase} text-red-600 hover:bg-red-50 flex items-center gap-1.5`}>
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/blog" className={`${linkBase} ${isActive('/blog')}`}>Blog</Link>
              <Link to="/login" className={`${linkBase} ${isActive('/login')}`}>Login</Link>
              <Link to="/register" className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-600 transition-colors">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}