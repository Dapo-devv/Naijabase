import { useState, useEffect, useMemo } from "react";
import {
  Wallet,
  Calendar,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  Target,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNaijaBase } from "../context/NaijaBaseContext";
import { todayISO, formatDate, naira } from "../utils/constants";

export default function SavingsPage() {
  const { currentUser, updateUserData } = useNaijaBase();
  const data = currentUser?.data;

  // 🚀 Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const spendingPlans = Array.isArray(data?.generator?.spendingPlans)
    ? data.generator.spendingPlans
    : [];

  const [viewingPlan, setViewingPlan] = useState(null);
  const [toast, setToast] = useState(null);

  const [planIncome, setPlanIncome] = useState("");
  const [planItems, setPlanItems] = useState([
    { id: 1, name: "Rent", amount: 0 },
    { id: 2, name: "Groceries", amount: 0 },
    { id: 3, name: "Travel", amount: 0 },
    { id: 4, name: "Dining Out", amount: 0 },
    { id: 5, name: "Clothing", amount: 0 },
    { id: 6, name: "Subscriptions", amount: 0 },
    { id: 7, name: "Miscellaneous", amount: 0 },
  ]);
  const [planCustomName, setPlanCustomName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handlePlanAmountChange = (id, value) => {
    setPlanItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, amount: parseFloat(value) || 0 } : item,
      ),
    );
  };

  const handleRemovePlanItem = (id) => {
    if (planItems.length <= 1) return;
    setPlanItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddCustomPlanItem = () => {
    const trimmed = planCustomName.trim();
    if (!trimmed) return;
    setPlanItems((prev) => [
      ...prev,
      { id: Date.now(), name: trimmed, amount: 0 },
    ]);
    setPlanCustomName("");
  };

  const resetPlanForm = () => {
    setPlanIncome("");
    setPlanItems([
      { id: 1, name: "Rent", amount: 0 },
      { id: 2, name: "Groceries", amount: 0 },
      { id: 3, name: "Travel", amount: 0 },
      { id: 4, name: "Dining Out", amount: 0 },
      { id: 5, name: "Clothing", amount: 0 },
      { id: 6, name: "Subscriptions", amount: 0 },
      { id: 7, name: "Miscellaneous", amount: 0 },
    ]);
    setPlanCustomName("");
  };

  const handleSavePlan = async () => {
    const totalIncome = parseFloat(planIncome);
    if (!totalIncome || totalIncome <= 0) {
      alert("Please enter a valid total income for this plan.");
      return;
    }
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newPlan = {
      id: Date.now(),
      date: todayISO(),
      totalIncome: totalIncome,
      items: planItems.filter((i) => i.amount > 0),
      totalAllocated: planItems.reduce((sum, i) => sum + (i.amount || 0), 0),
    };

    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        spendingPlans: [...(d.generator.spendingPlans || []), newPlan],
      },
    }));

    setIsSaving(false);
    resetPlanForm();
    showToast("✅ Spending plan saved!");
  };

  const handleDeletePlan = (id) => {
    if (!window.confirm("Delete this spending plan?")) return;
    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        spendingPlans: (d.generator.spendingPlans || []).filter(
          (p) => p.id !== id,
        ),
      },
    }));
    setViewingPlan(null);
    showToast("🗑️ Plan deleted");
  };

  const totalIncome = parseFloat(planIncome) || 0;
  const totalAllocated = planItems.reduce((sum, i) => sum + (i.amount || 0), 0);
  const remaining = totalIncome - totalAllocated;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto px-4 py-6 space-y-6"
    >
      {toast && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl p-4 shadow-lg flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            {toast}
          </span>
        </motion.div>
      )}

      <div>
        <h1 className="text-2xl font-extrabold text-neutral-text dark:text-white flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary dark:text-primary-400" />{" "}
          Spending Plan
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Plan your income and allocate every Naira to expenses, savings, and
          goals.
        </p>
      </div>

      {/* --- Plan Form --- */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Create a Spending Plan
          </h2>
        </div>

        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
            Total Income for this Plan (₦)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={planIncome}
            onChange={(e) => setPlanIncome(e.target.value)}
            placeholder="e.g. 100000"
            className="w-full max-w-xs px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            Planned Expenses
          </h3>
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
            }}
          >
            {planItems.map((item) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-2.5"
              >
                <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.name}
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">
                    ₦
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={item.amount || ""}
                    onChange={(e) =>
                      handlePlanAmountChange(item.id, e.target.value)
                    }
                    placeholder="0"
                    className="w-32 pl-7 pr-2 py-2 text-sm text-right border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemovePlanItem(item.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex gap-2 mt-4">
            <input
              type="text"
              value={planCustomName}
              onChange={(e) => setPlanCustomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCustomPlanItem()}
              placeholder="Add custom expense..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddCustomPlanItem}
              className="px-4 py-2 text-sm font-medium bg-primary text-white dark:text-white rounded-lg hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 gap-4">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Total Income
              </p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {naira(totalIncome)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Allocated
              </p>
              <p className="text-lg font-bold text-red-500 dark:text-red-400">
                {naira(totalAllocated)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Remaining
              </p>
              <p
                className={`text-lg font-bold ${
                  remaining >= 0
                    ? "text-primary dark:text-primary-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {naira(remaining)}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSavePlan}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-primary text-white dark:text-white font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors disabled:opacity-70"
          >
            {isSaving ? (
              <LoadingSpinner size={20} color="text-white" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {isSaving ? "Saving..." : "Save Plan"}
          </motion.button>
        </div>
      </motion.div>

      {/* --- History --- */}
      <div>
        <h2 className="text-lg font-bold text-neutral-text dark:text-white flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary dark:text-primary-400" />{" "}
          Your Spending Plans
        </h2>

        {spendingPlans.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 border border-dashed dark:border-gray-700">
            <p className="text-sm">
              No plans yet. Create your first plan above!
            </p>
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
          >
            {spendingPlans
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((plan) => (
                <motion.div
                  key={plan.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-neutral-text dark:text-white">
                        Plan from {formatDate(plan.date)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Income: {naira(plan.totalIncome)} · Allocated:{" "}
                        {naira(plan.totalAllocated)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewingPlan(plan)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeletePlan(plan.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </motion.button>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Allocation Breakdown
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {plan.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2 text-center"
                        >
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm font-bold text-primary dark:text-primary-400">
                            {naira(item.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {viewingPlan && (
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
                <h3 className="text-lg font-bold text-neutral-text dark:text-white">
                  Spending Plan Details
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setViewingPlan(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </motion.button>
              </div>
              <div className="p-5 space-y-3">
                <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Plan Date
                  </p>
                  <p className="font-bold text-neutral-text dark:text-white">
                    {formatDate(viewingPlan.date)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Income
                    </p>
                    <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                      {naira(viewingPlan.totalIncome)}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Allocated
                    </p>
                    <p className="font-bold text-red-600 dark:text-red-400 text-lg">
                      {naira(viewingPlan.totalAllocated)}
                    </p>
                  </div>
                  <div
                    className={`${
                      viewingPlan.totalIncome - viewingPlan.totalAllocated >= 0
                        ? "bg-primary-50 dark:bg-primary-900/30"
                        : "bg-red-50 dark:bg-red-900/30"
                    } rounded-xl p-3 text-center`}
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Remaining
                    </p>
                    <p
                      className={`font-bold text-lg ${
                        viewingPlan.totalIncome - viewingPlan.totalAllocated >=
                        0
                          ? "text-primary dark:text-primary-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {naira(
                        viewingPlan.totalIncome - viewingPlan.totalAllocated,
                      )}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Expense Breakdown
                  </p>
                  <div className="space-y-1.5">
                    {viewingPlan.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm py-1 border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                      >
                        <span className="text-gray-700 dark:text-gray-300">
                          {item.name}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {naira(item.amount)}
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
                  onClick={() => setViewingPlan(null)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
