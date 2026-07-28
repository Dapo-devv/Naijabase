import { useState, useEffect, useMemo } from "react";
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Eye,
  Trash2,
  Plus,
  X,
  Pencil,
  PiggyBank,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import AdSlot from "../components/AdSlot";
import { useNaijaBase } from "../context/NaijaBaseContext";
import { todayISO, formatDate, naira } from "../utils/constants";

export default function FinanceHubPage() {
  const { currentUser, updateUserData } = useNaijaBase();
  const g = currentUser?.data?.generator;
  if (!g) return null;

  const [viewingEntry, setViewingEntry] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // --- Month Archive State ---
  const [selectedMonth, setSelectedMonth] = useState(null);

  // --- Expanded All-Time Revenue State ---
  const [showAllTimeBreakdown, setShowAllTimeBreakdown] = useState(false);

  // --- Company Name State ---
  const [companyName, setCompanyName] = useState(g?.companyName || "");
  const [isCompanyEditing, setIsCompanyEditing] = useState(!g?.companyName);

  // --- Sales Form States ---
  const [saleDate, setSaleDate] = useState(todayISO());
  const [saleCustomer, setSaleCustomer] = useState("");
  const [saleProduct, setSaleProduct] = useState("");
  const [saleContact, setSaleContact] = useState("");
  const [saleAmount, setSaleAmount] = useState("");

  // --- Expense Form States ---
  const [expenseDate, setExpenseDate] = useState(todayISO());
  const [expenseCategory, setExpenseCategory] = useState("Supplies");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  // --- Staff Salary States ---
  const [staffDate, setStaffDate] = useState(todayISO());
  const [staffName, setStaffName] = useState("");
  const [staffAmount, setStaffAmount] = useState("");

  // --- Savings / Investment States ---
  const [savingsDate, setSavingsDate] = useState(todayISO());
  const [savingsType, setSavingsType] = useState("Savings");
  const [savingsTitle, setSavingsTitle] = useState("");
  const [savingsAmount, setSavingsAmount] = useState("");

  // --- Edit Modal States ---
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // --- Toast State ---
  const [toast, setToast] = useState(null);

  // --- Force re-render key ---
  const [renderKey, setRenderKey] = useState(0);

  // --- Get business data safely ---
  const businessEntries = g.businessEntries || [];

  // --- ALL-TIME REVENUE ---
  const allTimeRevenue = businessEntries
    .filter((e) => e.type === "sale")
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  // --- CURRENT MONTH FINANCIALS ---
  const currentMonth = todayISO().slice(0, 7);

  const monthlyRevenue = businessEntries
    .filter((e) => e.type === "sale" && e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  const monthlyExpenses = businessEntries
    .filter((e) => e.type === "expense" && e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  const monthlyStaffCost = businessEntries
    .filter((e) => e.type === "staff" && e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  const monthlySavings = businessEntries
    .filter((e) => e.type === "savings" && e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  const monthlyProfit = monthlyRevenue - monthlyExpenses - monthlyStaffCost;

  // --- Unique Months ---
  const monthKeys = useMemo(() => {
    const months = businessEntries.map((e) => e.date.slice(0, 7));
    return [...new Set(months)].sort((a, b) => b.localeCompare(a));
  }, [businessEntries]);

  // --- Filtered Month Entries (Newest first) ---
  const filteredMonthEntries = useMemo(() => {
    if (!selectedMonth) return [];
    return businessEntries
      .filter((e) => e.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [businessEntries, selectedMonth]);

  // --- Monthly Totals Breakdown ---
  const selectedMonthTotals = useMemo(() => {
    if (!selectedMonth) return {};
    const entries = businessEntries.filter((e) =>
      e.date.startsWith(selectedMonth),
    );

    const sales = entries
      .filter((e) => e.type === "sale")
      .reduce((sum, e) => sum + e.amount, 0);
    const staff = entries
      .filter((e) => e.type === "staff")
      .reduce((sum, e) => sum + e.amount, 0);
    const savings = entries
      .filter((e) => e.type === "savings")
      .reduce((sum, e) => sum + e.amount, 0);

    const transport = entries
      .filter((e) => e.type === "expense" && e.category === "Transport")
      .reduce((sum, e) => sum + e.amount, 0);
    const utilities = entries
      .filter((e) => e.type === "expense" && e.category === "Utilities")
      .reduce((sum, e) => sum + e.amount, 0);
    const marketing = entries
      .filter((e) => e.type === "expense" && e.category === "Marketing")
      .reduce((sum, e) => sum + e.amount, 0);
    const rent = entries
      .filter((e) => e.type === "expense" && e.category === "Rent")
      .reduce((sum, e) => sum + e.amount, 0);
    const other = entries
      .filter((e) => e.type === "expense" && e.category === "Other")
      .reduce((sum, e) => sum + e.amount, 0);
    const supplies = entries
      .filter((e) => e.type === "expense" && e.category === "Supplies")
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      sales,
      staff,
      savings,
      transport,
      utilities,
      marketing,
      rent,
      other,
      supplies,
    };
  }, [businessEntries, selectedMonth]);

  // --- Monthly Revenue Breakdown for All-Time Revenue Card ---
  const monthlyRevenueBreakdown = useMemo(() => {
    const months = {};
    businessEntries
      .filter((e) => e.type === "sale")
      .forEach((e) => {
        const month = e.date.slice(0, 7);
        months[month] = (months[month] || 0) + e.amount;
      });
    return Object.entries(months).sort((a, b) => b[0].localeCompare(a[0]));
  }, [businessEntries]);

  // --- 🚀 BULLETPROOF SORT: Recent Entries (Newest at TOP) ---
  const recentEntries = useMemo(() => {
    return [...businessEntries]
      .sort((a, b) => {
        // 1. Primary sort: Parse ISO strings to timestamps before subtracting (CRITICAL FIX)
        const timeA = new Date(a.createdAt || a.id).getTime();
        const timeB = new Date(b.createdAt || b.id).getTime();
        const timeDiff = timeB - timeA;

        if (timeDiff !== 0) return timeDiff;

        // 2. Secondary sort: date string (newest first)
        return b.date.localeCompare(a.date);
      })
      .slice(0, 8);
  }, [businessEntries, renderKey]);

  // --- Toast Helper ---
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  // --- Handle Company Name ---
  const handleSaveCompany = () => {
    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        companyName: companyName.trim(),
      },
    }));
    setIsCompanyEditing(false);
    showToast("Company name saved!");
  };

  // --- Handle Sales ---
  const handleAddSale = () => {
    if (
      !saleCustomer.trim() ||
      !saleProduct.trim() ||
      !saleAmount ||
      parseFloat(saleAmount) <= 0
    ) {
      alert("Please fill in Customer, Product/Service, and Amount.");
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: saleDate,
      type: "sale",
      customer: saleCustomer.trim(),
      product: saleProduct.trim(),
      contact: saleContact.trim() || "",
      title: `${saleProduct.trim()} - ${saleCustomer.trim()}`,
      amount: parseFloat(saleAmount),
      createdAt: new Date().toISOString(),
    };

    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        businessEntries: [...(d.generator.businessEntries || []), newEntry],
      },
    }));

    setSaleCustomer("");
    setSaleProduct("");
    setSaleContact("");
    setSaleAmount("");
    setSaleDate(todayISO());

    setActiveTab("overview");
    setRenderKey(Date.now());
    showToast("✅ Sale saved!");
  };

  // --- Handle Expenses ---
  const handleAddExpense = () => {
    if (
      !expenseTitle.trim() ||
      !expenseAmount ||
      parseFloat(expenseAmount) <= 0
    ) {
      alert("Please enter a valid expense title and amount.");
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: expenseDate,
      type: "expense",
      category: expenseCategory,
      title: expenseTitle.trim(),
      amount: parseFloat(expenseAmount),
      createdAt: new Date().toISOString(),
    };

    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        businessEntries: [...(d.generator.businessEntries || []), newEntry],
      },
    }));

    setExpenseTitle("");
    setExpenseAmount("");
    setExpenseDate(todayISO());

    setActiveTab("overview");
    setRenderKey(Date.now());
    showToast("✅ Expense saved!");
  };

  // --- Handle Staff Salary ---
  const handleAddStaff = () => {
    if (!staffName.trim() || !staffAmount || parseFloat(staffAmount) <= 0) {
      alert("Please enter staff name and salary amount.");
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: staffDate,
      type: "staff",
      staffName: staffName.trim(),
      title: `Salary: ${staffName.trim()}`,
      amount: parseFloat(staffAmount),
      createdAt: new Date().toISOString(),
    };

    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        businessEntries: [...(d.generator.businessEntries || []), newEntry],
      },
    }));

    setStaffName("");
    setStaffAmount("");
    setStaffDate(todayISO());

    setActiveTab("overview");
    setRenderKey(Date.now());
    showToast("✅ Staff salary saved!");
  };

  // --- Handle Savings / Investment ---
  const handleAddSavings = () => {
    if (
      !savingsTitle.trim() ||
      !savingsAmount ||
      parseFloat(savingsAmount) <= 0
    ) {
      alert("Please enter a title and amount for savings/investment.");
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: savingsDate,
      type: "savings",
      savingsType: savingsType,
      title: `${savingsType}: ${savingsTitle.trim()}`,
      amount: parseFloat(savingsAmount),
      createdAt: new Date().toISOString(),
    };

    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        businessEntries: [...(d.generator.businessEntries || []), newEntry],
      },
    }));

    setSavingsTitle("");
    setSavingsAmount("");
    setSavingsDate(todayISO());

    setActiveTab("overview");
    setRenderKey(Date.now());
    showToast("✅ Savings saved!");
  };

  // --- Open Edit Mode from View Modal ---
  const openEditMode = () => {
    setIsEditing(true);
    setEditForm({ ...viewingEntry });
  };

  // --- Save Edit ---
  const handleSaveEdit = () => {
    if (!editForm) return;

    if (editForm.type === "sale") {
      if (
        !editForm.customer?.trim() ||
        !editForm.product?.trim() ||
        !editForm.amount ||
        editForm.amount <= 0
      ) {
        alert("Please fill in Customer, Product/Service, and Amount.");
        return;
      }
      editForm.title = `${editForm.product.trim()} - ${editForm.customer.trim()}`;
    } else if (editForm.type === "expense") {
      if (!editForm.title?.trim() || !editForm.amount || editForm.amount <= 0) {
        alert("Please fill in a valid expense title and amount.");
        return;
      }
    } else if (editForm.type === "staff") {
      if (
        !editForm.staffName?.trim() ||
        !editForm.amount ||
        editForm.amount <= 0
      ) {
        alert("Please fill in staff name and salary amount.");
        return;
      }
      editForm.title = `Salary: ${editForm.staffName.trim()}`;
    } else if (editForm.type === "savings") {
      if (!editForm.title?.trim() || !editForm.amount || editForm.amount <= 0) {
        alert("Please fill in a title and amount for savings/investment.");
        return;
      }
    }

    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        businessEntries: (d.generator.businessEntries || []).map((entry) =>
          entry.id === editForm.id ? { ...editForm } : entry,
        ),
      },
    }));

    setIsEditing(false);
    setViewingEntry({ ...editForm });
    setRenderKey(Date.now());
    showToast("✅ Entry updated!");
  };

  // --- Cancel Edit ---
  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  // --- Delete Entry ---
  const handleDeleteEntry = (id) => {
    if (!window.confirm("Delete this business entry?")) return;
    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        businessEntries: (d.generator.businessEntries || []).filter(
          (e) => e.id !== id,
        ),
      },
    }));
    setViewingEntry(null);
    setIsEditing(false);
    setEditForm(null);
    setRenderKey(Date.now());
    showToast("🗑️ Entry deleted");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in space-y-6">
      {/* 🚀 Toast Notification */}
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
          <Briefcase className="w-6 h-6 text-primary dark:text-primary-400" />{" "}
          Business Hub
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Track sales, expenses, staff salaries, and business
          savings/investments.
        </p>
      </div>

      {/* --- Navigation Tabs --- */}
      <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === "overview" ? "bg-white dark:bg-gray-700 shadow text-primary dark:text-primary-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
        >
          <Wallet className="w-4 h-4" /> Overview
        </button>
        <button
          onClick={() => setActiveTab("sales")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === "sales" ? "bg-white dark:bg-gray-700 shadow text-primary dark:text-primary-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
        >
          <TrendingUp className="w-4 h-4" /> Sales
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === "expenses" ? "bg-white dark:bg-gray-700 shadow text-primary dark:text-primary-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
        >
          <TrendingDown className="w-4 h-4" /> Expenses
        </button>
        <button
          onClick={() => setActiveTab("staff")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === "staff" ? "bg-white dark:bg-gray-700 shadow text-primary dark:text-primary-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
        >
          <Users className="w-4 h-4" /> Staff
        </button>
        <button
          onClick={() => setActiveTab("savings")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === "savings" ? "bg-white dark:bg-gray-700 shadow text-primary dark:text-primary-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
        >
          <PiggyBank className="w-4 h-4" /> Savings
        </button>
      </div>

      {/* --- Overview Tab --- */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* ✏️ Company Name */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Company Name
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {isCompanyEditing ? (
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter your business name..."
                      className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex-1">
                      {companyName || "No name set"}
                    </p>
                  )}

                  {isCompanyEditing ? (
                    <button
                      onClick={handleSaveCompany}
                      className="px-4 py-2 bg-primary text-white dark:text-primary-400 text-sm font-semibold rounded-lg hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsCompanyEditing(true)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-400 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 text-center">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                Monthly Revenue
              </p>
              <p className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-1">
                {naira(monthlyRevenue)}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 text-center">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">
                Monthly Expenses
              </p>
              <p className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-1">
                {naira(monthlyExpenses)}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 text-center">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                Monthly Staff Costs
              </p>
              <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                {naira(monthlyStaffCost)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 text-center col-span-1 sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Monthly Net Profit
              </p>
              <p
                className={`text-3xl font-extrabold mt-1 ${monthlyProfit >= 0 ? "text-primary dark:text-primary-400" : "text-red-600 dark:text-red-400"}`}
              >
                {monthlyProfit >= 0 ? "+" : ""}
                {naira(monthlyProfit)}
              </p>
            </div>
          </div>

          {/* Monthly Savings Card */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-5 text-center">
            <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide">
              Monthly Savings & Investments
            </p>
            <p className="text-3xl font-extrabold text-yellow-600 dark:text-yellow-400 mt-1">
              {naira(monthlySavings)}
            </p>
          </div>

          {/* Clickable All-Time Revenue */}
          <div
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 text-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setShowAllTimeBreakdown(!showAllTimeBreakdown)}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                All-Time Revenue
              </p>
              {showAllTimeBreakdown ? (
                <ChevronUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-green-600 dark:text-green-400" />
              )}
            </div>
            <p className="text-4xl font-extrabold text-green-600 dark:text-green-400 mt-1">
              {naira(allTimeRevenue)}
            </p>
          </div>

          {/* Expanded Monthly Revenue Breakdown */}
          {showAllTimeBreakdown && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 animate-fade-in shadow-sm">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Monthly Sales Breakdown
              </h4>
              <div className="space-y-2">
                {monthlyRevenueBreakdown.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">
                    No sales recorded yet.
                  </p>
                ) : (
                  monthlyRevenueBreakdown.map(([month, total]) => {
                    const dateObj = new Date(month + "-01");
                    const label = dateObj.toLocaleDateString("en-NG", {
                      month: "short",
                      year: "numeric",
                    });
                    return (
                      <div
                        key={month}
                        className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700 last:border-0"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {label}
                        </span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {naira(total)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Month Selection Buttons */}
          {monthKeys.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                View Monthly Archives
              </h3>
              <div className="flex flex-wrap gap-2">
                {monthKeys.map((month) => {
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
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Monthly Archive View --- */}
      {selectedMonth && activeTab === "overview" && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-text dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary dark:text-primary-400" />
              {new Date(selectedMonth + "-01").toLocaleDateString("en-NG", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={() => setSelectedMonth(null)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400 transition-colors"
            >
              Close Month View
            </button>
          </div>

          {/* Category Totals for this month */}
          {selectedMonthTotals && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-green-50/80 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-green-700 dark:text-green-400 uppercase">
                  Sales
                </p>
                <p className="text-lg font-extrabold text-green-600 dark:text-green-400">
                  {naira(selectedMonthTotals.sales)}
                </p>
              </div>
              <div className="bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase">
                  Staff
                </p>
                <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                  {naira(selectedMonthTotals.staff)}
                </p>
              </div>
              <div className="bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-yellow-700 dark:text-yellow-400 uppercase">
                  Savings
                </p>
                <p className="text-lg font-extrabold text-yellow-600 dark:text-yellow-400">
                  {naira(selectedMonthTotals.savings)}
                </p>
              </div>
              <div className="bg-orange-50/80 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-orange-700 dark:text-orange-400 uppercase">
                  Transport
                </p>
                <p className="text-lg font-extrabold text-orange-600 dark:text-orange-400">
                  {naira(selectedMonthTotals.transport)}
                </p>
              </div>
              <div className="bg-purple-50/80 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-purple-700 dark:text-purple-400 uppercase">
                  Utilities
                </p>
                <p className="text-lg font-extrabold text-purple-600 dark:text-purple-400">
                  {naira(selectedMonthTotals.utilities)}
                </p>
              </div>
              <div className="bg-pink-50/80 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-pink-700 dark:text-pink-400 uppercase">
                  Marketing
                </p>
                <p className="text-lg font-extrabold text-pink-600 dark:text-pink-400">
                  {naira(selectedMonthTotals.marketing)}
                </p>
              </div>
              <div className="bg-indigo-50/80 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase">
                  Rent
                </p>
                <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                  {naira(selectedMonthTotals.rent)}
                </p>
              </div>
              <div className="bg-gray-50/80 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  Supplies / Other
                </p>
                <p className="text-lg font-extrabold text-gray-600 dark:text-gray-300">
                  {naira(
                    selectedMonthTotals.supplies + selectedMonthTotals.other,
                  )}
                </p>
              </div>
            </div>
          )}

          {filteredMonthEntries.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 border border-dashed dark:border-gray-700">
              <p className="text-sm">
                No records for this month yet. Add a sale or expense from the
                tabs above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMonthEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          entry.type === "sale"
                            ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                            : entry.type === "expense"
                              ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400"
                              : entry.type === "staff"
                                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400"
                                : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400"
                        }`}
                      >
                        {entry.type === "sale"
                          ? "Sale"
                          : entry.type === "expense"
                            ? "Expense"
                            : entry.type === "staff"
                              ? "Staff"
                              : "Savings"}
                      </span>
                      {entry.type === "expense" && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {entry.category}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-neutral-text dark:text-white truncate">
                      {entry.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(entry.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold ${
                        entry.type === "sale"
                          ? "text-green-600 dark:text-green-400"
                          : entry.type === "expense" || entry.type === "staff"
                            ? "text-red-500 dark:text-red-400"
                            : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {entry.type === "sale" ? "+" : "-"}
                      {naira(entry.amount)}
                    </span>
                    <button
                      onClick={() => setViewingEntry(entry)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- Recent Records Section (Max 8 entries, NEWEST AT TOP) --- */}
      {!selectedMonth && activeTab === "overview" && (
        <div className="mt-6">
          <h2 className="text-lg font-bold text-neutral-text dark:text-white flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary dark:text-primary-400" />{" "}
            Recent Records
          </h2>
          {recentEntries.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 border border-dashed dark:border-gray-700">
              <p className="text-sm">
                No business records yet. Start logging your sales and expenses
                above!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          entry.type === "sale"
                            ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                            : entry.type === "expense"
                              ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400"
                              : entry.type === "staff"
                                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400"
                                : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400"
                        }`}
                      >
                        {entry.type === "sale"
                          ? "Sale"
                          : entry.type === "expense"
                            ? "Expense"
                            : entry.type === "staff"
                              ? "Staff"
                              : "Savings"}
                      </span>
                      {entry.type === "expense" && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {entry.category}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-neutral-text dark:text-white truncate">
                      {entry.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(entry.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold ${
                        entry.type === "sale"
                          ? "text-green-600 dark:text-green-400"
                          : entry.type === "expense" || entry.type === "staff"
                            ? "text-red-500 dark:text-red-400"
                            : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {entry.type === "sale" ? "+" : "-"}
                      {naira(entry.amount)}
                    </span>
                    <button
                      onClick={() => setViewingEntry(entry)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}

              {/* CTA Message */}
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl p-4 text-center mt-4">
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  📅{" "}
                  <span className="font-semibold">
                    Open the Monthly tab above
                  </span>{" "}
                  to see all records organized by month.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Sales Tab --- */}
      {activeTab === "sales" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Record a Sale
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Date
              </label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Customer
              </label>
              <input
                type="text"
                value={saleCustomer}
                onChange={(e) => setSaleCustomer(e.target.value)}
                placeholder="e.g. Mr. Ade"
                className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Product / Service
              </label>
              <input
                type="text"
                value={saleProduct}
                onChange={(e) => setSaleProduct(e.target.value)}
                placeholder="e.g. 90-min massage"
                className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Client Contact
              </label>
              <input
                type="text"
                value={saleContact}
                onChange={(e) => setSaleContact(e.target.value)}
                placeholder="Email or Phone"
                className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Amount (₦)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
                placeholder="0"
                className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
          <button
            onClick={handleAddSale}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white dark:text-primary-400 font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Sale
          </button>
        </div>
      )}

      {/* --- Expenses Tab --- */}
      {activeTab === "expenses" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Record an Expense
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Date
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Category
              </label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                <option>Supplies</option>
                <option>Transport</option>
                <option>Utilities</option>
                <option>Marketing</option>
                <option>Rent</option>
                <option>Staff</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Title
              </label>
              <input
                type="text"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                placeholder="e.g. Bought massage oil"
                className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Amount (₦)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="0"
                className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
          <button
            onClick={handleAddExpense}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white dark:text-primary-400 font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Expense
          </button>
        </div>
      )}

      {/* --- Staff Tab --- */}
      {activeTab === "staff" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Record Staff Salary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Date
              </label>
              <input
                type="date"
                value={staffDate}
                onChange={(e) => setStaffDate(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Staff Name
              </label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="e.g. John Doe"
                className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Salary Amount (₦)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={staffAmount}
                onChange={(e) => setStaffAmount(e.target.value)}
                placeholder="0"
                className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
          <button
            onClick={handleAddStaff}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white dark:text-primary-400 font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Staff Salary
          </button>
        </div>
      )}

      {/* --- Savings / Investment Tab --- */}
      {activeTab === "savings" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Record Savings or Investment
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Date
              </label>
              <input
                type="date"
                value={savingsDate}
                onChange={(e) => setSavingsDate(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Type
              </label>
              <select
                value={savingsType}
                onChange={(e) => setSavingsType(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                <option>Savings</option>
                <option>Investment</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Title
              </label>
              <input
                type="text"
                value={savingsTitle}
                onChange={(e) => setSavingsTitle(e.target.value)}
                placeholder="e.g. Expansion fund"
                className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Amount (₦)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={savingsAmount}
                onChange={(e) => setSavingsAmount(e.target.value)}
                placeholder="0"
                className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
          <button
            onClick={handleAddSavings}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white dark:text-primary-400 font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add to {savingsType}
          </button>
        </div>
      )}

      <AdSlot width={300} height={250} />

      {/* --- View / Edit Modal --- */}
      {viewingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-neutral-text dark:text-white">
                {isEditing ? "Edit Entry" : "Business Entry Details"}
              </h3>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={openEditMode}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    cancelEdit();
                    setViewingEntry(null);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Date
                      </label>
                      <input
                        type="date"
                        value={editForm?.date || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, date: e.target.value })
                        }
                        className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      />
                    </div>
                    {editForm?.type === "sale" && (
                      <>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Customer
                          </label>
                          <input
                            type="text"
                            value={editForm?.customer || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                customer: e.target.value,
                              })
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Product
                          </label>
                          <input
                            type="text"
                            value={editForm?.product || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                product: e.target.value,
                              })
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Contact
                          </label>
                          <input
                            type="text"
                            value={editForm?.contact || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                contact: e.target.value,
                              })
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          />
                        </div>
                      </>
                    )}
                    {editForm?.type === "expense" && (
                      <>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Category
                          </label>
                          <select
                            value={editForm?.category || "Supplies"}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                category: e.target.value,
                              })
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          >
                            <option>Supplies</option>
                            <option>Transport</option>
                            <option>Utilities</option>
                            <option>Marketing</option>
                            <option>Rent</option>
                            <option>Staff</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editForm?.title || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                title: e.target.value,
                              })
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          />
                        </div>
                      </>
                    )}
                    {editForm?.type === "staff" && (
                      <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Staff Name
                        </label>
                        <input
                          type="text"
                          value={editForm?.staffName || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              staffName: e.target.value,
                            })
                          }
                          className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        />
                      </div>
                    )}
                    {editForm?.type === "savings" && (
                      <>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Type
                          </label>
                          <select
                            value={editForm?.savingsType || "Savings"}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                savingsType: e.target.value,
                              })
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          >
                            <option>Savings</option>
                            <option>Investment</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editForm?.title || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                title: e.target.value,
                              })
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          />
                        </div>
                      </>
                    )}
                    <div
                      className={editForm?.type === "sale" ? "col-span-2" : ""}
                    >
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Amount (₦)
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={editForm?.amount || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            amount: parseFloat(e.target.value),
                          })
                        }
                        className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 py-2 bg-primary text-white dark:text-primary-400 font-semibold rounded-lg hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Date
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {formatDate(viewingEntry.date)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Type
                    </span>
                    <span
                      className={`font-semibold ${
                        viewingEntry.type === "sale"
                          ? "text-green-600 dark:text-green-400"
                          : viewingEntry.type === "expense" ||
                              viewingEntry.type === "staff"
                            ? "text-red-500 dark:text-red-400"
                            : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {viewingEntry.type === "sale"
                        ? "Sale"
                        : viewingEntry.type === "expense"
                          ? "Expense"
                          : viewingEntry.type === "staff"
                            ? "Staff"
                            : "Savings"}
                    </span>
                  </div>
                  {viewingEntry.type === "sale" && (
                    <>
                      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Customer
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {viewingEntry.customer}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Product
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {viewingEntry.product}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Contact
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {viewingEntry.contact || "Not provided"}
                        </span>
                      </div>
                    </>
                  )}
                  {viewingEntry.type === "expense" && (
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Category
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {viewingEntry.category}
                      </span>
                    </div>
                  )}
                  {viewingEntry.type === "staff" && (
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Staff Name
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {viewingEntry.staffName}
                      </span>
                    </div>
                  )}
                  {viewingEntry.type === "savings" && (
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Type
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {viewingEntry.savingsType}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Title
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {viewingEntry.title}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-primary-50 dark:bg-primary-900/30 rounded-xl p-3">
                    <span className="text-sm text-primary-600 dark:text-primary-400">
                      Amount
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        viewingEntry.type === "sale"
                          ? "text-green-600 dark:text-green-400"
                          : viewingEntry.type === "expense" ||
                              viewingEntry.type === "staff"
                            ? "text-red-500 dark:text-red-400"
                            : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {naira(viewingEntry.amount)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-center">
              <button
                onClick={() => {
                  cancelEdit();
                  setViewingEntry(null);
                }}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
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
