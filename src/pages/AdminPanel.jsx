import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { formatCurrency, formatDate, getCurrency } from "../utils/constants";
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
  Search,
  X,
  Eye,
  BookOpen,
  Mail,
  Clock,
  Filter,
  ChevronDown,
  ArrowUpRight,
  FileText,
  Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const ADMIN_EMAIL = "dapodevv@gmail.com";

// ---------- SUB-COMPONENTS ----------

function AccessDenied() {
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

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
      )}
    </div>
  );
}

// ---------- MAIN COMPONENT ----------

export default function AdminPanel() {
  const { currentUser } = useNaijaBase();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

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
    total_business_entries: 0,
  });

  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  // ---------- FETCH ----------
  const fetchAdminData = useCallback(async () => {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) return;

    try {
      // 1. Total users via Edge Function (with fallback)
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
        if (!res.ok || data.total_users === undefined)
          throw new Error("Edge fail");
        totalUsers = data.total_users;
      } catch {
        const { count } = await supabase
          .from("user_data")
          .select("*", { count: "exact", head: true });
        totalUsers = count || 0;
      }

      // 2. All user_data rows
      const { data: rows, error: fetchErr } = await supabase
        .from("user_data")
        .select("*")
        .order("updated_at", { ascending: false });

      if (fetchErr) throw fetchErr;

      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const today = new Date(todayStr);
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
        salesCount = 0,
        businessEntriesTotal = 0;

      const userList = [];
      const activityFeed = [];

      rows?.forEach((row) => {
        const ud = row.data || {};
        const created = new Date(row.created_at || row.updated_at);
        const active = new Date(row.updated_at || row.created_at);

        const createdDay = created.toISOString().split("T")[0];
        const activeDay = active.toISOString().split("T")[0];

        if (activeDay === todayStr) dau++;
        if (new Date(activeDay) >= weekAgo) wau++;
        if (new Date(activeDay) >= monthAgo) mau++;

        if (createdDay === todayStr) newToday++;
        if (new Date(createdDay) >= weekAgo) newWeek++;
        if (new Date(createdDay) >= monthAgo) newMonth++;

        const userPlans = ud.generator?.spendingPlans?.length || 0;
        const userLogs = ud.marketLogs?.length || 0;
        const userTrips = ud.trips?.length || 0;
        const userSavings = ud.savings?.savedAmount || 0;
        const userBusiness = ud.generator?.businessEntries || [];

        plans += userPlans;
        logs += userLogs;
        trips += userTrips;
        savings += userSavings;
        businessEntriesTotal += userBusiness.length;

        let userSalesAmount = 0;
        let userSalesCount = 0;
        userBusiness.forEach((e) => {
          if (e.type === "sale") {
            userSalesAmount += e.amount || 0;
            userSalesCount++;
            salesAmt += e.amount || 0;
            salesCount++;

            activityFeed.push({
              id: `sale-${e.id}`,
              type: "sale",
              user: ud.name
                ? `${ud.name} ${ud.surname || ""}`.trim()
                : ud.username || ud.email || "Unknown",
              userId: row.id,
              text: `Recorded a sale — ${e.title || "Sale"}`,
              amount: e.amount,
              currency: ud.currency || "NGN",
              date: new Date(e.createdAt || e.date),
            });
          } else if (e.type === "expense") {
            activityFeed.push({
              id: `exp-${e.id}`,
              type: "expense",
              user: ud.name
                ? `${ud.name} ${ud.surname || ""}`.trim()
                : ud.username || ud.email || "Unknown",
              userId: row.id,
              text: `Logged an expense — ${e.title || "Expense"}`,
              amount: e.amount,
              currency: ud.currency || "NGN",
              date: new Date(e.createdAt || e.date),
            });
          }
        });

        // Market log events
        (ud.marketLogs || []).slice(-3).forEach((log) => {
          const total = Object.values(log.prices || {}).reduce(
            (s, v) => s + (v || 0),
            0,
          );
          activityFeed.push({
            id: `log-${log.id}`,
            type: "market",
            user: ud.name
              ? `${ud.name} ${ud.surname || ""}`.trim()
              : ud.username || ud.email || "Unknown",
            userId: row.id,
            text: `Logged ${Object.keys(log.prices || {}).length} market items`,
            amount: total,
            currency: ud.currency || "NGN",
            date: new Date(log.date),
          });
        });

        // Plan creation events
        (ud.generator?.spendingPlans || []).slice(-2).forEach((plan) => {
          activityFeed.push({
            id: `plan-${plan.id}`,
            type: "plan",
            user: ud.name
              ? `${ud.name} ${ud.surname || ""}`.trim()
              : ud.username || ud.email || "Unknown",
            userId: row.id,
            text: `Created a spending plan (${plan.items?.length || 0} categories)`,
            amount: plan.totalIncome,
            currency: ud.currency || "NGN",
            date: new Date(plan.date),
          });
        });

        // Signup event
        activityFeed.push({
          id: `signup-${row.id}`,
          type: "signup",
          user: ud.name
            ? `${ud.name} ${ud.surname || ""}`.trim()
            : ud.username || ud.email || "New user",
          userId: row.id,
          text: "Joined TrackCash",
          currency: ud.currency || "NGN",
          date: created,
        });

        userList.push({
          id: row.id,
          email: ud.email || "—",
          username: ud.username || "—",
          name: ud.name || "",
          surname: ud.surname || "",
          fullName:
            `${ud.name || ""} ${ud.surname || ""}`.trim() ||
            ud.username ||
            "Unnamed",
          currency: ud.currency || "NGN",
          timezone: ud.timezone || "—",
          profilePicture: ud.profilePicture || "",
          createdAt: created,
          lastActive: active,
          marketLogs: userLogs,
          spendingPlans: userPlans,
          trips: userTrips,
          savings: userSavings,
          businessEntries: userBusiness.length,
          salesAmount: userSalesAmount,
          salesCount: userSalesCount,
          loginAlerts: ud.loginAlerts ?? true,
          rawData: ud,
        });
      });

      // Sort activities
      activityFeed.sort((a, b) => b.date - a.date);

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
        total_business_entries: businessEntriesTotal,
      });
      setUsers(userList);
      setActivities(activityFeed.slice(0, 40));
    } catch (err) {
      console.error("Failed to load admin stats:", err);
      setError(err.message || "Failed to load admin data.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Filtered & sorted users
  const filteredUsers = useMemo(() => {
    let list = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q),
      );
    }
    switch (sortBy) {
      case "recent":
        list.sort((a, b) => b.lastActive - a.lastActive);
        break;
      case "joined":
        list.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "active":
        list.sort(
          (a, b) =>
            b.marketLogs +
            b.businessEntries +
            b.spendingPlans -
            (a.marketLogs + a.businessEntries + a.spendingPlans),
        );
        break;
      default:
        break;
    }
    return list;
  }, [users, search, sortBy]);

  // Growth chart data (last 14 days)
  const growthData = useMemo(() => {
    const days = 14;
    const arr = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split("T")[0];
      const signups = users.filter(
        (u) => u.createdAt.toISOString().split("T")[0] === dayStr,
      ).length;
      const active = users.filter(
        (u) => u.lastActive.toISOString().split("T")[0] === dayStr,
      ).length;
      arr.push({
        day: d.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        }),
        signups,
        active,
      });
    }
    return arr;
  }, [users]);

  // ---------- GATES ----------
  if (!currentUser || currentUser.email !== ADMIN_EMAIL)
    return <AccessDenied />;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading platform data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                Platform Admin
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Live overview of every user activity on TrackCash.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                Live
              </span>
            </div>
            <button
              onClick={fetchAdminData}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "users", label: `Users (${users.length})`, icon: Users },
            {
              id: "activity",
              label: `Activity (${activities.length})`,
              icon: Activity,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-700 shadow text-primary dark:text-primary-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ============ OVERVIEW TAB ============ */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Core metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Total Users"
                value={stats.total_users.toLocaleString()}
                sub={`${stats.new_today} joined today`}
                color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              />
              <StatCard
                icon={Activity}
                label="Active Today"
                value={stats.dau.toLocaleString()}
                sub={`${stats.total_users ? Math.round((stats.dau / stats.total_users) * 100) : 0}% of total`}
                color="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              />
              <StatCard
                icon={Calendar}
                label="Active This Week"
                value={stats.wau.toLocaleString()}
                sub={`${stats.total_users ? Math.round((stats.wau / stats.total_users) * 100) : 0}% of total`}
                color="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
              />
              <StatCard
                icon={Users}
                label="Active This Month"
                value={stats.mau.toLocaleString()}
                sub={`${stats.total_users ? Math.round((stats.mau / stats.total_users) * 100) : 0}% of total`}
                color="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
              />
            </div>

            {/* Growth chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Growth —
                    Last 14 Days
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    New signups and daily active users
                  </p>
                </div>
              </div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={
                        document.documentElement.classList.contains("dark")
                          ? "#374151"
                          : "#E5E7EB"
                      }
                    />
                    <XAxis
                      dataKey="day"
                      tick={{
                        fontSize: 11,
                        fill: document.documentElement.classList.contains(
                          "dark",
                        )
                          ? "#9CA3AF"
                          : "#6B7280",
                      }}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: document.documentElement.classList.contains(
                          "dark",
                        )
                          ? "#9CA3AF"
                          : "#6B7280",
                      }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: document.documentElement.classList.contains(
                          "dark",
                        )
                          ? "#1F2937"
                          : "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="signups"
                      stroke="#0A8C4A"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      name="New Users"
                    />
                    <Line
                      type="monotone"
                      dataKey="active"
                      stroke="#F4A261"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      name="Active"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Growth summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={UserPlus}
                label="New Today"
                value={stats.new_today}
                color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
              />
              <StatCard
                icon={TrendingUp}
                label="New This Week"
                value={stats.new_week}
                color="bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
              />
              <StatCard
                icon={Calendar}
                label="New This Month"
                value={stats.new_month}
                color="bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
              />
            </div>

            {/* Platform usage */}
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              🚀 Platform Usage
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Target}
                label="Spending Plans"
                value={stats.total_spending_plans.toLocaleString()}
                color="bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
              />
              <StatCard
                icon={ShoppingCart}
                label="Market Logs"
                value={stats.total_market_logs.toLocaleString()}
                color="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
              />
              <StatCard
                icon={Briefcase}
                label="Business Entries"
                value={stats.total_business_entries.toLocaleString()}
                color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              />
              <StatCard
                icon={MapPin}
                label="Trips Planned"
                value={stats.total_trips.toLocaleString()}
                color="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
              />
              <StatCard
                icon={Wallet}
                label="Total Savings"
                value={formatCurrency(stats.total_savings, "NGN")}
                color="bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
              />
              <StatCard
                icon={DollarSign}
                label="Avg. Sale"
                value={formatCurrency(stats.avg_sale, "NGN")}
                color="bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
              />
            </div>
          </motion.div>
        )}

        {/* ============ USERS TAB ============ */}
        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or username..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-primary/30"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-primary/30"
              >
                <option value="recent">Recently Active</option>
                <option value="joined">Recently Joined</option>
                <option value="active">Most Active</option>
              </select>
            </div>

            {/* Users List */}
            {filteredUsers.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {search ? "No users match your search." : "No users yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <motion.button
                    key={u.id}
                    whileHover={{ scale: 1.005 }}
                    onClick={() => setSelectedUser(u)}
                    className="w-full text-left bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary-400 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {u.profilePicture ? (
                          <img
                            src={u.profilePicture}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-primary dark:text-primary-400 font-bold text-sm">
                            {u.fullName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {u.fullName}
                          </p>
                          <span className="text-[10px] font-bold uppercase bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                            {u.currency}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {u.email}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500 mt-1 flex-wrap">
                          <span>
                            Joined {formatDate(u.createdAt.toISOString())}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span>
                            Active {formatDate(u.lastActive.toISOString())}
                          </span>
                        </div>
                      </div>

                      {/* Quick stats */}
                      <div className="hidden sm:flex items-center gap-4 text-right">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase">
                            Logs
                          </p>
                          <p className="text-sm font-bold text-gray-800 dark:text-white">
                            {u.marketLogs}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase">
                            Plans
                          </p>
                          <p className="text-sm font-bold text-gray-800 dark:text-white">
                            {u.spendingPlans}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase">
                            Sales
                          </p>
                          <p className="text-sm font-bold text-gray-800 dark:text-white">
                            {u.salesCount}
                          </p>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ============ ACTIVITY TAB ============ */}
        {activeTab === "activity" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {activities.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No activity yet. Once users start using the app, their actions
                  will appear here in real-time.
                </p>
              </div>
            ) : (
              activities.map((act) => {
                const icons = {
                  sale: {
                    i: DollarSign,
                    c: "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400",
                  },
                  expense: {
                    i: ShoppingCart,
                    c: "text-red-500 bg-red-50 dark:bg-red-900/30 dark:text-red-400",
                  },
                  market: {
                    i: ShoppingCart,
                    c: "text-orange-500 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400",
                  },
                  plan: {
                    i: Target,
                    c: "text-purple-500 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400",
                  },
                  signup: {
                    i: UserPlus,
                    c: "text-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400",
                  },
                };
                const { i: Icon, c: colorClass } =
                  icons[act.type] || icons.market;

                // Time ago
                const diff = Date.now() - act.date.getTime();
                const mins = Math.floor(diff / 60000);
                const hours = Math.floor(diff / 3600000);
                const days = Math.floor(diff / 86400000);
                let timeAgo = "Just now";
                if (mins >= 1 && mins < 60) timeAgo = `${mins}m ago`;
                else if (hours >= 1 && hours < 24) timeAgo = `${hours}h ago`;
                else if (days >= 1 && days < 30) timeAgo = `${days}d ago`;
                else timeAgo = formatDate(act.date.toISOString());

                return (
                  <div
                    key={act.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {act.user}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                              {act.text}
                            </p>
                          </div>
                          {act.amount != null && (
                            <p className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                              {formatCurrency(act.amount, act.currency)}
                            </p>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
                          {timeAgo}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </div>

      {/* ============ USER DETAIL MODAL ============ */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 dark:bg-black/80 p-0 sm:p-4 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  User Details
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {selectedUser.profilePicture ? (
                      <img
                        src={selectedUser.profilePicture}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-primary dark:text-primary-400 font-bold text-xl">
                        {selectedUser.fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">
                      {selectedUser.fullName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      @{selectedUser.username}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Joined
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                      {formatDate(selectedUser.createdAt.toISOString())}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Active
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                      {formatDate(selectedUser.lastActive.toISOString())}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Currency
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                      {getCurrency(selectedUser.currency).flag}{" "}
                      {selectedUser.currency}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Timezone
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5 truncate">
                      {selectedUser.timezone}
                    </p>
                  </div>
                </div>

                {/* Usage stats */}
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-2">
                    📊 Usage Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        label: "Market Logs",
                        value: selectedUser.marketLogs,
                        icon: ShoppingCart,
                        color:
                          "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20",
                      },
                      {
                        label: "Spending Plans",
                        value: selectedUser.spendingPlans,
                        icon: Target,
                        color:
                          "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
                      },
                      {
                        label: "Business Entries",
                        value: selectedUser.businessEntries,
                        icon: Briefcase,
                        color:
                          "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
                      },
                      {
                        label: "Trips Planned",
                        value: selectedUser.trips,
                        icon: MapPin,
                        color:
                          "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
                      },
                      {
                        label: "Total Savings",
                        value: formatCurrency(
                          selectedUser.savings,
                          selectedUser.currency,
                        ),
                        icon: Wallet,
                        color:
                          "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20",
                      },
                      {
                        label: "Total Sales",
                        value: formatCurrency(
                          selectedUser.salesAmount,
                          selectedUser.currency,
                        ),
                        icon: DollarSign,
                        color:
                          "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
                      },
                    ].map((s, i) => {
                      const I = s.icon;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3"
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}
                          >
                            <I className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {s.label}
                            </p>
                            <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                              {s.value}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Alerts */}
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      Login Alerts
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {selectedUser.loginAlerts ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      selectedUser.loginAlerts
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {selectedUser.loginAlerts ? "On" : "Off"}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
