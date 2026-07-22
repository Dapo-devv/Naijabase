import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { naira } from '../utils/constants';
import { Users, ShoppingCart, TrendingUp, Database } from 'lucide-react';
import { useNaijaBase } from '../context/NaijaBaseContext';

export default function AdminPanel() {
  const { currentUser } = useNaijaBase();
  const [stats, setStats] = useState({ totalUsers: 0, totalMarketLogs: 0, totalSavings: 0, averageRicePrice: 0 });
  const [loading, setLoading] = useState(true);

  // SECURITY: Only allow a specific email to view this page. Change this to YOUR email!
  const ADMIN_EMAIL = "dapodevv@gmail.com"; 

  useEffect(() => {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) return;
    
    const fetchStats = async () => {
      // Fetch all user data from the user_data table
      const { data, error } = await supabase
        .from('user_data')
        .select('data');

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      let totalLogs = 0;
      let totalSavingsSum = 0;
      let ricePrices = [];
      let totalUsers = data.length;

      data.forEach(row => {
        const d = row.data;
        // Count market logs
        if (d.marketLogs && Array.isArray(d.marketLogs)) {
          totalLogs += d.marketLogs.length;
          // Collect rice prices from every log
          d.marketLogs.forEach(log => {
            if (log.prices && typeof log.prices.Rice === 'number') {
              ricePrices.push(log.prices.Rice);
            }
          });
        }
        // Sum savings
        if (d.savings && typeof d.savings.savedAmount === 'number') {
          totalSavingsSum += d.savings.savedAmount;
        }
      });

      const avgRice = ricePrices.length > 0 
        ? ricePrices.reduce((a, b) => a + b, 0) / ricePrices.length 
        : 0;

      setStats({
        totalUsers,
        totalMarketLogs: totalLogs,
        totalSavings: totalSavingsSum,
        averageRicePrice: avgRice,
      });
      setLoading(false);
    };

    fetchStats();
  }, [currentUser]);

  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    return <div className="p-10 text-center text-red-500">You do not have permission to view the Admin Panel.</div>;
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading platform stats...</div>;

  const cards = [
    { label: 'Total Registered Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Market Logs', value: stats.totalMarketLogs, icon: ShoppingCart, color: 'bg-green-50 text-green-600' },
    { label: 'Total Saved (All Users)', value: naira(stats.totalSavings), icon: TrendingUp, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Avg. Rice Price (All Logs)', value: naira(stats.averageRicePrice), icon: Database, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-text">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Aggregated overview of all NaijaBase user activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{c.label}</p>
              <p className="text-xl font-bold text-neutral-text mt-1">{c.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}