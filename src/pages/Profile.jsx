import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Trash2, Download, Upload, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useNaijaBase } from '../context/NaijaBaseContext';
import { todayISO } from '../utils/constants';

export default function Profile() {
  const { currentUser, logout, deleteAccount, replaceUserData } = useNaijaBase();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [msg, setMsg] = useState(null);

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDelete = () => {
    if (window.confirm('Delete your account and all data? This cannot be undone.')) {
      deleteAccount();
      navigate('/login');
    }
  };

  const handleExport = () => {
    const date = todayISO();
    const blob = new Blob([JSON.stringify(currentUser.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `naijabase_backup_${currentUser.username}_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMsg({ type: 'success', text: 'Backup downloaded successfully.' });
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(null);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (
          typeof parsed !== 'object' ||
          parsed === null ||
          !Array.isArray(parsed.marketItems) ||
          !Array.isArray(parsed.marketLogs) ||
          typeof parsed.generator !== 'object' ||
          !Array.isArray(parsed.trips) ||
          typeof parsed.savings !== 'object'
        ) {
          setMsg({ type: 'error', text: 'Invalid file: missing required fields.' });
          return;
        }
        await replaceUserData(parsed);
        setMsg({ type: 'success', text: 'Data imported successfully.' });
      } catch (err) {
        setMsg({ type: 'error', text: 'Could not parse file. Make sure it is a valid NaijaBase backup.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Logged in as</p>
            <h2 className="text-2xl font-extrabold text-neutral-text">{currentUser.username}</h2>
            <p className="text-sm text-gray-600 mt-1">{currentUser.name} {currentUser.surname}</p>
            <p className="text-xs text-gray-400 mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-5 h-5" /> Delete Account
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 leading-relaxed">
            Your data now syncs across devices! Use Export to create a manual backup.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-neutral-text mb-1">Backup & Restore</h3>
        <p className="text-sm text-gray-500 mb-5">Export your data to a file, or import a backup to restore it.</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
          >
            <Download className="w-5 h-5" /> Export Data
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary-600 transition-colors"
          >
            <Upload className="w-5 h-5" /> Import Data
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleImport} className="hidden" />
        </div>

        {msg && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
              msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}