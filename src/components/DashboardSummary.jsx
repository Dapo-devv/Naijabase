import { ShoppingCart, MapPin, Flame, Calendar, Briefcase } from "lucide-react";
import { naira, formatDate, todayISO } from "../utils/constants";
import { useNaijaBase } from "../context/NaijaBaseContext";

export default function DashboardSummary() {
  const { currentUser } = useNaijaBase();
  const data = currentUser?.data;

  if (!data) return null;

  // 🛡️ FIXED: Gets today's date correctly handling Timezone
  const today = todayISO();
  console.log("📅 Today's date (Local ISO):", today);

  // 🛡️ FIXED: Filters ALL logs from today, not just the first one
  const todayLogs = data.marketLogs.filter((l) => {
    // We compare the YYYY-MM-DD part of the date string
    const logDate = l.date.split("T")[0];
    return logDate === today;
  });

  console.log("📊 Number of logs found for today:", todayLogs.length);

  // 🛡️ FIXED: Calculates the sum of all logs from today
  let dailyTotal = 0;
  let todayItemsCount = 0;

  if (todayLogs.length > 0) {
    todayLogs.forEach((log) => {
      const dayTotal = Object.values(log.prices).reduce(
        (sum, val) => sum + (val || 0),
        0,
      );
      dailyTotal += dayTotal;
      todayItemsCount += Object.keys(log.prices).length;
    });
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

  // --- Business Monthly Revenue from Business Hub ---
  const businessEntries = data.generator?.businessEntries || [];
  const monthlyBusinessRevenue = businessEntries
    .filter((e) => e.type === "sale" && e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  // --- Active Trip ---
  const activeTrip = data.trips[data.trips.length - 1];

  // --- Savings ---
  const s = data.savings;

  const cards = [
    {
      label: "Today's Market",
      value: todayLogs.length > 0 ? naira(dailyTotal) : "Not logged yet",
      sub:
        todayLogs.length > 0
          ? `${todayItemsCount} items logged today`
          : "Visit Market page",
      icon: ShoppingCart,
      color: "primary",
    },
    {
      label: "Monthly Market Spend",
      value: naira(monthlyTotal),
      sub: `For ${currentMonth}`,
      icon: Calendar,
      color: "primary",
    },
    {
      label: "Business Monthly Revenue",
      value: naira(monthlyBusinessRevenue),
      sub: `💼 Business · ${currentMonth}`,
      icon: Briefcase,
      color: "primary",
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
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  c.color === "primary"
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-400"
                    : "bg-secondary-50 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {c.label}
            </p>
            <p className="text-lg font-bold text-neutral-text dark:text-white mt-1 leading-tight truncate">
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
