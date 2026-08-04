import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { naira } from "../utils/constants";
import {
  Users,
  ShoppingCart,
  TrendingUp,
  Database,
  Activity,
  DollarSign,
  Target,
} from "lucide-react";
import { useNaijaBase } from "../context/NaijaBaseContext";

export default function AdminPanel() {
  const { currentUser } = useNaijaBase();
  const [stats, setStats] = useState({
    total_users: 0,
    active_users_7d: 0,
    total_savings: 0,
    users_with_market_logs: 0,
    total_market_logs: 0,
    avg_sale_amount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // SECURITY: Only allow your specific email
  const ADMIN_EMAIL = "dapodevv@gmail.com";

  useEffect(() => {
    // Security check
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        // 🚀 SECURE FIX: Calling the safe RPC function instead of the exposed view
        const { data, error } = await supabase.rpc("get_admin_stats");

        if (error) throw error;

        // The function returns an array with one object
        if (data && data.length > 0) {
          const statsData = data[0];
          setStats({
            total_users: statsData.total_users || 0,
            active_users_7d: statsData.active_users_7d || 0,
            total_savings: statsData.total_savings || 0,
            users_with_market_logs: statsData.users_with_market_logs || 0,
            total_market_logs: statsData.total_market_logs || 0,
            avg_sale_amount: statsData.avg_sale_amount || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError("Failed to load statistics. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser]);

  // Security Gate
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    return (
      <div className="p-10 text-center text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 min-h-screen">
        ⛔ You do not have permission to view the Admin Panel.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Loading platform intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 min-h-screen">
        <p className="text-lg font-bold">Oops!</p>
        <p>{error}</p>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Registered Users",
      value: stats.total_users,
      icon: Users,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: "Active Users (Last 7 Days)",
      value: stats.active_users_7d,
      sub: `${stats.total_users > 0 ? Math.round((stats.active_users_7d / stats.total_users) * 100) : 0}% of total`,
      icon: Activity,
      color:
        "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      label: "Total Market Logs",
      value: stats.total_market_logs,
      sub: `${stats.users_with_market_logs} users actively tracking`,
      icon: ShoppingCart,
      color:
        "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    },
    {
      label: "Total Savings (All Users)",
      value: naira(stats.total_savings),
      icon: Target,
      color:
        "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    {
      label: "Average Sale Amount",
      value: naira(stats.avg_sale_amount),
      sub: "Across all business entries",
      icon: DollarSign,
      color:
        "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-bg dark:bg-gray-900 py-6 px-4 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-text dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time aggregated overview of all KudiTrack user activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300 hover:shadow-md"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color} mb-3`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {c.label}
                </p>
                <p className="text-xl font-bold text-neutral-text dark:text-white mt-1">
                  {c.value}
                </p>
                {c.sub && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {c.sub}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* System Status Note */}
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 text-sm text-primary-700 dark:text-primary-400">
          <p className="font-semibold">🟢 System Status: Healthy</p>
          <p className="text-xs opacity-80 mt-1">
            Data updates in real-time as users interact with the platform.
          </p>
        </div>
      </div>
    </div>
  );
}
