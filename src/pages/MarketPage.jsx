import { useState, useEffect, useRef } from "react";
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
import { todayISO, formatDate, naira } from "../utils/constants";

export default function MarketPage() {
  const { currentUser, updateUserData } = useNaijaBase();
  const data = currentUser?.data;
  const today = todayISO();
  const todayLog = data?.marketLogs.find((l) => l.date === today);

  const [editingDate, setEditingDate] = useState(null);
  const [viewingLog, setViewingLog] = useState(null);
  const [prices, setPrices] = useState({});
  const [saved, setSaved] = useState(false);

  const justSavedRef = useRef(false);

  if (!data) return null;

  // Always keep inputs blank unless editing
  useEffect(() => {
    if (justSavedRef.current) return;

    if (editingDate) {
      const log = data.marketLogs.find((l) => l.date === editingDate);
      if (log) {
        const loadedPrices = {};
        data.marketItems.forEach((it) => {
          loadedPrices[it] = log.prices?.[it] ?? "";
        });
        setPrices(loadedPrices);
      }
    } else {
      const cleared = {};
      data.marketItems.forEach((it) => {
        cleared[it] = "";
      });
      setPrices(cleared);
    }
  }, [data.marketItems, editingDate, data.marketLogs]); // ✅ justSavedRef removed here

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
    const pricesObj = {};
    data.marketItems.forEach((it) => {
      const v = parseFloat(prices[it]);
      pricesObj[it] = isNaN(v) ? 0 : v;
    });

    const targetDate = editingDate || today;
    updateUserData((d) => {
      const existingIdx = d.marketLogs.findIndex((l) => l.date === targetDate);
      let nextLogs;
      if (existingIdx >= 0) {
        nextLogs = [...d.marketLogs];
        nextLogs[existingIdx] = { date: targetDate, prices: pricesObj };
      } else {
        nextLogs = [...d.marketLogs, { date: targetDate, prices: pricesObj }];
      }
      return { ...d, marketLogs: nextLogs };
    });

    justSavedRef.current = true;
    setSaved(true);
    setEditingDate(null);

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

  const handleEdit = (logDate) => {
    const log = data.marketLogs.find((l) => l.date === logDate);
    if (!log) return;
    setEditingDate(logDate);
    setViewingLog(null);
  };

  const handleDeleteLog = (logDate) => {
    if (!window.confirm(`Delete market log for ${formatDate(logDate)}?`))
      return;
    updateUserData((d) => ({
      ...d,
      marketLogs: d.marketLogs.filter((l) => l.date !== logDate),
    }));
    if (editingDate === logDate) {
      setEditingDate(null);
      const cleared = {};
      data.marketItems.forEach((it) => {
        cleared[it] = "";
      });
      setPrices(cleared);
    }
    setViewingLog(null);
  };

  const isEditing = !!editingDate;
  const targetDate = editingDate || today;
  const hasTargetLog = data.marketLogs.some((l) => l.date === targetDate);
  const sortedLogs = [...data.marketLogs].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-text flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary" /> Daily Expense
          Tracker
        </h1>
        <p className="text-sm text-gray-500">
          Log exactly how much you spent on each item today.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {isEditing && (
          <div className="mb-4 flex items-center gap-2 text-sm text-secondary-600 bg-secondary-50 px-3 py-2 rounded-lg">
            <Pencil className="w-4 h-4" /> Editing expenses for{" "}
            <strong>{formatDate(editingDate)}</strong>
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
          {isEditing
            ? `Update Expenses for ${formatDate(editingDate)}`
            : hasTargetLog
              ? "Update Today's Expenses"
              : "Log Today's Expenses"}
        </button>
        {saved && (
          <p className="text-center text-sm text-green-600 mt-2 animate-fade-in">
            {isEditing
              ? "Expenses updated for selected date."
              : "Expenses logged for today."}
          </p>
        )}
      </div>

      <AdSlot width={300} height={250} />

      <MarketChart logs={data.marketLogs} items={data.marketItems} />

      <div>
        <h2 className="text-lg font-bold text-neutral-text flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" /> Past Expense Logs
        </h2>
        {sortedLogs.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 border border-dashed">
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
                  key={log.date}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-text">
                      {formatDate(log.date)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {Object.keys(log.prices).length} items bought · Total
                      spent: {naira(dailyTotal)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingLog(log)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button
                      onClick={() => handleEdit(log.date)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLog(log.date)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
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

      {viewingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-neutral-text">
                Expense Details
              </h3>
              <button
                onClick={() => setViewingLog(null)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3">
                <span className="text-sm text-gray-500">Date</span>
                <span className="font-semibold">
                  {formatDate(viewingLog.date)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-primary-50 rounded-xl p-3">
                <span className="text-sm text-primary-600">Total Spent</span>
                <span className="font-bold text-primary text-lg">
                  {naira(
                    Object.values(viewingLog.prices).reduce((a, b) => a + b, 0),
                  )}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Purchase Breakdown
                </p>
                <div className="space-y-1.5">
                  {Object.entries(viewingLog.prices).map(([item, price]) => (
                    <div
                      key={item}
                      className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0"
                    >
                      <span className="text-gray-700">{item}</span>
                      <span className="font-medium text-gray-900">
                        {naira(price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
              <button
                onClick={() => setViewingLog(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
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
