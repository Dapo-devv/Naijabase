import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Zap, MapPin, PiggyBank, BookOpen, LogIn, UserPlus } from 'lucide-react';
import { useNaijaBase } from '../context/NaijaBaseContext';

export default function BottomNav() {
  const { state } = useNaijaBase();
  const location = useLocation();
  const loggedIn = state.currentUserId != null;

  const tab = (to, label, Icon) => {
    const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={`flex flex-col items-center justify-center gap-0.5 py-2 px-1 flex-1 min-w-0 transition-colors ${
          active ? 'text-primary' : 'text-gray-500'
        }`}
      >
        <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
        <span className="text-[10px] font-medium truncate">{label}</span>
      </Link>
    );
  };

  if (loggedIn) {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {tab('/', 'Home', Home)}
        {tab('/market', 'Market', ShoppingCart)}
        {/* 🚨 CHANGED: "Gen" to "Finance" */}
        {tab('/finance', 'Finance', Zap)}
        {tab('/trip', 'Trip', MapPin)}
        {tab('/savings', 'Save', PiggyBank)}
        {tab('/blog', 'Blog', BookOpen)}
      </nav>
    );
  }
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex z-40">
      {tab('/blog', 'Blog', BookOpen)}
      {tab('/login', 'Login', LogIn)}
      {tab('/register', 'Register', UserPlus)}
    </nav>
  );
}