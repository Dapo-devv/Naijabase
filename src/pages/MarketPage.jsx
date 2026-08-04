import { useState, useEffect, useRef, useMemo } from "react";
import {
  ShoppingCart,
  Save,
  Pencil,
  Calendar,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import AdSlot from "../components/AdSlot";
import MarketItemList from "../components/MarketItemList";
import MarketChart from "../components/MarketChart";
import { useNaijaBase } from "../context/NaijaBaseContext";
import { formatDate, naira } from "../utils/constants";

export default function MarketPage() {
  const { currentUser, updateUserData } = useNaijaBase();
  const data = currentUser?.data;

  const [editingId, setEditingId] = useState(null);
  const [viewingLog, setViewingLog] = useState(null);
  const [prices, setPrices] = useState({});
  const [saved, setSaved] = useState(false);

  // 🚀 NEW: Date Picker for the expense log
  const [logDate, setLogDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // 🚀 NEW: Monthly Archive State
  const [selectedMonth, setSelectedMonth] = useState(null);

  const justSavedRef = useRef(false);
  const hasLoadedRef = useRef(false);

  if (!data) return null;

  // --- Load Prices into form ---
  useEffect(() => {
    if (justSavedRef.current) return;

    if (editingId) {
      const log = data.marketLogs.find((l) => l.id === editingId);
      if (log) {
        const loadedPrices = {};
        data.marketItems.forEach((it) => {
          loadedPrices[it] = log.prices?.[it] ?? "";
        });
        // 🚀 Load the date of the log being edited
        setLogDate(log.date.split("T")[0]);
        setPrices(loadedPrices);
      }
    } else {
      if (!hasLoadedRef.current) {
        const cleared = {};
        data.marketItems.forEach((it) => {
          cleared[it] = "";
        });
        setPrices(cleared);
        setLogDate(new Date().toISOString().split("T")[0]);
        hasLoadedRef.current = true;
      }
    }
  }, [data.marketItems, editingId, data.marketLogs]);

  const handlePriceChange = (item, val) => {
    setPrices((p) => ({ ...p, [item]: val }));
    setSaved(false);
  };

  const handleAddItem = (name) => {
    if (data.marketItems.includes(name)) return;
    updateUserData((d) => ({
      ...d,
      marketItems: [...d.marketItems, name],
    }));
    setPrices((p) => ({ ...p, [name]: "" }));
  };

  const handleRemoveItem = (name) => {
    updateUserData((d) => ({
      ...d,
      marketItems: d.marketItems.filter((i) => i !== name),
    }));
    setPrices((p) => {
      const copy = { ...p };
      delete copy[name];
      return copy;
    });
  };

  const handleLog = () => {
    const hasData = data.marketItems.some(
      (item) => parseFloat(prices[item]) > 0,
    );
    if (!hasData) {
      alert("Please enter at least one expense before saving.");
      return;
    }

    const pricesObj = {};
    data.marketItems.forEach((it) => {
      const v = parseFloat(prices[it]);
      pricesObj[it] = isNaN(v) ? 0 : v;
    });

    // 🚀 NEW: Uses the user-selected date instead of auto-today
    const newLog = {
      id: Date.now(),
      date: new Date(logDate).toISOString(),
      prices: pricesObj,
    };

    updateUserData((d) => ({
      ...d,
      marketLogs: [...d.marketLogs, newLog],
    }));

    justSavedRef.current = true;
    setSaved(true);
    setEditingId(null);

    const cleared = {};
    data.marketItems.forEach((it) => {
      cleared[it] = "";
    });
    setPrices(cleared);

    setTimeout(() => {
      justSavedRef.current = false;
      setSaved(false);
    }, 2500);
  };

  const handleEdit = (id) => {
    const log = data.marketLogs.find((l) => l.id === id);
    if (!log) return;
    setEditingId(id);
    setViewingLog(null);
    justSavedRef.current = false;
  };

  const handleDeleteLog = (id) => {
    if (!window.confirm(`Delete this expense log?`)) return;
    updateUserData((d) => ({
      ...d,
      marketLogs: d.marketLogs.filter((l) => l.id !== id),
    }));
    if (editingId === id) {
      setEditingId(null);
      const cleared = {};
      data.marketItems.forEach((it) => {
        cleared[it] = "";
      });
      setPrices(cleared);
    }
    setViewingLog(null);
  };

  const isEditing = !!editingId;
  const allLogs = data.marketLogs || [];

  // 🚀 Get unique months from all logs
  const monthKeys = useMemo(() => {
    const months = allLogs.map((log) => log.date.slice(0, 7));
    return [...new Set(months)].sort((a, b) => b.localeCompare(a));
  }, [allLogs]);

  // 🚀 Filter logs based on selected month
  const filteredLogs = useMemo(() => {
    if (!selectedMonth) return allLogs;
    return allLogs.filter((log) => log.date.startsWith(selectedMonth));
  }, [allLogs, selectedMonth]);

  // 🚀 Calculate totals for the currently viewed month
  const monthlyTotals = useMemo(() => {
    const totalSpent = filteredLogs.reduce(
      (sum, log) =>
        sum + Object.values(log.prices).reduce((s, v) => s + (v || 0), 0),
      0,
    );
    const totalItems = filteredLogs.reduce(
      (sum, log) => sum + Object.keys(log.prices).length,
      0,
    );
    return { totalSpent, totalItems, daysLogged: filteredLogs.length };
  }, [filteredLogs]);

  // Sort the currently displayed logs (Newest first)
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const dateA = a.date || "";
    const dateB = b.date || "";
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return (b.id || 0) - (a.id || 0);
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-text dark:text-white flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary dark:text-primary-400" />{" "}
          Daily Expense Tracker
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Log exactly how much you spent on each item. Pick any date!
        </p>
      </div>

      {/* --- INPUT FORM WITH DATE PICKER --- */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        {isEditing && (
          <div className="mb-4 flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/30 px-3 py-2 rounded-lg border border-secondary-200 dark:border-secondary-800">
            <Pencil className="w-4 h-4" /> Editing this expense log
          </div>
        )}

        {/* 🚀 NEW: Custom Date Picker */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
            Date of Expense
          </label>
          <input
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            className="w-full sm:w-1/3 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          />
        </div>

        <MarketItemList
          items={data.marketItems}
          prices={prices}
          onPriceChange={handlePriceChange}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
        />
        <button
          onClick={handleLog}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-primary text-white dark:text-white font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
        >
          <Save className="w-5 h-5" />
          {isEditing ? "Update Log" : "Log Expenses"}
        </button>
        {saved && (
          <p className="text-center text-sm text-green-600 dark:text-green-400 mt-2 animate-fade-in">
            Expense log added!
          </p>
        )}
      </div>

      <AdSlot width={300} height={250} />

      {/* --- CHART SECTION (NOW FILTERS BY SELECTED MONTH) --- */}
      <div className="w-full overflow-x-auto">
        <MarketChart logs={filteredLogs} items={data.marketItems} />
      </div>

      {/* --- MONTHLY ARCHIVE SECTION --- */}
      <div>
        <h2 className="text-lg font-bold text-neutral-text dark:text-white flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary dark:text-primary-400" />{" "}
          Expense Logs & Archives
        </h2>

        {/* Month Filter Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-6">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            Select a Month to View History
          </h3>
          <div className="flex flex-wrap gap-2">
            {monthKeys.length > 0 ? (
              monthKeys.map((month) => {
                const dateObj = new Date(month + "-01");
                const label = dateObj.toLocaleDateString("en-NG", {
                  month: "long",
                  year: "numeric",
                });
                return (
                  <button
                    key={month}
                    onClick={() => setSelectedMonth(month)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedMonth === month
                        ? "bg-primary text-white dark:bg-primary-600"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {label}
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No logs found. Start tracking your expenses above!
              </p>
            )}
          </div>
        </div>

        {/* Monthly Totals Summary Cards */}
        {selectedMonth && sortedLogs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-green-50/80 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-green-700 dark:text-green-400 uppercase">
                Total Spent
              </p>
              <p className="text-lg font-extrabold text-green-600 dark:text-green-400">
                {naira(monthlyTotals.totalSpent)}
              </p>
            </div>
            <div className="bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase">
                Items Logged
              </p>
              <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                {monthlyTotals.totalItems}
              </p>
            </div>
            <div className="bg-purple-50/80 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-purple-700 dark:text-purple-400 uppercase">
                Days Logged
              </p>
              <p className="text-lg font-extrabold text-purple-600 dark:text-purple-400">
                {monthlyTotals.daysLogged}
              </p>
            </div>
            <div className="bg-orange-50/80 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-orange-700 dark:text-orange-400 uppercase">
                Avg. Per Day
              </p>
              <p className="text-lg font-extrabold text-orange-600 dark:text-orange-400">
                {naira(
                  monthlyTotals.daysLogged > 0
                    ? Math.round(
                        monthlyTotals.totalSpent / monthlyTotals.daysLogged,
                      )
                    : 0,
                )}
              </p>
            </div>
          </div>
        )}

        {/* 🚨 CLEAR AND PERSONALIZED MESSAGE FOR EACH MONTH */}
        <div className="space-y-3">
          {sortedLogs.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 border border-dashed dark:border-gray-700">
              <p className="text-sm">
                {selectedMonth
                  ? `📭 No expense records found for ${new Date(
                      selectedMonth + "-01",
                    ).toLocaleDateString("en-NG", {
                      month: "long",
                      year: "numeric",
                    })}.`
                  : "No logs yet. Log your first daily expenses above!"}
              </p>
            </div>
          ) : (
            sortedLogs.map((log) => {
              const dailyTotal = Object.values(log.prices).reduce(
                (sum, val) => sum + (val || 0),
                0,
              );
              return (
                <div
                  key={log.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-text dark:text-white">
                      {formatDate(log.date)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {Object.keys(log.prices).length} items bought · Total
                      spent: {naira(dailyTotal)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingLog(log)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button
                      onClick={() => handleEdit(log.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --- VIEW MODAL --- */}
      {viewingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-neutral-text dark:text-white">
                Expense Details
              </h3>
              <button
                onClick={() => setViewingLog(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Date
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {formatDate(viewingLog.date)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-primary-50 dark:bg-primary-900/30 rounded-xl p-3">
                <span className="text-sm text-primary-600 dark:text-primary-400">
                  Total Spent
                </span>
                <span className="font-bold text-primary dark:text-primary-400 text-lg">
                  {naira(
                    Object.values(viewingLog.prices).reduce((a, b) => a + b, 0),
                  )}
                </span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Purchase Breakdown
                </p>
                <div className="space-y-1.5">
                  {Object.entries(viewingLog.prices).map(([item, price]) => (
                    <div
                      key={item}
                      className="flex justify-between text-sm py-1 border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {item}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {naira(price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-center">
              <button
                onClick={() => setViewingLog(null)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
