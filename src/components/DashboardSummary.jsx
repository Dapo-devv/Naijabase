import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Briefcase,
  Target,
  MapPin,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { useNaijaBase } from "../context/NaijaBaseContext";
import { naira, todayISO, formatDate } from "../utils/constants";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const SkeletonCard = () => (
  <div className="bg-gray-100 dark:bg-gray-700/50 rounded-2xl p-5 animate-pulse border-l-4 border-gray-300 dark:border-gray-600">
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-xl bg-gray-300 dark:bg-gray-600" />
      <div className="w-10 h-4 bg-gray-200 dark:bg-gray-500 rounded" />
    </div>
    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-500 rounded mb-2" />
    <div className="h-8 w-32 bg-gray-300 dark:bg-gray-600 rounded" />
    <div className="mt-2 h-3 w-24 bg-gray-200 dark:bg-gray-500 rounded" />
  </div>
);

export default function DashboardSummary() {
  const { currentUser } = useNaijaBase();
  const data = currentUser?.data;

  // --- ALL HOOKS DECLARED AT THE TOP (FIXES HOOK ORDER ERROR) ---
  const today = todayISO();
  const currentMonth = today.slice(0, 7);

  const {
    monthlySpend,
    todaySpend,
    monthlySales,
    latestPlan,
    planRemaining,
    planColor,
    progressPercent,
    activeTrips,
  } = useMemo(() => {
    // Default safe values if data is missing
    if (!data) {
      return {
        monthlySpend: 0,
        todaySpend: 0,
        monthlySales: 0,
        latestPlan: null,
        planRemaining: null,
        planColor: "text-green-300",
        progressPercent: 0,
        activeTrips: [],
      };
    }

    const monthlySpend = data.marketLogs
      .filter((l) => l.date.startsWith(currentMonth))
      .reduce(
        (sum, log) =>
          sum + Object.values(log.prices).reduce((s, v) => s + (v || 0), 0),
        0,
      );

    const todayLogs = data.marketLogs.filter(
      (l) => l.date.split("T")[0] === today,
    );
    const todaySpend = todayLogs.reduce(
      (sum, log) =>
        sum + Object.values(log.prices).reduce((s, v) => s + (v || 0), 0),
      0,
    );

    const businessEntries = data.generator?.businessEntries || [];
    const monthlySales = businessEntries
      .filter((e) => e.type === "sale" && e.date.startsWith(currentMonth))
      .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

    const spendingPlans = data.generator?.spendingPlans || [];
    const latestPlan = spendingPlans.sort((a, b) =>
      b.date.localeCompare(a.date),
    )[0];

    let planRemaining = null;
    let planColor = "text-green-300";
    let progressPercent = 0;
    if (latestPlan) {
      planRemaining = latestPlan.totalIncome - latestPlan.totalAllocated;
      planColor = planRemaining >= 0 ? "text-green-300" : "text-red-300";
      progressPercent = Math.min(
        100,
        (latestPlan.totalAllocated / latestPlan.totalIncome) * 100,
      );
    }

    const trips = data.trips || [];
    const activeTrips = trips.filter((t) => new Date(t.date) >= new Date());

    return {
      monthlySpend,
      todaySpend,
      monthlySales,
      latestPlan,
      planRemaining,
      planColor,
      progressPercent,
      activeTrips,
    };
  }, [data, today, currentMonth]);

  // --- SKELETON LOADER ---
  if (!data) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-5 sm:p-6 h-32 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-5 h-32 animate-pulse" />
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-5 h-32 animate-pulse" />
        </div>
      </div>
    );
  }

  // --- CARD CONFIG (Memoized to prevent re-calculation) ---
  const cardConfigs = useMemo(
    () => [
      {
        key: "spend",
        label: "Monthly Spend",
        value: naira(monthlySpend),
        sub: `Today: ${naira(todaySpend)}`,
        icon: ShoppingCart,
        borderColor: "border-red-500",
        bgColor: "bg-red-50/40 dark:bg-red-900/20",
        iconColor: "bg-red-500 text-white",
      },
      {
        key: "revenue",
        label: "Business Revenue",
        value: naira(monthlySales),
        sub: `${data.generator?.businessEntries?.filter((e) => e.type === "sale" && e.date.startsWith(currentMonth)).length || 0} transactions`,
        icon: Briefcase,
        borderColor: "border-green-500",
        bgColor: "bg-green-50/40 dark:bg-green-900/20",
        iconColor: "bg-green-500 text-white",
      },
      {
        key: "plan",
        label: "Spending Plan",
        value: latestPlan
          ? naira(latestPlan.totalIncome - latestPlan.totalAllocated)
          : "No plan",
        sub: latestPlan
          ? `Progress: ${Math.round(progressPercent)}%`
          : "Set a budget",
        icon: Target,
        borderColor: "border-purple-500",
        bgColor: "bg-purple-50/40 dark:bg-purple-900/20",
        iconColor: "bg-purple-500 text-white",
        isPlan: true,
      },
      {
        key: "trips",
        label: "Active Trips",
        value: activeTrips.length,
        sub:
          activeTrips.length > 0
            ? `Next: ${activeTrips[0].origin} → ${activeTrips[0].destination}`
            : "Plan a new adventure",
        icon: MapPin,
        borderColor: "border-amber-500",
        bgColor: "bg-amber-50/40 dark:bg-amber-900/20",
        iconColor: "bg-amber-500 text-white",
      },
    ],
    [
      monthlySpend,
      todaySpend,
      monthlySales,
      data,
      currentMonth,
      latestPlan,
      progressPercent,
      activeTrips,
    ],
  );

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-900 dark:to-gray-800 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden shadow-md"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex justify-between items-start sm:items-center">
            <div>
              <p className="text-primary-100/80 text-xs font-medium uppercase tracking-wider">
                Welcome back, {currentUser?.name || "User"} 👋
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                TrackCash
              </h1>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl px-3 py-2 text-right max-w-[140px] sm:max-w-full">
              <p className="text-[10px] text-white/70 uppercase tracking-wider leading-tight">
                {latestPlan ? "Plan Remaining" : "Plan Status"}
              </p>
              {latestPlan ? (
                <p
                  className={`text-lg sm:text-xl font-bold ${planColor} truncate`}
                >
                  {naira(Math.abs(planRemaining))}
                  {planRemaining < 0 ? " ⚠️" : ""}
                </p>
              ) : (
                <p className="text-xs font-medium text-white/80 truncate">
                  No active plan
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1 whitespace-nowrap">
              <TrendingUp className="w-3 h-3 text-green-300" /> Sales:{" "}
              <span className="font-semibold text-white">
                {naira(monthlySales)}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1 whitespace-nowrap">
              <TrendingDown className="w-3 h-3 text-red-300" /> Spend:{" "}
              <span className="font-semibold text-white">
                {naira(monthlySpend)}
              </span>
            </div>
            {todaySpend > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1 whitespace-nowrap">
                <Calendar className="w-3 h-3 text-blue-300" /> Today:{" "}
                <span className="font-semibold text-white">
                  {naira(todaySpend)}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 4 Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {cardConfigs.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.key}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md overflow-hidden border-l-4 ${card.borderColor}`}
            >
              <div
                className={`absolute inset-0 ${card.bgColor} pointer-events-none`}
              />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${card.iconColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                    {card.key === "spend" ? "This Month" : ""}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  {card.label}
                </p>
                <p className="text-2xl font-extrabold text-gray-800 dark:text-white mt-0.5">
                  {card.value}
                </p>
                {card.isPlan && latestPlan && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                      <div
                        className={`h-1.5 rounded-full ${progressPercent <= 100 ? "bg-purple-600" : "bg-red-500"}`}
                        style={{ width: `${Math.min(100, progressPercent)}%` }}
                      />
                    </div>
                  </div>
                )}
                <p
                  className={`mt-2 text-xs font-medium truncate ${card.isPlan && latestPlan ? (planRemaining >= 0 ? "text-primary dark:text-primary-400" : "text-red-500") : "text-gray-400 dark:text-gray-500"}`}
                >
                  {card.sub}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Snapshot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" /> Monthly Overview
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Total Revenue
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {naira(monthlySales)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Total Spend
              </span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {naira(monthlySpend)}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-600 pt-2">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                Net Balance
              </span>
              <span
                className={`font-bold ${monthlySales - monthlySpend >= 0 ? "text-primary dark:text-primary-400" : "text-red-600 dark:text-red-400"}`}
              >
                {naira(monthlySales - monthlySpend)}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" /> Today's Activity
          </h3>
          {todaySpend > 0 ? (
            <div className="space-y-2">
              {data.marketLogs
                .filter((l) => l.date.split("T")[0] === today)
                .slice(0, 3)
                .map((log, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {Object.keys(log.prices).length} items logged
                    </span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                      {naira(
                        Object.values(log.prices).reduce((a, b) => a + b, 0),
                      )}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-2">
              No expenses logged today.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
