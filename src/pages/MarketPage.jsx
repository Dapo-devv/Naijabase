import { useState, useEffect, useRef, useMemo } from "react";
import {
  ShoppingCart,
  Save,
  Pencil,
  Calendar,
  Trash2,
  Eye,
  X,
  Check,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdSlot from "../components/AdSlot";
import MarketItemList from "../components/MarketItemList";
import MarketChart from "../components/MarketChart";
import { useNaijaBase } from "../context/NaijaBaseContext";
import { formatDate, naira } from "../utils/constants";
import LoadingSpinner from "../components/LoadingSpinner";

export default function MarketPage() {
  const { currentUser, updateUserData } = useNaijaBase();
  const data = currentUser?.data;

  const [viewingLog, setViewingLog] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editPrices, setEditPrices] = useState({});
  const [editDate, setEditDate] = useState("");
  const [editItems, setEditItems] = useState([]);

  const [prices, setPrices] = useState({});
  const [logDate, setLogDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const justSavedRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // 🚀 Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!data) return null;

  useEffect(() => {
    if (justSavedRef.current) return;
    if (!hasLoadedRef.current) {
      setPrices({});
      setLogDate(new Date().toISOString().split("T")[0]);
      hasLoadedRef.current = true;
    }
  }, [data.marketItems]);

  const handleOpenEditModal = (id) => {
    const log = data.marketLogs.find((l) => l.id === id);
    if (!log) return;

    setEditingId(id);
    setEditDate(log.date.split("T")[0]);
    const loadedPrices = {};
    Object.keys(log.prices).forEach((key) => {
      loadedPrices[key] = log.prices[key];
    });
    setEditPrices(loadedPrices);
    setEditItems(Object.keys(loadedPrices));
    setEditModalOpen(true);
    setViewingLog(null);
  };

  const handleSaveEdit = async () => {
    const hasValidData = editItems.some(
      (item) => parseFloat(editPrices[item]) > 0,
    );
    if (!hasValidData) {
      alert("Please ensure at least one item has a valid price.");
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const pricesObj = {};
    editItems.forEach((it) => {
      const v = parseFloat(editPrices[it]);
      pricesObj[it] = isNaN(v) ? 0 : v;
    });

    updateUserData((d) => ({
      ...d,
      marketLogs: d.marketLogs.map((log) =>
        log.id === editingId
          ? {
              ...log,
              date: new Date(editDate).toISOString(),
              prices: pricesObj,
            }
          : log,
      ),
    }));

    setIsSaving(false);
    setEditModalOpen(false);
    setEditingId(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDeleteFromModal = () => {
    if (!window.confirm("Delete this expense log?")) return;
    updateUserData((d) => ({
      ...d,
      marketLogs: d.marketLogs.filter((l) => l.id !== editingId),
    }));
    setEditModalOpen(false);
    setEditingId(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleEditPriceChange = (item, val) => {
    setEditPrices((p) => ({ ...p, [item]: val }));
  };

  const handleEditAddItem = (name) => {
    if (editItems.includes(name)) return;
    setEditItems([...editItems, name]);
    setEditPrices((p) => ({ ...p, [name]: "" }));
  };

  const handleEditRemoveItem = (name) => {
    setEditItems(editItems.filter((i) => i !== name));
    setEditPrices((p) => {
      const copy = { ...p };
      delete copy[name];
      return copy;
    });
  };

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

  const handleLog = async () => {
    if (data.marketItems.length === 0) {
      alert("Please add at least one item before saving.");
      return;
    }

    const hasData = data.marketItems.some(
      (item) => parseFloat(prices[item]) > 0,
    );
    if (!hasData) {
      alert("Please enter at least one price before saving.");
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const pricesObj = {};
    data.marketItems.forEach((it) => {
      const v = parseFloat(prices[it]);
      pricesObj[it] = isNaN(v) ? 0 : v;
    });

    const newLog = {
      id: Date.now(),
      date: new Date(logDate).toISOString(),
      prices: pricesObj,
    };

    updateUserData((d) => ({
      ...d,
      marketLogs: [...d.marketLogs, newLog],
      marketItems: [],
    }));

    setIsSaving(false);
    justSavedRef.current = true;
    setSaved(true);
    setPrices({});
    setTimeout(() => {
      justSavedRef.current = false;
      setSaved(false);
    }, 2500);
  };

  const handleDeleteLog = (id) => {
    if (!window.confirm("Delete this expense log?")) return;
    updateUserData((d) => ({
      ...d,
      marketLogs: d.marketLogs.filter((l) => l.id !== id),
    }));
    setViewingLog(null);
  };

  const allLogs = data.marketLogs || [];
  const monthKeys = useMemo(
    () =>
      [...new Set(allLogs.map((l) => l.date.slice(0, 7)))].sort((a, b) =>
        b.localeCompare(a),
      ),
    [allLogs],
  );

  useEffect(() => {
    if (monthKeys.length > 0 && !selectedMonth) {
      const cur = new Date().toISOString().slice(0, 7);
      setSelectedMonth(monthKeys.includes(cur) ? cur : monthKeys[0]);
    }
  }, [monthKeys, selectedMonth]);

  const filteredLogs = useMemo(
    () =>
      selectedMonth
        ? allLogs.filter((l) => l.date.startsWith(selectedMonth))
        : [],
    [allLogs, selectedMonth],
  );

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

  const sortedLogs = [...filteredLogs].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto px-4 py-6 space-y-8"
    >
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-text dark:text-white flex items-center gap-2 break-words">
          <ShoppingCart className="w-6 h-6 text-primary dark:text-primary-400 flex-shrink-0" />{" "}
          <span className="break-words">Log Your Daily Spend</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 break-words">
          Quickly log what you bought and how much it cost. You can pick any
          date!
        </p>
      </div>

      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
      >
        <div className="mb-4 max-w-full">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block break-words">
            Select Date
          </label>
          <div className="relative w-full max-w-full sm:max-w-[200px]">
            <div className="flex items-center w-full px-4 py-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-colors cursor-pointer group">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full bg-transparent border-none text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer text-base font-medium placeholder-gray-400"
              />
            </div>
          </div>
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
          disabled={isSaving}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-primary-600 text-white dark:text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-md disabled:opacity-70"
        >
          {isSaving ? (
            <LoadingSpinner size={20} color="text-white" />
          ) : (
            <Save className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="break-words">
            {isSaving ? "Saving..." : "Save Entry"}
          </span>
        </button>
        {saved && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-green-600 dark:text-green-400 mt-2"
          >
            ✨ Expense saved successfully!
          </motion.p>
        )}
      </motion.div>

      <AdSlot width={300} height={250} />

      <div className="w-full overflow-x-auto">
        <MarketChart logs={filteredLogs} items={data.marketItems} />
      </div>

      {/* History Section */}
      <div>
        <h2 className="text-lg font-bold text-neutral-text dark:text-white flex items-center gap-2 mb-4 break-words">
          <Calendar className="w-5 h-5 text-primary dark:text-primary-400 flex-shrink-0" />{" "}
          <span className="break-words">Your History</span>
        </h2>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-6">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 break-words">
            Jump to a month
          </h3>
          <div className="flex flex-wrap gap-2">
            {monthKeys.length ? (
              monthKeys.map((month) => {
                const label = new Date(month + "-01").toLocaleDateString(
                  "en-NG",
                  { month: "long", year: "numeric" },
                );
                return (
                  <motion.button
                    key={month}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMonth(month)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors break-words ${
                      selectedMonth === month
                        ? "bg-primary text-white dark:bg-primary-600"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {label}
                  </motion.button>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 break-words">
                No logs found yet.
              </p>
            )}
          </div>
        </div>

        {selectedMonth && sortedLogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
          >
            {[
              {
                label: "Total Spent",
                value: naira(monthlyTotals.totalSpent),
                color: "green",
              },
              {
                label: "Items Logged",
                value: monthlyTotals.totalItems,
                color: "blue",
              },
              {
                label: "Days Logged",
                value: monthlyTotals.daysLogged,
                color: "purple",
              },
              {
                label: "Avg. Per Day",
                value: naira(
                  monthlyTotals.daysLogged
                    ? Math.round(
                        monthlyTotals.totalSpent / monthlyTotals.daysLogged,
                      )
                    : 0,
                ),
                color: "orange",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-${s.color}-50/80 dark:bg-${s.color}-900/20 border border-${s.color}-100 dark:border-${s.color}-800 rounded-xl p-3 text-center break-words`}
              >
                <p
                  className={`text-[10px] font-semibold text-${s.color}-700 dark:text-${s.color}-400 uppercase break-words`}
                >
                  {s.label}
                </p>
                <p
                  className={`text-lg font-extrabold text-${s.color}-600 dark:text-${s.color}-400 break-words`}
                >
                  {s.value}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          {sortedLogs.length ? (
            sortedLogs.map((log) => {
              const dailyTotal = Object.values(log.prices).reduce(
                (s, v) => s + (v || 0),
                0,
              );
              return (
                <motion.div
                  key={log.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-text dark:text-white break-words">
                      {formatDate(log.date)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 break-words">
                      {Object.keys(log.prices).length} items · Total:{" "}
                      {naira(dailyTotal)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewingLog(log)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors break-words"
                    >
                      <Eye className="w-3.5 h-3.5 flex-shrink-0" /> View
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOpenEditModal(log.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg transition-colors break-words"
                    >
                      <Pencil className="w-3.5 h-3.5 flex-shrink-0" /> Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteLog(log.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors break-words"
                    >
                      <Trash2 className="w-3.5 h-3.5 flex-shrink-0" /> Delete
                    </motion.button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 border border-dashed dark:border-gray-700">
              <p className="text-sm break-words">
                {selectedMonth
                  ? `📭 No entries found for ${new Date(
                      selectedMonth + "-01",
                    ).toLocaleDateString("en-NG", {
                      month: "long",
                      year: "numeric",
                    })}.`
                  : "Start logging your expenses above!"}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {viewingLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-neutral-text dark:text-white break-words">
                  Expense Details
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setViewingLog(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                </motion.button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 break-words">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Date
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 break-words">
                    {formatDate(viewingLog.date)}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-primary-50 dark:bg-primary-900/30 rounded-xl p-3 break-words">
                  <span className="text-sm text-primary-600 dark:text-primary-400">
                    Total Spent
                  </span>
                  <span className="font-bold text-primary dark:text-primary-400 text-lg break-words">
                    {naira(
                      Object.values(viewingLog.prices).reduce(
                        (a, b) => a + b,
                        0,
                      ),
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 break-words">
                    Purchase Breakdown
                  </p>
                  <div className="space-y-1.5">
                    {Object.entries(viewingLog.prices).map(([item, price]) => (
                      <div
                        key={item}
                        className="flex justify-between text-sm py-1 border-b border-gray-50 dark:border-gray-700/50 last:border-0 break-words"
                      >
                        <span className="text-gray-700 dark:text-gray-300 break-words">
                          {item}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white break-words">
                          {naira(price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setViewingLog(null)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors break-words"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                <h3 className="text-lg font-bold text-neutral-text dark:text-white break-words">
                  Edit Expense
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditModalOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                </motion.button>
              </div>

              <div className="p-5 overflow-y-auto flex-1">
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block break-words">
                    Date
                  </label>
                  <div className="relative w-full max-w-full">
                    <div className="flex items-center w-full px-4 py-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-colors cursor-pointer group">
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full bg-transparent border-none text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer text-base font-medium placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Editable Item List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 break-words">
                      Items
                    </h4>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const newItem = prompt("Enter new item name:");
                        if (newItem?.trim()) handleEditAddItem(newItem.trim());
                      }}
                      className="flex items-center gap-1 text-sm font-medium text-primary dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 px-2 py-1 rounded-lg transition-colors break-words"
                    >
                      <Plus className="w-3.5 h-3.5 flex-shrink-0" /> Add
                    </motion.button>
                  </div>

                  {editItems.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4 break-words">
                      No items. Add one above.
                    </p>
                  ) : (
                    editItems.map((item) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2.5"
                      >
                        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 break-words">
                          {item}
                        </span>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">
                            ₦
                          </span>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={editPrices[item] ?? ""}
                            onChange={(e) =>
                              handleEditPriceChange(item, e.target.value)
                            }
                            placeholder="0"
                            className="w-32 pl-7 pr-2 py-1.5 text-sm text-right border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditRemoveItem(item)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 flex-shrink-0" />
                        </motion.button>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white dark:text-white font-semibold rounded-lg hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors disabled:opacity-70 break-words"
                >
                  {isSaving ? (
                    <LoadingSpinner size={20} color="text-white" />
                  ) : (
                    <Check className="w-4 h-4 flex-shrink-0" />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteFromModal}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors break-words"
                >
                  <Trash2 className="w-4 h-4 flex-shrink-0" /> Delete
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors break-words"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
