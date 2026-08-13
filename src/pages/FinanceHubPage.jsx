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
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdSlot from "../components/AdSlot";
import { useNaijaBase } from "../context/NaijaBaseContext";
import { todayISO, formatDate, naira } from "../utils/constants";
import LoadingSpinner from "../components/LoadingSpinner";

export default function FinanceHubPage() {
  const { currentUser, updateUserData } = useNaijaBase();
  const g = currentUser?.data?.generator;
  if (!g) return null;

  // 🚀 Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [viewingEntry, setViewingEntry] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showAllTimeBreakdown, setShowAllTimeBreakdown] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterDuration, setFilterDuration] = useState("thisMonth");

  const [companyName, setCompanyName] = useState(g?.companyName || "");
  const [isCompanyEditing, setIsCompanyEditing] = useState(!g?.companyName);

  // Sales Form States
  const [saleDate, setSaleDate] = useState(todayISO());
  const [saleCustomer, setSaleCustomer] = useState("");
  const [saleProduct, setSaleProduct] = useState("");
  const [saleContact, setSaleContact] = useState("");
  const [saleAmount, setSaleAmount] = useState("");

  // Expense Form States
  const [expenseDate, setExpenseDate] = useState(todayISO());
  const [expenseCategory, setExpenseCategory] = useState("Supplies");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  // Staff Salary States
  const [staffDate, setStaffDate] = useState(todayISO());
  const [staffName, setStaffName] = useState("");
  const [staffAmount, setStaffAmount] = useState("");

  // Savings / Investment States
  const [savingsDate, setSavingsDate] = useState(todayISO());
  const [savingsType, setSavingsType] = useState("Savings");
  const [savingsTitle, setSavingsTitle] = useState("");
  const [savingsAmount, setSavingsAmount] = useState("");

  // Edit Modal States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // Toast State
  const [toast, setToast] = useState(null);
  const [renderKey, setRenderKey] = useState(0);

  // Loading states for each action
  const [isSavingSale, setIsSavingSale] = useState(false);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [isSavingStaff, setIsSavingStaff] = useState(false);
  const [isSavingSavings, setIsSavingSavings] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const businessEntries = g.businessEntries || [];

  // --- Filter Logic ---
  const getDateRange = (duration) => {
    const now = new Date();
    const start = new Date();
    switch (duration) {
      case "thisWeek":
        start.setDate(now.getDate() - 7);
        break;
      case "thisMonth":
        start.setMonth(now.getMonth());
        start.setDate(1);
        break;
      case "last3Months":
        start.setMonth(now.getMonth() - 3);
        break;
      case "allTime":
        return null;
      default:
        start.setMonth(now.getMonth());
        start.setDate(1);
        break;
    }
    return start.toISOString().split("T")[0];
  };

  const filteredEntries = useMemo(() => {
    let entries = [...businessEntries];
    const dateLimit = getDateRange(filterDuration);

    if (filterType !== "all") {
      entries = entries.filter((e) => e.type === filterType);
    }

    if (dateLimit) {
      entries = entries.filter((e) => e.date >= dateLimit);
    }

    return entries.sort((a, b) => b.date.localeCompare(a.date));
  }, [businessEntries, filterType, filterDuration]);

  // --- All-Time Revenue ---
  const allTimeRevenue = businessEntries
    .filter((e) => e.type === "sale")
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  // --- Current Month Financials ---
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

  const balanceLeft =
    monthlyRevenue - monthlyExpenses - monthlyStaffCost - monthlySavings;

  // --- Unique Months ---
  const monthKeys = useMemo(() => {
    const months = businessEntries.map((e) => e.date.slice(0, 7));
    return [...new Set(months)].sort((a, b) => b.localeCompare(a));
  }, [businessEntries]);

  // --- Filtered Month Entries ---
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
  const handleAddSale = async () => {
    if (
      !saleCustomer.trim() ||
      !saleProduct.trim() ||
      !saleAmount ||
      parseFloat(saleAmount) <= 0
    ) {
      alert("Please fill in Customer, Product/Service, and Amount.");
      return;
    }
    setIsSavingSale(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

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

    setIsSavingSale(false);
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
  const handleAddExpense = async () => {
    if (
      !expenseTitle.trim() ||
      !expenseAmount ||
      parseFloat(expenseAmount) <= 0
    ) {
      alert("Please enter a valid expense title and amount.");
      return;
    }
    setIsSavingExpense(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

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

    setIsSavingExpense(false);
    setExpenseTitle("");
    setExpenseAmount("");
    setExpenseDate(todayISO());
    setActiveTab("overview");
    setRenderKey(Date.now());
    showToast("✅ Expense saved!");
  };

  // --- Handle Staff Salary ---
  const handleAddStaff = async () => {
    if (!staffName.trim() || !staffAmount || parseFloat(staffAmount) <= 0) {
      alert("Please enter staff name and salary amount.");
      return;
    }
    setIsSavingStaff(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

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

    setIsSavingStaff(false);
    setStaffName("");
    setStaffAmount("");
    setStaffDate(todayISO());
    setActiveTab("overview");
    setRenderKey(Date.now());
    showToast("✅ Staff salary saved!");
  };

  // --- Handle Savings / Investment ---
  const handleAddSavings = async () => {
    if (
      !savingsTitle.trim() ||
      !savingsAmount ||
      parseFloat(savingsAmount) <= 0
    ) {
      alert("Please enter a title and amount for savings/investment.");
      return;
    }
    setIsSavingSavings(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

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

    setIsSavingSavings(false);
    setSavingsTitle("");
    setSavingsAmount("");
    setSavingsDate(todayISO());
    setActiveTab("overview");
    setRenderKey(Date.now());
    showToast("✅ Savings saved!");
  };

  // --- Edit Modal Helpers ---
  const openEditMode = () => {
    setIsEditing(true);
    setEditForm({ ...viewingEntry });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  const handleSaveEdit = async () => {
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

    setIsSavingEdit(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        businessEntries: (d.generator.businessEntries || []).map((entry) =>
          entry.id === editForm.id ? { ...editForm } : entry,
        ),
      },
    }));

    setIsSavingEdit(false);
    setIsEditing(false);
    setViewingEntry({ ...editForm });
    setRenderKey(Date.now());
    showToast("✅ Entry updated!");
  };

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

  // --- Render ---
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
          <Briefcase className="w-6 h-6 text-primary dark:text-primary-400" />{" "}
          Business Hub
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Track sales, expenses, staff, and savings.
        </p>
      </div>

      {/* --- Navigation Tabs --- */}
      <motion.div
        className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[
          { id: "overview", label: "Overview", icon: Wallet },
          { id: "sales", label: "Sales", icon: TrendingUp },
          { id: "expenses", label: "Expenses", icon: TrendingDown },
          { id: "staff", label: "Staff", icon: Users },
          { id: "savings", label: "Savings", icon: PiggyBank },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-700 shadow text-primary dark:text-primary-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* --- Overview Tab --- */}
      {activeTab === "overview" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Company Name */}
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
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveCompany}
                      className="px-4 py-2 bg-primary text-white dark:text-primary-400 text-sm font-semibold rounded-lg hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
                    >
                      Save
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsCompanyEditing(true)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-400 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
          >
            {[
              {
                label: "Monthly Revenue",
                value: naira(monthlyRevenue),
                color: "green",
              },
              {
                label: "Monthly Expenses",
                value: naira(monthlyExpenses),
                color: "red",
              },
              {
                label: "Monthly Staff Costs",
                value: naira(monthlyStaffCost),
                color: "blue",
              },
              {
                label: "Balance Left",
                value:
                  balanceLeft >= 0
                    ? naira(balanceLeft)
                    : `-${naira(Math.abs(balanceLeft))}`,
                color: balanceLeft >= 0 ? "primary" : "red",
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                className={`bg-${card.color}-50 dark:bg-${card.color}-900/20 border border-${card.color}-200 dark:border-${card.color}-800 rounded-2xl p-5 text-center`}
              >
                <p
                  className={`text-xs font-semibold text-${card.color}-700 dark:text-${card.color}-400 uppercase tracking-wide`}
                >
                  {card.label}
                </p>
                <p
                  className={`text-3xl font-extrabold text-${card.color}-600 dark:text-${card.color}-400 mt-1`}
                >
                  {card.value}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Monthly Savings Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-5 text-center"
          >
            <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide">
              Monthly Savings & Investments
            </p>
            <p className="text-3xl font-extrabold text-yellow-600 dark:text-yellow-400 mt-1">
              {naira(monthlySavings)}
            </p>
          </motion.div>

          {/* All-Time Revenue */}
          <motion.div
            whileHover={{ scale: 1.01 }}
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
          </motion.div>

          {/* Expanded Monthly Breakdown */}
          <AnimatePresence>
            {showAllTimeBreakdown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm"
              >
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
                        <motion.div
                          key={month}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700 last:border-0"
                        >
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {label}
                          </span>
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">
                            {naira(total)}
                          </span>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                    <motion.button
                      key={month}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedMonth(month)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedMonth === month
                          ? "bg-primary text-white dark:bg-primary-600"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* --- Monthly Archive View --- */}
      {selectedMonth && activeTab === "overview" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-text dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary dark:text-primary-400" />
              {new Date(selectedMonth + "-01").toLocaleDateString("en-NG", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMonth(null)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400 transition-colors"
            >
              Close Month View
            </motion.button>
          </div>

          {/* Category Totals */}
          {selectedMonthTotals && (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
              }}
            >
              {[
                {
                  label: "Sales",
                  value: naira(selectedMonthTotals.sales),
                  color: "green",
                },
                {
                  label: "Staff",
                  value: naira(selectedMonthTotals.staff),
                  color: "blue",
                },
                {
                  label: "Savings",
                  value: naira(selectedMonthTotals.savings),
                  color: "yellow",
                },
                {
                  label: "Transport",
                  value: naira(selectedMonthTotals.transport),
                  color: "orange",
                },
                {
                  label: "Utilities",
                  value: naira(selectedMonthTotals.utilities),
                  color: "purple",
                },
                {
                  label: "Marketing",
                  value: naira(selectedMonthTotals.marketing),
                  color: "pink",
                },
                {
                  label: "Rent",
                  value: naira(selectedMonthTotals.rent),
                  color: "indigo",
                },
                {
                  label: "Supplies/Other",
                  value: naira(
                    selectedMonthTotals.supplies + selectedMonthTotals.other,
                  ),
                  color: "gray",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                  className={`bg-${item.color}-50/80 dark:bg-${item.color}-900/20 border border-${item.color}-100 dark:border-${item.color}-800 rounded-xl p-3 text-center`}
                >
                  <p
                    className={`text-[10px] font-semibold text-${item.color}-700 dark:text-${item.color}-400 uppercase`}
                  >
                    {item.label}
                  </p>
                  <p
                    className={`text-lg font-extrabold text-${item.color}-600 dark:text-${item.color}-400`}
                  >
                    {item.value}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {filteredMonthEntries.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 border border-dashed dark:border-gray-700">
              <p className="text-sm">
                No records for this month yet. Add a sale or expense from the
                tabs above.
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
              {filteredMonthEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
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
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewingEntry(entry)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* --- Filtered Transaction History --- */}
      {!selectedMonth && activeTab === "overview" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <h2 className="text-lg font-bold text-neutral-text dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary dark:text-primary-400" />{" "}
              Transaction History
            </h2>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/30 appearance-none pr-8"
                >
                  <option value="all">All Types</option>
                  <option value="sale">Sales</option>
                  <option value="expense">Expenses</option>
                  <option value="staff">Staff</option>
                  <option value="savings">Savings</option>
                </select>
                <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative flex-1 sm:flex-none">
                <select
                  value={filterDuration}
                  onChange={(e) => setFilterDuration(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/30 appearance-none pr-8"
                >
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="last3Months">Last 3 Months</option>
                  <option value="allTime">All Time</option>
                </select>
                <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 border border-dashed dark:border-gray-700">
              <p className="text-sm">
                No transactions found for the selected filters. Start logging
                your sales and expenses above!
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
              {filteredEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
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
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewingEntry(entry)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* --- Sales Tab --- */}
      {activeTab === "sales" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4"
        >
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Record a Sale
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Date
              </label>
              <div className="relative w-full max-w-full sm:max-w-[200px]">
                <div className="flex items-center w-full px-4 py-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-colors cursor-pointer group">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full bg-transparent border-none text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer text-base font-medium placeholder-gray-400"
                  />
                </div>
              </div>
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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddSale}
            disabled={isSavingSale}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white dark:text-primary-400 font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors disabled:opacity-70"
          >
            {isSavingSale ? (
              <LoadingSpinner size={20} color="text-white" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {isSavingSale ? "Saving..." : "Add Sale"}
          </motion.button>
        </motion.div>
      )}

      {/* --- Expenses Tab --- */}
      {activeTab === "expenses" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4"
        >
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Record an Expense
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Date
              </label>
              <div className="relative w-full max-w-full sm:max-w-[200px]">
                <div className="flex items-center w-full px-4 py-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-colors cursor-pointer group">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-transparent border-none text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer text-base font-medium placeholder-gray-400"
                  />
                </div>
              </div>
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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddExpense}
            disabled={isSavingExpense}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white dark:text-primary-400 font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors disabled:opacity-70"
          >
            {isSavingExpense ? (
              <LoadingSpinner size={20} color="text-white" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {isSavingExpense ? "Saving..." : "Add Expense"}
          </motion.button>
        </motion.div>
      )}

      {/* --- Staff Tab --- */}
      {activeTab === "staff" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4"
        >
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Record Staff Salary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Date
              </label>
              <div className="relative w-full max-w-full sm:max-w-[200px]">
                <div className="flex items-center w-full px-4 py-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-colors cursor-pointer group">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="date"
                    value={staffDate}
                    onChange={(e) => setStaffDate(e.target.value)}
                    className="w-full bg-transparent border-none text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer text-base font-medium placeholder-gray-400"
                  />
                </div>
              </div>
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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddStaff}
            disabled={isSavingStaff}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white dark:text-primary-400 font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors disabled:opacity-70"
          >
            {isSavingStaff ? (
              <LoadingSpinner size={20} color="text-white" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {isSavingStaff ? "Saving..." : "Add Staff Salary"}
          </motion.button>
        </motion.div>
      )}

      {/* --- Savings Tab --- */}
      {activeTab === "savings" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4"
        >
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Record Savings or Investment
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Date
              </label>
              <div className="relative w-full max-w-full sm:max-w-[200px]">
                <div className="flex items-center w-full px-4 py-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-colors cursor-pointer group">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="date"
                    value={savingsDate}
                    onChange={(e) => setSavingsDate(e.target.value)}
                    className="w-full bg-transparent border-none text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer text-base font-medium placeholder-gray-400"
                  />
                </div>
              </div>
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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddSavings}
            disabled={isSavingSavings}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white dark:text-primary-400 font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors disabled:opacity-70"
          >
            {isSavingSavings ? (
              <LoadingSpinner size={20} color="text-white" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {isSavingSavings ? "Saving..." : "Add to {savingsType}"}
          </motion.button>
        </motion.div>
      )}

      <AdSlot width={300} height={250} />

      {/* --- View / Edit Modal --- */}
      <AnimatePresence>
        {viewingEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              {/* ... modal content ... */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-neutral-text dark:text-white">
                  {isEditing ? "Edit Entry" : "Business Entry Details"}
                </h3>
                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={openEditMode}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      cancelEdit();
                      setViewingEntry(null);
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </motion.button>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {isEditing ? (
                  <div className="space-y-3">
                    {/* ... edit form fields ... */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Date
                        </label>
                        <div className="relative w-full max-w-full sm:max-w-[200px]">
                          <div className="flex items-center w-full px-4 py-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-colors cursor-pointer group">
                            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                            <input
                              type="date"
                              value={editForm?.date || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  date: e.target.value,
                                })
                              }
                              className="w-full bg-transparent border-none text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer text-base font-medium placeholder-gray-400"
                            />
                          </div>
                        </div>
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
                        className={
                          editForm?.type === "sale" ? "col-span-2" : ""
                        }
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
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveEdit}
                        disabled={isSavingEdit}
                        className="flex-1 py-2 bg-primary text-white dark:text-primary-400 font-semibold rounded-lg hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors disabled:opacity-70"
                      >
                        {isSavingEdit ? (
                          <LoadingSpinner size={20} color="text-white" />
                        ) : (
                          "Save Changes"
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={cancelEdit}
                        className="flex-1 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* ... view details ... */}
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
                        className={`font-semibold ${viewingEntry.type === "sale" ? "text-green-600 dark:text-green-400" : viewingEntry.type === "expense" || viewingEntry.type === "staff" ? "text-red-500 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"}`}
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
                    {/* ... more details ... */}
                    <div className="flex justify-between items-center bg-primary-50 dark:bg-primary-900/30 rounded-xl p-3">
                      <span className="text-sm text-primary-600 dark:text-primary-400">
                        Amount
                      </span>
                      <span
                        className={`font-bold text-lg ${viewingEntry.type === "sale" ? "text-green-600 dark:text-green-400" : viewingEntry.type === "expense" || viewingEntry.type === "staff" ? "text-red-500 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"}`}
                      >
                        {naira(viewingEntry.amount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    cancelEdit();
                    setViewingEntry(null);
                  }}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
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
