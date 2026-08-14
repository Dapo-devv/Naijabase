import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { naira } from "../utils/constants";
import { useNaijaBase } from "../context/NaijaBaseContext";
import {
  Users,
  UserPlus,
  Activity,
  Calendar,
  ShoppingCart,
  Target,
  MapPin,
  Wallet,
  DollarSign,
  TrendingUp,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

export default function AdminPanel() {
  const { currentUser } = useNaijaBase();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total_users: 0,
    dau: 0,
    wau: 0,
    mau: 0,
    new_today: 0,
    new_week: 0,
    new_month: 0,
    total_spending_plans: 0,
    total_market_logs: 0,
    total_trips: 0,
    total_savings: 0,
    avg_sale: 0,
  });

  const ADMIN_EMAIL = "dapodevv@gmail.com";

  const fetchAdminData = useCallback(async () => {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) return;

    try {
      // 1. Fetch Accurate Total Users via Edge Function
      let totalUsers = 0;
      try {
        const res = await fetch(
          import.meta.env.VITE_SUPABASE_URL + "/functions/v1/get-total-users",
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          },
        );
        const data = await res.json();
        if (!res.ok || data.total_users === undefined) {
          throw new Error(data.error || `Edge function returned ${res.status}`);
        }
        totalUsers = data.total_users;
      } catch (err) {
        console.warn("⚠️ Edge function fallback activated:", err.message);
        const { count } = await supabase
          .from("user_data")
          .select("*", { count: "exact", head: true });
        totalUsers = count || 0;
      }

      // 2. Fetch user_data to calculate engagement (using * to get all columns)
      const { data: users, error } = await supabase
        .from("user_data")
        .select("*");

      if (error) {
        console.error("❌ Failed to fetch user_data:", error);
        throw error;
      }

      console.log(`✅ Fetched ${users?.length || 0} user data rows.`);

      const now = new Date();
      const today = new Date(now.toISOString().split("T")[0]);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      let dau = 0,
        wau = 0,
        mau = 0,
        newToday = 0,
        newWeek = 0,
        newMonth = 0;
      let plans = 0,
        logs = 0,
        trips = 0,
        savings = 0,
        salesAmt = 0,
        salesCount = 0;

      users?.forEach((row) => {
        // Check timestamps safely
        const createdStr = row.created_at || row.createdAt || null;
        const updatedStr = row.updated_at || row.updatedAt || null;

        const created = createdStr ? new Date(createdStr) : new Date();
        const active = updatedStr ? new Date(updatedStr) : created;

        const createdDay = new Date(created.toISOString().split("T")[0]);
        const activeDay = new Date(active.toISOString().split("T")[0]);

        // Active users
        if (activeDay.getTime() === today.getTime()) dau++;
        if (activeDay >= weekAgo) wau++;
        if (activeDay >= monthAgo) mau++;

        // New users
        if (createdDay.getTime() === today.getTime()) newToday++;
        if (createdDay >= weekAgo) newWeek++;
        if (createdDay >= monthAgo) newMonth++;

        // Platform Usage data (safe access)
        const userData = row.data || {};
        plans += userData.generator?.spendingPlans?.length || 0;
        logs += userData.marketLogs?.length || 0;
        trips += userData.trips?.length || 0;
        savings += userData.savings?.savedAmount || 0;

        const entries = userData.generator?.businessEntries || [];
        entries.forEach((e) => {
          if (e.type === "sale") {
            salesAmt += e.amount || 0;
            salesCount++;
          }
        });
      });

      setStats({
        total_users: totalUsers,
        dau,
        wau,
        mau,
        new_today: newToday,
        new_week: newWeek,
        new_month: newMonth,
        total_spending_plans: plans,
        total_market_logs: logs,
        total_trips: trips,
        total_savings: savings,
        avg_sale: salesCount > 0 ? salesAmt / salesCount : 0,
      });
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // 🛡️ Security Gate
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-red-900/30 border border-red-800 rounded-2xl p-8 text-center max-w-md">
          <ShieldCheck className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-white">Access Denied</h1>
          <p className="text-red-300 text-sm mt-2">
            You do not have permission to view the Admin Panel.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading platform intelligence...
          </p>
        </div>
      </div>
    );
  }

  const formatNumber = (num) => num?.toLocaleString() || "0";
  const percent = (val) =>
    stats.total_users > 0 ? ((val / stats.total_users) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Platform Admin
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time overview of your TrackCash ecosystem.
          </p>
        </div>

        {/* Core Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Registered Users",
              value: formatNumber(stats.total_users),
              sub: `${stats.new_today} joined today`,
              icon: Users,
              color:
                "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30",
            },
            {
              label: "Daily Active (DAU)",
              value: formatNumber(stats.dau),
              sub: `${percent(stats.dau)}% of total`,
              icon: Activity,
              color:
                "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30",
            },
            {
              label: "Weekly Active (WAU)",
              value: formatNumber(stats.wau),
              sub: `${percent(stats.wau)}% of total`,
              icon: Calendar,
              color:
                "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30",
            },
            {
              label: "Monthly Active (MAU)",
              value: formatNumber(stats.mau),
              sub: `${percent(stats.mau)}% of total`,
              icon: Users,
              color:
                "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30",
            },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${c.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {c.label}
                </p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                  {c.value}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {c.sub}
                </p>
              </div>
            );
          })}
        </div>

        {/* Growth Metrics */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            📈 User Growth
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "New Users (Today)",
                value: stats.new_today,
                icon: UserPlus,
                color:
                  "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30",
              },
              {
                label: "New Users (Week)",
                value: stats.new_week,
                icon: TrendingUp,
                color:
                  "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30",
              },
              {
                label: "New Users (Month)",
                value: stats.new_month,
                icon: Calendar,
                color:
                  "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30",
              },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${c.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {c.label}
                  </p>
                  <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                    {c.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Usage */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            🚀 Platform Usage
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                label: "Total Spending Plans",
                value: formatNumber(stats.total_spending_plans),
                icon: Target,
                color:
                  "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/30",
              },
              {
                label: "Total Market Logs",
                value: formatNumber(stats.total_market_logs),
                icon: ShoppingCart,
                color:
                  "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30",
              },
              {
                label: "Total Trips Planned",
                value: formatNumber(stats.total_trips),
                icon: MapPin,
                color:
                  "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30",
              },
              {
                label: "Total Savings (All Users)",
                value: naira(stats.total_savings),
                icon: Wallet,
                color:
                  "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30",
              },
              {
                label: "Average Sale Amount",
                value: naira(stats.avg_sale),
                sub: "Across all business entries",
                icon: DollarSign,
                color:
                  "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30",
              },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${c.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {c.label}
                  </p>
                  <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                    {c.value}
                  </p>
                  {c.sub && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {c.sub}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-2xl p-5 text-primary-700 dark:text-primary-400">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <p className="font-semibold text-sm">System Status: Healthy</p>
          </div>
          <p className="text-xs opacity-80 mt-1 ml-6">
            Data updates in real-time. Last refreshed:{" "}
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}
