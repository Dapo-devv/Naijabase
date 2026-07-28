import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const COLORS = [
  "#0A8C4A", // Primary Green
  "#F4A261", // Secondary Gold
  "#2563EB", // Blue
  "#DC2626", // Red
  "#7C3AED", // Purple
  "#0891B2", // Cyan
  "#EA580C", // Orange
  "#65A30D", // Lime
];

export default function MarketChart({ logs, items }) {
  // 🚀 Check: If there is not enough data, show placeholder
  if (!logs || logs.length < 2) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 border border-dashed dark:border-gray-700">
        <p className="text-sm">Add more data to see trends</p>
        <p className="text-xs mt-1">
          Log expenses on at least 2 different days
        </p>
      </div>
    );
  }

  // Sort logs by date for the chart
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));

  // 🚀 Extract X-axis labels (format dates properly)
  const labels = sorted.map((log) => {
    const date = new Date(log.date);
    return date.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
    });
  });

  // 🚀 Build datasets for each item
  const datasets = items.map((item, index) => {
    const dataPoints = sorted.map((log) => {
      const value = log.prices?.[item];
      return value != null && !isNaN(value) ? value : null;
    });

    return {
      label: item,
      data: dataPoints,
      backgroundColor: COLORS[index % COLORS.length],
      borderColor: COLORS[index % COLORS.length],
      borderWidth: 2,
      borderRadius: 4,
      maxBarThickness: 30,
    };
  });

  // 🚀 Calculate top 3 highest prices across all items and logs
  const allPrices = [];
  logs.forEach((log) => {
    items.forEach((item) => {
      const price = log.prices?.[item];
      if (price != null && !isNaN(price) && price > 0) {
        allPrices.push({ item, price, date: log.date });
      }
    });
  });

  // Get top 3 highest prices
  const topPrices = allPrices.sort((a, b) => b.price - a.price).slice(0, 3);

  // Calculate price trends (compare latest vs previous)
  const getPriceTrend = (item) => {
    const prices = sorted
      .map((log) => log.prices?.[item])
      .filter((p) => p != null && !isNaN(p) && p > 0);

    if (prices.length < 2) return { trend: "neutral", change: 0 };

    const latest = prices[prices.length - 1];
    const previous = prices[prices.length - 2];
    const change = ((latest - previous) / previous) * 100;

    if (change > 0) return { trend: "up", change: Math.round(change) };
    if (change < 0)
      return { trend: "down", change: Math.round(Math.abs(change)) };
    return { trend: "neutral", change: 0 };
  };

  const chartData = { labels, datasets };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          font: { size: 10 },
          padding: 10,
          color: document.documentElement.classList.contains("dark")
            ? "#9CA3AF"
            : "#374151",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += "₦" + context.parsed.y.toLocaleString();
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 0,
          color: document.documentElement.classList.contains("dark")
            ? "#9CA3AF"
            : "#374151",
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          font: { size: 10 },
          callback: function (value) {
            return "₦" + (value >= 1000 ? value / 1000 + "k" : value);
          },
          color: document.documentElement.classList.contains("dark")
            ? "#9CA3AF"
            : "#374151",
        },
        grid: {
          color: document.documentElement.classList.contains("dark")
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.05)",
        },
      },
    },
  };

  // 🚀 Calculate total spent across all items for each day
  const dailyTotals = sorted.map((log) => {
    const total = Object.values(log.prices).reduce(
      (sum, val) => sum + (val || 0),
      0,
    );
    return total;
  });

  const highestDailyTotal = Math.max(...dailyTotals);
  const averageDailyTotal =
    dailyTotals.reduce((a, b) => a + b, 0) / dailyTotals.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Price Trends
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Daily expense comparison across items
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary-500"></span>
            <span className="text-gray-500 dark:text-gray-400">Today</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></span>
            <span className="text-gray-500 dark:text-gray-400">Previous</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Highest Daily
          </p>
          <p className="text-sm font-bold text-primary dark:text-primary-400">
            ₦{highestDailyTotal.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Average Daily
          </p>
          <p className="text-sm font-bold text-secondary dark:text-secondary-400">
            ₦{Math.round(averageDailyTotal).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center col-span-2 sm:col-span-1">
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Items Tracked
          </p>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {items.length}
          </p>
        </div>
      </div>

      {/* 🚀 RESPONSIVE CHART CONTAINER */}
      <div className="w-full h-[250px] sm:h-[300px]">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* 🚀 Top 3 Highest Prices Section */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            🏆 Top 3 Highest Recorded Prices
          </h4>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            All-time records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topPrices.length > 0 ? (
            topPrices.map(({ item, price, date }, index) => {
              const formattedDate = new Date(date).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
              });

              // Medal emojis for top 3
              const medals = ["🥇", "🥈", "🥉"];
              const bgColors = [
                "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
                "bg-gray-50 dark:bg-gray-700/40 border-gray-200 dark:border-gray-600",
                "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
              ];
              const textColors = [
                "text-yellow-600 dark:text-yellow-400",
                "text-gray-600 dark:text-gray-400",
                "text-orange-600 dark:text-orange-400",
              ];

              return (
                <div
                  key={`${item}-${date}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${bgColors[index]} transition-transform hover:scale-[1.02] duration-200`}
                >
                  <div className="flex-shrink-0 text-lg">{medals[index]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 dark:text-gray-200 truncate text-sm">
                        {item}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {formattedDate}
                      </span>
                    </div>
                    <p className={`text-sm font-bold ${textColors[index]}`}>
                      ₦{price.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center text-sm text-gray-400 dark:text-gray-500 py-4">
              No price records available yet
            </div>
          )}
        </div>
      </div>

      {/* 🚀 Price Change Indicators */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          📊 Price Trends
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.slice(0, 6).map((item) => {
            const { trend, change } = getPriceTrend(item);
            const TrendIcon =
              trend === "up"
                ? TrendingUp
                : trend === "down"
                  ? TrendingDown
                  : Minus;
            const colorClass =
              trend === "up"
                ? "text-green-600 dark:text-green-400"
                : trend === "down"
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-400 dark:text-gray-500";

            if (change === 0 && trend === "neutral") return null;

            return (
              <div
                key={item}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 px-2 py-1.5 rounded-lg text-xs"
              >
                <span className="text-gray-600 dark:text-gray-400">{item}</span>
                <div className={`flex items-center gap-1 ${colorClass}`}>
                  <TrendIcon className="w-3 h-3" />
                  <span className="font-medium">
                    {trend !== "neutral" && `${change}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
