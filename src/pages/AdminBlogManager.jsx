import React, { useState, useEffect, useRef } from "react";
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

  const justSavedRef = useRef(false);
  const hasLoadedRef = useRef(false);

  if (!data) return null;

  useEffect(() => {
    if (justSavedRef.current) return;

    if (editingId) {
      const log = data.marketLogs.find((l) => l.id === editingId);
      if (log) {
        const loadedPrices = {};
        data.marketItems.forEach((it) => {
          loadedPrices[it] = log.prices?.[it] ?? "";
        });
        setPrices(loadedPrices);
      }
    } else {
      if (!hasLoadedRef.current) {
        const cleared = {};
        data.marketItems.forEach((it) => {
          cleared[it] = "";
        });
        setPrices(cleared);
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

    const newLog = {
      id: Date.now(),
      date: new Date().toISOString(),
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
  const sortedLogs = [...data.marketLogs].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return (b.id || 0) - (a.id || 0);
  });

  return (
    <div className="min-h-screen bg-neutral-bg dark:bg-gray-900 py-6 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-text dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" /> Daily Expense
            Tracker
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Log exactly how much you spent on each item today.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 transition-colors duration-300">
          {isEditing && (
            <div className="mb-4 flex items-center gap-2 text-sm text-secondary-600 bg-secondary-50 dark:bg-secondary-900/30 px-3 py-2 rounded-lg border border-secondary-200 dark:border-secondary-800">
              <Pencil className="w-4 h-4" /> Editing this expense log
            </div>
          )}
          <MarketItemList
            items={data.marketItems}
            prices={prices}
            onPriceChange={handlePriceChange}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
          />
          <button
            onClick={handleLog}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
          >
            <Save className="w-5 h-5" />
            {isEditing ? "Update Log" : "Log Today's Expenses"}
          </button>
          {saved && (
            <p className="text-center text-sm text-green-600 dark:text-green-400 mt-2 animate-fade-in">
              New expense log added!
            </p>
          )}
        </div>

        <AdSlot width={300} height={250} />

        {/* Chart Section */}
        <div className="w-full overflow-x-auto">
          <MarketChart logs={data.marketLogs} items={data.marketItems} />
        </div>

        {/* Past Logs Section */}
        <div>
          <h2 className="text-lg font-bold text-neutral-text dark:text-white flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" /> Past Expense Logs
          </h2>
          {sortedLogs.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-sm">
                No logs yet. Log your first daily expenses above!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedLogs.map((log) => {
                const dailyTotal = Object.values(log.prices).reduce(
                  (sum, val) => sum + (val || 0),
                  0,
                );
                return (
                  <div
                    key={log.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all duration-300"
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
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button
                        onClick={() => handleEdit(log.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* View Log Modal */}
        {viewingLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
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
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Date
                  </span>
                  <span className="font-semibold text-neutral-text dark:text-white">
                    {formatDate(viewingLog.date)}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-primary-50 dark:bg-primary-900/30 rounded-xl p-3">
                  <span className="text-sm text-primary-600 dark:text-primary-400">
                    Total Spent
                  </span>
                  <span className="font-bold text-primary text-lg">
                    {naira(
                      Object.values(viewingLog.prices).reduce(
                        (a, b) => a + b,
                        0,
                      ),
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
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
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-center">
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
    </div>
  );
}
