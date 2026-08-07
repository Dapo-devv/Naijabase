import { useState, useMemo } from "react";
import {
  Wallet,
  Calendar,
  Plus,
  Trash2,
  Eye,
  Edit,
  X,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useNaijaBase } from "../context/NaijaBaseContext";
import { todayISO, formatDate, naira } from "../utils/constants";

const DEFAULT_CATEGORIES = [
  "Rent",
  "Transport",
  "Food & Groceries",
  "Utilities (Light/Water)",
  "Data & Internet",
  "Entertainment",
  "Health",
  "Other",
];

export default function SavingsPage() {
  const { currentUser, updateUserData } = useNaijaBase();
  const data = currentUser?.data;

  // --- Safe fallback for missing array ---
  const salaryLogs = Array.isArray(data?.salaryLogs) ? data.salaryLogs : [];

  // --- Form State ---
  const [monthYear, setMonthYear] = useState(todayISO().slice(0, 7));
  const [salaryAmount, setSalaryAmount] = useState("");
  const [savingsInvested, setSavingsInvested] = useState("");
  const [expenses, setExpenses] = useState([
    { id: Date.now(), category: "Rent", amount: 0 },
    { id: Date.now() + 1, category: "Transport", amount: 0 },
    { id: Date.now() + 2, category: "Food & Groceries", amount: 0 },
  ]);
  const [customCategory, setCustomCategory] = useState("");

  // --- Edit Modal State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editMonth, setEditMonth] = useState("");
  const [editSalary, setEditSalary] = useState("");
  const [editSavings, setEditSavings] = useState("");
  const [editExpenses, setEditExpenses] = useState([]);

  // --- View State ---
  const [viewingEntry, setViewingEntry] = useState(null);
  const [toast, setToast] = useState(null);

  // --- Helpers ---
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const calculateTotals = (expenseList) => {
    return expenseList.reduce(
      (sum, exp) => sum + (parseFloat(exp.amount) || 0),
      0,
    );
  };

  // --- 🛡️ Is the Salary Lock active? ---
  const hasValidSalary = parseFloat(salaryAmount) > 0;

  // --- Standard expense handlers ---
  const handleExpenseChange = (id, value) => {
    setExpenses((prev) =>
      prev.map((exp) =>
        exp.id === id ? { ...exp, amount: parseFloat(value) || 0 } : exp,
      ),
    );
  };

  const handleRemoveExpense = (id) => {
    if (expenses.length <= 1) return;
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const handleAddExpense = () => {
    const trimmed = customCategory.trim();
    if (!trimmed) return;
    setExpenses((prev) => [
      ...prev,
      { id: Date.now(), category: trimmed, amount: 0 },
    ]);
    setCustomCategory("");
  };

  const handleAddPresetExpense = (category) => {
    if (expenses.some((e) => e.category === category)) return;
    setExpenses((prev) => [...prev, { id: Date.now(), category, amount: 0 }]);
  };

  // --- Reset Form ---
  const resetForm = () => {
    setMonthYear(todayISO().slice(0, 7));
    setSalaryAmount("");
    setSavingsInvested("");
    setExpenses([
      { id: Date.now(), category: "Rent", amount: 0 },
      { id: Date.now() + 1, category: "Transport", amount: 0 },
      { id: Date.now() + 2, category: "Food & Groceries", amount: 0 },
    ]);
    setEditingId(null);
  };

  // --- Save Salary Record ---
  const handleSave = () => {
    const salary = parseFloat(salaryAmount);
    if (!salary || salary <= 0) {
      alert("Please enter your total salary for the month.");
      return;
    }

    const saved = parseFloat(savingsInvested) || 0;
    const totalExpenses = calculateTotals(expenses);

    const newLog = {
      id: Date.now(),
      month: monthYear,
      salary: salary,
      savingsInvested: saved,
      expenses: expenses,
      totalExpenses: totalExpenses,
      balanceLeft: salary - totalExpenses - saved,
      createdAt: new Date().toISOString(),
    };

    updateUserData((d) => {
      const existingLogs = Array.isArray(d.salaryLogs) ? d.salaryLogs : [];
      return { ...d, salaryLogs: [...existingLogs, newLog] };
    });

    showToast("✅ Salary logged successfully!");
    resetForm();
  };

  // --- Open Edit Modal ---
  const openEditModal = (id) => {
    const log = salaryLogs.find((l) => l.id === id);
    if (!log) return;

    setEditingId(id);
    setEditMonth(log.month);
    setEditSalary(log.salary);
    setEditSavings(log.savingsInvested || 0);
    setEditExpenses(log.expenses || []);
    setIsEditModalOpen(true);
    setViewingEntry(null);
  };

  // --- Save Edit from Modal ---
  const handleSaveEdit = () => {
    const salary = parseFloat(editSalary);
    if (!salary || salary <= 0) {
      alert("Salary must be greater than 0.");
      return;
    }

    const saved = parseFloat(editSavings) || 0;
    const totalExpenses = calculateTotals(editExpenses);
    const balanceLeft = salary - totalExpenses - saved;

    const updatedLog = {
      id: editingId,
      month: editMonth,
      salary: salary,
      savingsInvested: saved,
      expenses: editExpenses,
      totalExpenses: totalExpenses,
      balanceLeft: balanceLeft,
      createdAt: new Date().toISOString(),
    };

    updateUserData((d) => ({
      ...d,
      salaryLogs: (d.salaryLogs || []).map((log) =>
        log.id === editingId ? updatedLog : log,
      ),
    }));

    setIsEditModalOpen(false);
    setEditingId(null);
    showToast("✅ Salary record updated!");
  };

  // --- Delete from View Modal ---
  const handleDelete = (id) => {
    if (!window.confirm("Delete this salary record?")) return;
    updateUserData((d) => ({
      ...d,
      salaryLogs: (d.salaryLogs || []).filter((l) => l.id !== id),
    }));
    setViewingEntry(null);
    showToast("🗑️ Record deleted");
  };

  // --- Month Keys ---
  const monthKeys = useMemo(() => {
    const months = salaryLogs.map((log) => log.month);
    return [...new Set(months)].sort((a, b) => b.localeCompare(a));
  }, [salaryLogs]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl p-4 shadow-lg animate-fade-in flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            {toast}
          </span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-extrabold text-neutral-text dark:text-white flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary dark:text-primary-400" />{" "}
          Salary & Spending Tracker
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Log your monthly salary, track your expenses, and see exactly how much
          you have left.
        </p>
      </div>

      {/* --- INPUT FORM --- */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
              Month
            </label>
            <input
              type="month"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
              Total Salary (₦)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={salaryAmount}
              onChange={(e) => setSalaryAmount(e.target.value)}
              placeholder="e.g. 150000"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        {/* 🛡️ LOCKED SECTION: Only enabled if Salary > 0 */}
        <div
          className={`transition-opacity duration-300 ${!hasValidSalary ? "opacity-50 pointer-events-none" : ""}`}
        >
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
              Savings & Investments (₦)
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                value={savingsInvested}
                onChange={(e) => setSavingsInvested(e.target.value)}
                placeholder="How much did you save or invest this month?"
                className="w-full sm:w-1/2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
              {!hasValidSalary && (
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Monthly Expenses
              </h3>
              <button
                onClick={() =>
                  setExpenses([
                    ...expenses,
                    { id: Date.now(), category: "", amount: 0 },
                  ])
                }
                className="flex items-center gap-1 text-sm font-medium text-primary dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 px-3 py-1.5 rounded-lg transition-colors"
                disabled={!hasValidSalary}
              >
                <Plus className="w-4 h-4" /> Add Expense
              </button>
            </div>

            <div className="space-y-2 mb-3">
              {expenses.map((exp, index) => (
                <div
                  key={exp.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2.5"
                >
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                    {index < 3 ? (
                      <select
                        value={exp.category}
                        onChange={(e) =>
                          setExpenses((prev) =>
                            prev.map((e) =>
                              e.id === exp.id
                                ? { ...e, category: e.target.value }
                                : e,
                            ),
                          )
                        }
                        className="w-full sm:w-1/2 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      >
                        {DEFAULT_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={exp.category}
                        onChange={(e) =>
                          setExpenses((prev) =>
                            prev.map((e) =>
                              e.id === exp.id
                                ? { ...e, category: e.target.value }
                                : e,
                            ),
                          )
                        }
                        placeholder="Enter expense name..."
                        className="w-full sm:w-1/2 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      />
                    )}
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">
                        ₦
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={exp.amount || ""}
                        onChange={(e) =>
                          handleExpenseChange(exp.id, e.target.value)
                        }
                        placeholder="0"
                        className="w-full sm:w-32 pl-7 pr-2 py-1.5 text-sm text-right border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveExpense(exp.id)}
                    className="w-full sm:w-auto px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors flex items-center justify-center gap-1"
                    disabled={!hasValidSalary}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddExpense()}
                placeholder="Add custom expense category..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
              <button
                onClick={handleAddExpense}
                className="px-4 py-2 text-sm font-medium bg-primary text-white dark:text-white rounded-lg hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors flex items-center gap-1"
                disabled={!hasValidSalary}
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Quick Add Common Expenses
            </p>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CATEGORIES.filter(
                (cat) => !expenses.some((e) => e.category === cat),
              ).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleAddPresetExpense(cat)}
                  className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={!hasValidSalary}
                >
                  + {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!hasValidSalary}
          className={`mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all shadow-md ${
            hasValidSalary
              ? "bg-primary text-white dark:text-white hover:bg-primary-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Wallet className="w-5 h-5" /> Log Salary & Expenses
        </button>
      </div>

      {/* --- ARCHIVE & HISTORY SECTION --- */}
      <div>
        <h2 className="text-lg font-bold text-neutral-text dark:text-white flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary dark:text-primary-400" />{" "}
          Salary History
        </h2>

        {salaryLogs.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 border border-dashed dark:border-gray-700">
            <p className="text-sm">
              No salary records yet. Log your first month above!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {monthKeys.map((month) => {
              const monthLogs = salaryLogs
                .filter((l) => l.month === month)
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
              const latest = monthLogs[0];
              const totalExpenses = calculateTotals(latest.expenses || []);
              const balanceLeft =
                latest.salary - totalExpenses - (latest.savingsInvested || 0);

              return (
                <div
                  key={month}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-neutral-text dark:text-white">
                        {new Date(month + "-01").toLocaleDateString("en-NG", {
                          month: "long",
                          year: "numeric",
                        })}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Logged on {formatDate(latest.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingEntry(latest)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button
                        onClick={() => openEditModal(latest.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="bg-green-50/60 dark:bg-green-900/20 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-green-700 dark:text-green-400 uppercase font-semibold">
                        Salary
                      </p>
                      <p className="font-bold text-green-600 dark:text-green-400 text-sm">
                        {naira(latest.salary)}
                      </p>
                    </div>
                    <div className="bg-red-50/60 dark:bg-red-900/20 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-red-700 dark:text-red-400 uppercase font-semibold">
                        Spent
                      </p>
                      <p className="font-bold text-red-600 dark:text-red-400 text-sm">
                        {naira(totalExpenses)}
                      </p>
                    </div>
                    <div className="bg-yellow-50/60 dark:bg-yellow-900/20 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-yellow-700 dark:text-yellow-400 uppercase font-semibold">
                        Saved
                      </p>
                      <p className="font-bold text-yellow-600 dark:text-yellow-400 text-sm">
                        {naira(latest.savingsInvested || 0)}
                      </p>
                    </div>
                    <div
                      className={`${
                        balanceLeft >= 0
                          ? "bg-primary-50/60 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                          : "bg-red-50/60 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      } rounded-lg p-2 text-center`}
                    >
                      <p className="text-[10px] font-semibold uppercase">
                        Balance
                      </p>
                      <p className="font-bold text-sm">{naira(balanceLeft)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- VIEW MODAL --- */}
      {viewingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-neutral-text dark:text-white">
                Salary Breakdown
              </h3>
              <button
                onClick={() => setViewingEntry(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Month
                </p>
                <p className="font-bold text-neutral-text dark:text-white">
                  {new Date(viewingEntry.month + "-01").toLocaleDateString(
                    "en-NG",
                    { month: "long", year: "numeric" },
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Salary
                  </p>
                  <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                    {naira(viewingEntry.salary)}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Total Expenses
                  </p>
                  <p className="font-bold text-red-600 dark:text-red-400 text-lg">
                    {naira(viewingEntry.totalExpenses)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Savings & Investments
                  </p>
                  <p className="font-bold text-yellow-600 dark:text-yellow-400 text-lg">
                    {naira(viewingEntry.savingsInvested || 0)}
                  </p>
                </div>
                <div
                  className={`${
                    viewingEntry.balanceLeft >= 0
                      ? "bg-primary-50 dark:bg-primary-900/30"
                      : "bg-red-50 dark:bg-red-900/30"
                  } rounded-xl p-3 text-center`}
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Balance Left
                  </p>
                  <p
                    className={`font-bold text-lg ${
                      viewingEntry.balanceLeft >= 0
                        ? "text-primary dark:text-primary-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {naira(viewingEntry.balanceLeft)}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Expense Breakdown
                </p>
                <div className="space-y-1.5">
                  {viewingEntry.expenses && viewingEntry.expenses.length > 0 ? (
                    viewingEntry.expenses.map((exp, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm py-1 border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                      >
                        <span className="text-gray-700 dark:text-gray-300">
                          {exp.category}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {naira(exp.amount)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">
                      No expenses recorded.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-center">
              <button
                onClick={() => setViewingEntry(null)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ✏️ EDIT MODAL (SCROLLABLE FIX) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
            {/* Sticky Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <h3 className="text-lg font-bold text-neutral-text dark:text-white">
                Edit Salary Record
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* 🛡️ SCROLLABLE CONTENT AREA */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  Month
                </label>
                <input
                  type="month"
                  value={editMonth}
                  onChange={(e) => setEditMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  Total Salary (₦)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={editSalary}
                  onChange={(e) => setEditSalary(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  Savings & Investments (₦)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={editSavings}
                  onChange={(e) => setEditSavings(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Expenses
                  </h4>
                  <button
                    onClick={() =>
                      setEditExpenses([
                        ...editExpenses,
                        { id: Date.now(), category: "", amount: 0 },
                      ])
                    }
                    className="flex items-center gap-1 text-sm font-medium text-primary dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 px-2 py-1 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {editExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2"
                    >
                      <input
                        type="text"
                        value={exp.category}
                        onChange={(e) =>
                          setEditExpenses((prev) =>
                            prev.map((e) =>
                              e.id === exp.id
                                ? { ...e, category: e.target.value }
                                : e,
                            ),
                          )
                        }
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          ₦
                        </span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={exp.amount || ""}
                          onChange={(e) =>
                            setEditExpenses((prev) =>
                              prev.map((e) =>
                                e.id === exp.id
                                  ? {
                                      ...e,
                                      amount: parseFloat(e.target.value) || 0,
                                    }
                                  : e,
                              ),
                            )
                          }
                          className="w-32 pl-7 pr-2 py-1.5 text-sm text-right border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        />
                      </div>
                      <button
                        onClick={() =>
                          setEditExpenses((prev) =>
                            prev.filter((e) => e.id !== exp.id),
                          )
                        }
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <button
                onClick={handleSaveEdit}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white dark:text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Changes
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
