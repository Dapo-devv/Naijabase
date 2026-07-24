import {
  ShoppingCart,
  Zap,
  MapPin,
  Flame,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { naira, formatDate, todayISO } from "../utils/constants";
import { useNaijaBase } from "../context/NaijaBaseContext";

export default function DashboardSummary() {
  const { currentUser } = useNaijaBase();
  const data = currentUser?.data;

  if (!data) return null;

  const today = todayISO();
  const todayLog = data.marketLogs.find((l) => l.date === today);
  const latestLog =
    data.marketLogs.length > 0
      ? [...data.marketLogs].sort((a, b) => b.date.localeCompare(a.date))[0]
      : null;
  const latestPrices = todayLog || latestLog;

  // --- Daily market total ---
  let dailyTotal = 0;
  if (todayLog) {
    dailyTotal = Object.values(todayLog.prices).reduce(
      (sum, val) => sum + (val || 0),
      0,
    );
  }

  // --- Monthly market total (for the current month) ---
  const currentMonth = today.slice(0, 7); // "YYYY-MM"
  let monthlyTotal = 0;
  data.marketLogs.forEach((log) => {
    if (log.date.startsWith(currentMonth)) {
      const dayTotal = Object.values(log.prices).reduce(
        (sum, val) => sum + (val || 0),
        0,
      );
      monthlyTotal += dayTotal;
    }
  });

  // --- 🚀 NEW: Group spending by month for the history list ---
  const monthlyHistory = {};
  data.marketLogs.forEach((log) => {
    const monthKey = log.date.slice(0, 7); // "YYYY-MM"
    const dayTotal = Object.values(log.prices).reduce(
      (sum, val) => sum + (val || 0),
      0,
    );
    if (!monthlyHistory[monthKey]) monthlyHistory[monthKey] = 0;
    monthlyHistory[monthKey] += dayTotal;
  });

  // Sort months descending (newest first) and limit to last 12 months
  const sortedMonths = Object.keys(monthlyHistory)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 12);

  // --- Generator costs ---
  const g = data.generator;
  const applianceLoad =
    (g.appliances.ac ? 0.8 : 0) +
    (g.appliances.fridge ? 0.4 : 0) +
    (g.appliances.tv ? 0.2 : 0) +
    (g.appliances.lights ? 0.1 : 0);
  const totalConsumption = (parseFloat(g.consumptionRate) || 0) + applianceLoad;
  const genCost = totalConsumption * (parseFloat(g.fuelCostPerLiter) || 0);

  const activeTrip = data.trips[data.trips.length - 1];
  const s = data.savings;

  const cards = [
    {
      label: "Today's Market",
      value: todayLog ? naira(dailyTotal) : "Not logged yet",
      sub: todayLog
        ? `${Object.keys(todayLog.prices).length} items`
        : "Visit Market page",
      icon: ShoppingCart,
      color: "primary",
    },
    {
      label: "Current Gen Cost",
      value: naira(genCost),
      sub: `${totalConsumption.toFixed(1)} L/hr @ ${naira(g.fuelCostPerLiter)}/L`,
      icon: Zap,
      color: "secondary",
    },
    {
      label: "Active Trip",
      value: activeTrip
        ? `${activeTrip.origin} → ${activeTrip.destination}`
        : "No trips yet",
      sub: activeTrip
        ? `Budget: ${naira(activeTrip.totalBudget || 0)} · ${formatDate(activeTrip.date)}`
        : "Plan a trip",
      icon: MapPin,
      color: "primary",
    },
    {
      label: "Savings Streak",
      value:
        s.streak > 0
          ? `${s.streak} day${s.streak !== 1 ? "s" : ""}`
          : "No streak",
      sub: s.goalName
        ? `${s.goalName} · ${s.platform || "No platform"}`
        : "Set a goal",
      icon: Flame,
      color: "secondary",
    },
    {
      label: "Current Month Spend",
      value: naira(monthlyTotal),
      sub: `For ${currentMonth}`,
      icon: Calendar,
      color: "primary",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    c.color === "primary"
                      ? "bg-primary-50 text-primary"
                      : "bg-secondary-50 text-secondary-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {c.label}
              </p>
              <p className="text-lg font-bold text-neutral-text mt-1 leading-tight truncate">
                {c.value}
              </p>
              <p className="text-xs text-gray-400 mt-1 truncate">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* 🚀 NEW: Monthly Spending Breakdown List */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-neutral-text">
            Monthly Spending Breakdown
          </h3>
        </div>
        {sortedMonths.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No monthly data yet. Start logging your market expenses to see your
            history here.
          </p>
        ) : (
          <div className="space-y-2">
            {sortedMonths.map((monthKey) => {
              // Convert "2026-07" to "Jul 2026"
              const dateObj = new Date(monthKey + "-01");
              const monthName = dateObj.toLocaleDateString("en-NG", {
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={monthKey}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {monthName}
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {naira(monthlyHistory[monthKey])}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
