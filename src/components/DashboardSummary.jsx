import { ShoppingCart, MapPin, Flame, Calendar, Briefcase } from "lucide-react";
import { naira, formatDate, todayISO } from "../utils/constants";
import { useNaijaBase } from "../context/NaijaBaseContext";

export default function DashboardSummary() {
  const { currentUser } = useNaijaBase();
  const data = currentUser?.data;
  if (!data) return null;

  const today = todayISO();
  const todayLogs = data.marketLogs.filter(
    (l) => l.date.split("T")[0] === today,
  );
  let dailyTotal = 0,
    todayItemsCount = 0;
  todayLogs.forEach((log) => {
    dailyTotal += Object.values(log.prices).reduce((s, v) => s + (v || 0), 0);
    todayItemsCount += Object.keys(log.prices).length;
  });

  const currentMonth = today.slice(0, 7);
  let monthlyTotal = 0;
  data.marketLogs.forEach((log) => {
    if (log.date.startsWith(currentMonth)) {
      monthlyTotal += Object.values(log.prices).reduce(
        (s, v) => s + (v || 0),
        0,
      );
    }
  });

  const businessEntries = data.generator?.businessEntries || [];
  const monthlyBusinessRevenue = businessEntries
    .filter((e) => e.type === "sale" && e.date.startsWith(currentMonth))
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  const activeTrip = data.trips[data.trips.length - 1];
  const s = data.savings;

  const cards = [
    {
      label: "Today's Spend",
      value: todayLogs.length ? naira(dailyTotal) : "No expenses yet",
      sub: todayLogs.length
        ? `${todayItemsCount} items logged`
        : "Log your first purchase",
      icon: ShoppingCart,
      color: "primary",
    },
    {
      label: "Monthly Spend",
      value: naira(monthlyTotal),
      sub: `Total for ${currentMonth}`,
      icon: Calendar,
      color: "primary",
    },
    {
      label: "Business Income",
      value: naira(monthlyBusinessRevenue),
      sub: `Revenue · ${currentMonth}`,
      icon: Briefcase,
      color: "primary",
    },
    {
      label: "Active Trip",
      value: activeTrip
        ? `${activeTrip.origin} → ${activeTrip.destination}`
        : "No trips yet",
      sub: activeTrip
        ? `Budget: ${naira(activeTrip.totalBudget || 0)}`
        : "Plan a new trip",
      icon: MapPin,
      color: "primary",
    },
    {
      label: "Savings Streak",
      value:
        s.streak > 0
          ? `${s.streak} day${s.streak !== 1 ? "s" : ""}`
          : "No streak yet",
      sub: s.goalName
        ? `${s.goalName} · ${s.platform || "No platform"}`
        : "Set a savings goal",
      icon: Flame,
      color: "secondary",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color === "primary" ? "bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-400 group-hover:bg-primary group-hover:text-white transition-colors" : "bg-secondary-50 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 group-hover:bg-secondary group-hover:text-white transition-colors"}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {c.label}
            </p>
            <p className="text-lg font-bold text-neutral-text dark:text-white mt-1 leading-tight break-words truncate">
              {c.value}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
              {c.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
}
