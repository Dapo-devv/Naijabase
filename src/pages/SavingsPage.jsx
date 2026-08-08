import { useState, useMemo } from "react";
import {
  Wallet,
  Calendar,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  Briefcase,
  Banknote,
  TrendingUp,
  TrendingDown,
  Edit2,
} from "lucide-react";
import { useNaijaBase } from "../context/NaijaBaseContext";
import { todayISO, formatDate, naira } from "../utils/constants";

// Predefined expense categories for a professional look
const EXPENSE_CATEGORIES = [
  "Rent",
  "Transport",
  "Food & Groceries",
  "Utilities (Light/Water)",
  "Data & Internet",
  "Entertainment",
  "Health",
  "Insurance",
  "Education",
  "Other",
];

export default function SavingsPage() {
  const { currentUser, updateUserData } = useNaijaBase();
  const data = currentUser?.data;

  // --- Safe fallback for missing array ---
  const salaryLogs = Array.isArray(data?.salaryLogs) ? data.salaryLogs : [];

  // --- State ---
  const [activeTab, setActiveTab] = useState("income");
  const [viewingEntry, setViewingEntry] = useState(null);
  const [toast, setToast] = useState(null);

  // --- Shared Month State ---
  const [monthYear, setMonthYear] = useState(todayISO().slice(0, 7));

  // --- PERSONAL INCOME STATE (Advanced Ledger) ---
  const [incomeAmount, setIncomeAmount] = useState("");
  const [savingsInvested, setSavingsInvested] = useState("");
  const [incomeExpenses, setIncomeExpenses] = useState(
    EXPENSE_CATEGORIES.map((cat) => ({ category: cat, amount: 0 })),
  );

  // --- SALARY (JOB) STATE (Advanced Payroll) ---
  const [grossSalary, setGrossSalary] = useState("");
  const [payeDeduction, setPayeDeduction] = useState("");
  const [pensionDeduction, setPensionDeduction] = useState("");
  const [otherDeductions, setOtherDeductions] = useState("");
  const [bonuses, setBonuses] = useState("");
  const [salaryExpenses, setSalaryExpenses] = useState(
    EXPENSE_CATEGORIES.map((cat) => ({ category: cat, amount: 0 })),
  );

  // --- Helpers ---
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const calculateTotalExpenses = (expenseArray) => {
    return expenseArray.reduce(
      (sum, exp) => sum + (parseFloat(exp.amount) || 0),
      0,
    );
  };

  // --- Update a specific category amount ---
  const handleExpenseChange = (setList, index, value) => {
    setList((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, amount: parseFloat(value) || 0 } : item,
      ),
    );
  };

  // --- Reset Form ---
  const resetForm = () => {
    setMonthYear(todayISO().slice(0, 7));
    setIncomeAmount("");
    setSavingsInvested("");
    setIncomeExpenses(
      EXPENSE_CATEGORIES.map((cat) => ({ category: cat, amount: 0 })),
    );
    setGrossSalary("");
    setPayeDeduction("");
    setPensionDeduction("");
    setOtherDeductions("");
    setBonuses("");
    setSalaryExpenses(
      EXPENSE_CATEGORIES.map((cat) => ({ category: cat, amount: 0 })),
    );
    showToast("🔄 Form cleared for new entry");
  };

  // --- SAVE PERSONAL INCOME ---
  const handleSaveIncome = () => {
    const income = parseFloat(incomeAmount);
    if (!income || income <= 0) {
      alert("Please enter your total income for the month.");
      return;
    }

    const saved = parseFloat(savingsInvested) || 0;
    const totalExpenses = calculateTotalExpenses(incomeExpenses);

    const newLog = {
      id: Date.now(),
      month: monthYear,
      type: "income",
      income: income,
      savingsInvested: saved,
      expenses: incomeExpenses.filter((e) => e.amount > 0), // Only save non-zero expenses
      totalExpenses: totalExpenses,
      balanceLeft: income - totalExpenses - saved,
      createdAt: new Date().toISOString(),
    };

    updateUserData((d) => {
      const existingLogs = Array.isArray(d.salaryLogs) ? d.salaryLogs : [];
      return { ...d, salaryLogs: [...existingLogs, newLog] };
    });

    showToast("✅ Income logged successfully!");
    resetForm();
  };

  // --- SAVE SALARY (JOB) ---
  const handleSaveSalary = () => {
    const gross = parseFloat(grossSalary);
    if (!gross || gross <= 0) {
      alert("Please enter your gross salary.");
      return;
    }

    const paye = parseFloat(payeDeduction) || 0;
    const pension = parseFloat(pensionDeduction) || 0;
    const other = parseFloat(otherDeductions) || 0;
    const bonus = parseFloat(bonuses) || 0;
    const totalExpenses = calculateTotalExpenses(salaryExpenses);

    const netSalary = gross - paye - pension - other + bonus;
    const balanceLeft = netSalary - totalExpenses;

    const newLog = {
      id: Date.now(),
      month: monthYear,
      type: "salary",
      grossSalary: gross,
      payeDeduction: paye,
      pensionDeduction: pension,
      otherDeductions: other,
      bonuses: bonus,
      netSalary: netSalary,
      expenses: salaryExpenses.filter((e) => e.amount > 0),
      totalExpenses: totalExpenses,
      balanceLeft: balanceLeft,
      createdAt: new Date().toISOString(),
    };

    updateUserData((d) => {
      const existingLogs = Array.isArray(d.salaryLogs) ? d.salaryLogs : [];
      return { ...d, salaryLogs: [...existingLogs, newLog] };
    });

    showToast("✅ Salary logged successfully!");
    resetForm();
  };

  // --- Delete Record ---
  const handleDelete = (id) => {
    if (!window.confirm("Delete this record?")) return;
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

  // --- Calculate preview stats for the current form ---
  const previewIncome = parseFloat(incomeAmount) || 0;
  const previewIncomeExpenses = calculateTotalExpenses(incomeExpenses);
  const previewIncomeBalance =
    previewIncome - previewIncomeExpenses - (parseFloat(savingsInvested) || 0);

  const previewGross = parseFloat(grossSalary) || 0;
  const previewDeductions =
    (parseFloat(payeDeduction) || 0) +
    (parseFloat(pensionDeduction) || 0) +
    (parseFloat(otherDeductions) || 0);
  const previewNet =
    previewGross - previewDeductions + (parseFloat(bonuses) || 0);
  const previewSalaryExpenses = calculateTotalExpenses(salaryExpenses);
  const previewSalaryBalance = previewNet - previewSalaryExpenses;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in space-y-6">
      {/* Toast Notification */}
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
          Monthly Ledger
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Professional income & salary tracking with real-time balance
          calculation.
        </p>
      </div>

      {/* --- TABS --- */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab("income")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "income"
              ? "bg-white dark:bg-gray-700 shadow text-primary dark:text-primary-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          <Banknote className="w-4 h-4" /> Personal Income
        </button>
        <button
          onClick={() => setActiveTab("salary")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "salary"
              ? "bg-white dark:bg-gray-700 shadow text-primary dark:text-primary-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          <Briefcase className="w-4 h-4" /> Salary (Job)
        </button>
      </div>

      {/* --- INPUT FORM --- */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300">
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
            Month
          </label>
          <div className="relative w-full max-w-full sm:max-w-[200px]">
            <div className="flex items-center w-full px-4 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600/50 transition-colors cursor-pointer group">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="month"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                className="w-full bg-transparent border-none text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer text-base font-medium placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* ================= PERSONAL INCOME TAB ================= */}
        {activeTab === "income" && (
          <div className="space-y-6">
            {/* Real-time Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="text-center">
                <p className="text-[10px] text-green-600 dark:text-green-400 uppercase font-bold">
                  Income
                </p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {naira(previewIncome)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-red-500 dark:text-red-400 uppercase font-bold">
                  Expenses
                </p>
                <p className="text-xl font-bold text-red-500 dark:text-red-400">
                  {naira(previewIncomeExpenses)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">
                  Balance
                </p>
                <p
                  className={`text-xl font-bold ${previewIncomeBalance >= 0 ? "text-primary dark:text-primary-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {naira(previewIncomeBalance)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  Total Monthly Income (₦)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  placeholder="e.g. 150000"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  Savings & Investments (₦)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={savingsInvested}
                  onChange={(e) => setSavingsInvested(e.target.value)}
                  placeholder="How much did you save or invest?"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Professional Expense Grid */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                Expenses Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {incomeExpenses.map((exp, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-600"
                  >
                    <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {exp.category}
                    </span>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs">
                        ₦
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={exp.amount || ""}
                        onChange={(e) =>
                          handleExpenseChange(
                            setIncomeExpenses,
                            index,
                            e.target.value,
                          )
                        }
                        placeholder="0"
                        className="w-24 pl-5 pr-2 py-1 text-sm text-right bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-primary/30 text-gray-800 dark:text-gray-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveIncome}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-primary text-white dark:text-white font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors shadow-md"
            >
              <CheckCircle2 className="w-5 h-5" /> Log Income & Expenses
            </button>
          </div>
        )}

        {/* ================= SALARY (JOB) TAB ================= */}
        {activeTab === "salary" && (
          <div className="space-y-6">
            {/* Real-time Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="text-center">
                <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold">
                  Gross
                </p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {naira(previewGross)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-red-500 dark:text-red-400 uppercase font-bold">
                  Deductions
                </p>
                <p className="text-xl font-bold text-red-500 dark:text-red-400">
                  {naira(previewDeductions)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-green-600 dark:text-green-400 uppercase font-bold">
                  Net Pay
                </p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {naira(previewNet)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">
                  Balance
                </p>
                <p
                  className={`text-xl font-bold ${previewSalaryBalance >= 0 ? "text-primary dark:text-primary-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {naira(previewSalaryBalance)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  Gross Salary (₦)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(e.target.value)}
                  placeholder="e.g. 200000"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  Bonuses & Allowances (₦)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={bonuses}
                  onChange={(e) => setBonuses(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  PAYE / Tax (₦)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={payeDeduction}
                  onChange={(e) => setPayeDeduction(e.target.value)}
                  placeholder="Tax deducted"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  Pension (₦)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={pensionDeduction}
                  onChange={(e) => setPensionDeduction(e.target.value)}
                  placeholder="Pension contribution"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  Other Deductions (₦)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(e.target.value)}
                  placeholder="Union dues, loans, etc."
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Professional Expense Grid */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                Expenses Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {salaryExpenses.map((exp, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-600"
                  >
                    <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {exp.category}
                    </span>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs">
                        ₦
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={exp.amount || ""}
                        onChange={(e) =>
                          handleExpenseChange(
                            setSalaryExpenses,
                            index,
                            e.target.value,
                          )
                        }
                        placeholder="0"
                        className="w-24 pl-5 pr-2 py-1 text-sm text-right bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-primary/30 text-gray-800 dark:text-gray-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveSalary}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-primary text-white dark:text-white font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors shadow-md"
            >
              <CheckCircle2 className="w-5 h-5" /> Log Salary & Expenses
            </button>
          </div>
        )}
      </div>

      {/* --- ARCHIVE & HISTORY SECTION --- */}
      <div>
        <h2 className="text-lg font-bold text-neutral-text dark:text-white flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary dark:text-primary-400" />{" "}
          History
        </h2>

        {salaryLogs.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 border border-dashed dark:border-gray-700">
            <p className="text-sm">
              No records yet. Log your first month above!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {monthKeys.map((month) => {
              const monthLogs = salaryLogs
                .filter((l) => l.month === month)
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
              const latest = monthLogs[0];

              const isIncome = latest.type === "income";
              const displayIncome = isIncome
                ? latest.income
                : latest.netSalary || latest.grossSalary;
              const displayExpenses = latest.totalExpenses || 0;
              const displayBalance = latest.balanceLeft || 0;

              return (
                <div
                  key={month}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-neutral-text dark:text-white">
                          {new Date(month + "-01").toLocaleDateString("en-NG", {
                            month: "long",
                            year: "numeric",
                          })}
                        </h3>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${isIncome ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"}`}
                        >
                          {isIncome ? "Income" : "Salary"}
                        </span>
                      </div>
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
                        onClick={() => handleDelete(latest.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="bg-green-50/60 dark:bg-green-900/20 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-green-700 dark:text-green-400 uppercase font-semibold">
                        {isIncome ? "Income" : "Net Pay"}
                      </p>
                      <p className="font-bold text-green-600 dark:text-green-400 text-sm">
                        {naira(displayIncome)}
                      </p>
                    </div>
                    <div className="bg-red-50/60 dark:bg-red-900/20 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-red-700 dark:text-red-400 uppercase font-semibold">
                        Spent
                      </p>
                      <p className="font-bold text-red-600 dark:text-red-400 text-sm">
                        {naira(displayExpenses)}
                      </p>
                    </div>
                    <div className="bg-yellow-50/60 dark:bg-yellow-900/20 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-yellow-700 dark:text-yellow-400 uppercase font-semibold">
                        Saved
                      </p>
                      <p className="font-bold text-yellow-600 dark:text-yellow-400 text-sm">
                        {naira(displayIncome - displayExpenses)}
                      </p>
                    </div>
                    <div
                      className={`${
                        displayBalance >= 0
                          ? "bg-primary-50/60 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                          : "bg-red-50/60 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      } rounded-lg p-2 text-center`}
                    >
                      <p className="text-[10px] font-semibold uppercase">
                        Balance
                      </p>
                      <p className="font-bold text-sm">
                        {naira(displayBalance)}
                      </p>
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
                {viewingEntry.type === "income"
                  ? "Income Breakdown"
                  : "Salary Breakdown"}
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
                  {viewingEntry.type === "income" ? "Income" : "Salary"} · Month
                </p>
                <p className="font-bold text-neutral-text dark:text-white">
                  {new Date(viewingEntry.month + "-01").toLocaleDateString(
                    "en-NG",
                    { month: "long", year: "numeric" },
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {viewingEntry.type === "salary" ? (
                  <>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Gross Salary
                      </p>
                      <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                        {naira(viewingEntry.grossSalary)}
                      </p>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Bonuses
                      </p>
                      <p className="font-bold text-cyan-600 dark:text-cyan-400 text-lg">
                        {naira(viewingEntry.bonuses || 0)}
                      </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        PAYE / Tax
                      </p>
                      <p className="font-bold text-red-600 dark:text-red-400 text-lg">
                        {naira(viewingEntry.payeDeduction || 0)}
                      </p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Pension
                      </p>
                      <p className="font-bold text-orange-600 dark:text-orange-400 text-lg">
                        {naira(viewingEntry.pensionDeduction || 0)}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Total Income
                      </p>
                      <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                        {naira(viewingEntry.income)}
                      </p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Savings
                      </p>
                      <p className="font-bold text-yellow-600 dark:text-yellow-400 text-lg">
                        {naira(viewingEntry.savingsInvested || 0)}
                      </p>
                    </div>
                  </>
                )}

                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Total Expenses
                  </p>
                  <p className="font-bold text-red-600 dark:text-red-400 text-lg">
                    {naira(viewingEntry.totalExpenses)}
                  </p>
                </div>
                <div
                  className={`${
                    viewingEntry.balanceLeft >= 0
                      ? "bg-primary-50 dark:bg-primary-900/30"
                      : "bg-red-50 dark:bg-red-900/30"
                  } rounded-xl p-3 text-center col-span-2 sm:col-span-1`}
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
    </div>
  );
}
