import { ShoppingCart, Zap, MapPin, Flame, Calendar } from 'lucide-react';
import { naira, formatDate, todayISO } from '../utils/constants';
import { useNaijaBase } from '../context/NaijaBaseContext';

export default function DashboardSummary() {
  const { currentUser } = useNaijaBase();
  const data = currentUser?.data;

  // 🚨 FIXED: Show a loading message instead of returning null
  if (!data) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-500">
        <div className="text-center space-y-2">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
          <p>Syncing your financial data...</p>
          <p className="text-xs text-gray-400">If this stays blank for too long, please refresh the page.</p>
        </div>
      </div>
    );
  }

  const today = todayISO();
  const todayLog = data.marketLogs.find((l) => l.date === today);
  const latestLog = data.marketLogs.length > 0
    ? [...data.marketLogs].sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;
  const latestPrices = todayLog || latestLog;

  // --- Daily market total (today's sum of all item prices) ---
  let dailyTotal = 0;
  if (todayLog) {
    dailyTotal = Object.values(todayLog.prices).reduce((sum, val) => sum + (val || 0), 0);
  }

  // --- Monthly market total (sum of all daily totals for the current month) ---
  const currentMonth = today.slice(0, 7); // "YYYY-MM"
  let monthlyTotal = 0;
  data.marketLogs.forEach((log) => {
    if (log.date.startsWith(currentMonth)) {
      const dayTotal = Object.values(log.prices).reduce((sum, val) => sum + (val || 0), 0);
      monthlyTotal += dayTotal;
    }
  });

  // --- Other existing cards ---
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
      value: todayLog ? naira(dailyTotal) : 'Not logged yet',
      sub: todayLog ? `${Object.keys(todayLog.prices).length} items` : 'Visit Market page',
      icon: ShoppingCart,
      color: 'primary',
    },
    {
      label: 'Monthly Market Spend',
      value: naira(monthlyTotal),
      sub: `For ${currentMonth}`,
      icon: Calendar,
      color: 'primary',
    },
    {
      label: 'Current Gen Cost',
      value: naira(genCost),
      sub: `${totalConsumption.toFixed(1)} L/hr @ ${naira(g.fuelCostPerLiter)}/L`,
      icon: Zap,
      color: 'secondary',
    },
    {
      label: 'Active Trip',
      value: activeTrip ? `${activeTrip.origin} → ${activeTrip.destination}` : 'No trips yet',
      sub: activeTrip ? `Budget: ${naira(activeTrip.totalBudget || 0)} · ${formatDate(activeTrip.date)}` : 'Plan a trip',
      icon: MapPin,
      color: 'primary',
    },
    {
      label: 'Savings Streak',
      value: s.streak > 0 ? `${s.streak} day${s.streak !== 1 ? 's' : ''}` : 'No streak',
      sub: s.goalName ? `${s.goalName} · ${s.platform || 'No platform'}` : 'Set a goal',
      icon: Flame,
      color: 'secondary',
    },
  ];

  return (
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
                  c.color === 'primary' ? 'bg-primary-50 text-primary' : 'bg-secondary-50 text-secondary-600'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{c.label}</p>
            <p className="text-lg font-bold text-neutral-text mt-1 leading-tight truncate">{c.value}</p>
            <p className="text-xs text-gray-400 mt-1 truncate">{c.sub}</p>
          </div>
        );
      })}
    </div>
  );
}