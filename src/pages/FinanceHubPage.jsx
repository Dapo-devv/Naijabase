import { useState } from "react";
import {
  Briefcase,
  User,
  Coffee,
  Wifi,
  ShoppingBag,
  Home,
  Tv,
  Droplet,
  Trash,
  Zap,
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  Minus,
} from "lucide-react";
import AdSlot from "../components/AdSlot";
import { useNaijaBase } from "../context/NaijaBaseContext";
import { todayISO, formatDate, naira } from "../utils/constants";

export default function FinanceHubPage() {
  const { currentUser, updateUserData } = useNaijaBase();
  const g = currentUser?.data?.generator;
  if (!g) return null;

  // --- Mode State (Daily Life, Business, Utilities) ---
  const [mode, setMode] = useState("daily");

  // --- Generic Field Updater ---
  const setField = (field, value) => {
    updateUserData((d) => ({
      ...d,
      generator: { ...d.generator, [field]: value },
    }));
  };

  // --- Helper to update nested utility fields safely ---
  const setUtilityField = (key, value) => {
    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        utilities: { ...d.generator.utilities, [key]: value },
      },
    }));
  };

  // --- Helper to parse inputs safely ---
  const parseNum = (val) => parseFloat(val) || 0;

  // --- MODE 1: DAILY LIFE ---
  const dailyTransport = parseNum(g.dailyTransport || 0);
  const dailyFood = parseNum(g.dailyFood || 0);
  const dailyData = parseNum(g.dailyData || 0);
  const dailyMisc = parseNum(g.dailyMisc || 0);
  const dailyTotal = dailyTransport + dailyFood + dailyData + dailyMisc;

  // --- MODE 3: UTILITIES & BILLS ---
  const util = g.utilities || {};
  const electricity = parseNum(util.electricity || 0);
  const cableTV = parseNum(util.cableTV || 0);
  const internet = parseNum(util.internet || 0);
  const water = parseNum(util.water || 0);
  const waste = parseNum(util.waste || 0);
  const utilitiesTotal = electricity + cableTV + internet + water + waste;

  // --- 🚀 MODE 2: BUSINESS LEDGER (Transactions) ---
  // Initialize transactions safely
  const transactions = g.transactions || [];

  // New transaction form state
  const [txnDate, setTxnDate] = useState(todayISO());
  const [txnType, setTxnType] = useState("income");
  const [txnTitle, setTxnTitle] = useState("");
  const [txnAmount, setTxnAmount] = useState("");

  // Calculate totals and balance
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const currentBalance = totalIncome - totalExpenses;

  const handleAddTransaction = () => {
    const amount = parseFloat(txnAmount);
    if (!txnTitle.trim() || isNaN(amount) || amount <= 0) return;

    const newTxn = {
      id: Date.now(),
      date: txnDate,
      type: txnType,
      title: txnTitle.trim(),
      amount: amount,
      createdAt: new Date().toISOString(),
    };

    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        transactions: [...(d.generator.transactions || []), newTxn],
      },
    }));

    // Reset form
    setTxnTitle("");
    setTxnAmount("");
    setTxnDate(todayISO());
    setTxnType("income");
  };

  const handleDeleteTransaction = (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        transactions: (d.generator.transactions || []).filter(
          (t) => t.id !== id,
        ),
      },
    }));
  };

  // Sort transactions by date (newest first)
  const sortedTxns = [...transactions].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-text flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" /> Finance & Expense Hub
        </h1>
        <p className="text-sm text-gray-500">
          Track daily living, manage your business income & expenses, and
          monitor household bills.
        </p>
      </div>

      {/* --- Mode Toggle Tabs --- */}
      <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setMode("daily")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
            mode === "daily"
              ? "bg-white shadow text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <User className="w-4 h-4" /> Daily Life
        </button>
        <button
          onClick={() => setMode("business")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
            mode === "business"
              ? "bg-white shadow text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Briefcase className="w-4 h-4" /> Business Ledger
        </button>
        <button
          onClick={() => setMode("utilities")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
            mode === "utilities"
              ? "bg-white shadow text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Home className="w-4 h-4" /> Utilities
        </button>
      </div>

      {/* --- Input Forms by Mode --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        {/* MODE 1: DAILY LIFE */}
        {mode === "daily" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <ShoppingBag className="w-3 h-3" /> Transport Fare
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={g.dailyTransport || ""}
                onChange={(e) =>
                  setField(
                    "dailyTransport",
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                  )
                }
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                placeholder="Daily bus/taxi cost"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Coffee className="w-3 h-3" /> Food / Lunch
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={g.dailyFood || ""}
                onChange={(e) =>
                  setField(
                    "dailyFood",
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                  )
                }
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                placeholder="Daily food budget"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Data / Airtime
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={g.dailyData || ""}
                onChange={(e) =>
                  setField(
                    "dailyData",
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                  )
                }
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                placeholder="Daily data/airtime"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <ShoppingBag className="w-3 h-3" /> Miscellaneous
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={g.dailyMisc || ""}
                onChange={(e) =>
                  setField(
                    "dailyMisc",
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                  )
                }
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                placeholder="Snacks, subscriptions"
              />
            </div>
          </div>
        )}

        {/* MODE 2: BUSINESS LEDGER (Transactions) */}
        {mode === "business" && (
          <div className="space-y-6">
            {/* Form to add a new transaction */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Record a Transaction
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </label>
                  <input
                    type="date"
                    value={txnDate}
                    onChange={(e) => setTxnDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Title/Description
                  </label>
                  <input
                    type="text"
                    value={txnTitle}
                    onChange={(e) => setTxnTitle(e.target.value)}
                    placeholder="e.g. Client payment, Oil restock"
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Amount (₦)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={txnAmount}
                    onChange={(e) => setTxnAmount(e.target.value)}
                    placeholder="0"
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setTxnType("income")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${txnType === "income" ? "bg-green-600 text-white" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    Income
                  </button>
                  <button
                    onClick={() => setTxnType("expense")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${txnType === "expense" ? "bg-red-500 text-white" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    Expense
                  </button>
                </div>
                <button
                  onClick={handleAddTransaction}
                  className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Entry
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-green-600 font-bold uppercase tracking-wide flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Total Income
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {naira(totalIncome)}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-red-500 font-bold uppercase tracking-wide flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> Total Expenses
                </p>
                <p className="text-2xl font-bold text-red-500">
                  {naira(totalExpenses)}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-primary font-bold uppercase tracking-wide flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> Current Balance
                </p>
                <p
                  className={`text-2xl font-bold ${currentBalance >= 0 ? "text-primary" : "text-red-500"}`}
                >
                  {naira(currentBalance)}
                </p>
              </div>
            </div>

            {/* List of Past Transactions */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Recent Transaction History
              </h3>
              {sortedTxns.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-6">
                  No transactions yet. Record your first income or expense
                  above.
                </p>
              ) : (
                <div className="space-y-2">
                  {sortedTxns.map((txn) => (
                    <div
                      key={txn.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow gap-2"
                    >
                      <div className="flex-1 flex flex-wrap items-center gap-3">
                        <span className="text-xs text-gray-400 font-mono w-24">
                          {formatDate(txn.date)}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${txn.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {txn.type === "income" ? "IN" : "OUT"}
                        </span>
                        <span className="font-medium text-gray-800 flex-1">
                          {txn.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`font-bold ${txn.type === "income" ? "text-green-600" : "text-red-500"}`}
                        >
                          {txn.type === "income" ? "+" : "-"}
                          {naira(txn.amount)}
                        </span>
                        <button
                          onClick={() => handleDeleteTransaction(txn.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODE 3: UTILITIES & BILLS */}
        {mode === "utilities" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Zap className="w-3 h-3" /> Prepaid Electricity (Monthly)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={util.electricity || ""}
                onChange={(e) =>
                  setUtilityField(
                    "electricity",
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                  )
                }
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                placeholder="Token purchase amount"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Tv className="w-3 h-3" /> Cable TV (DSTV/GOTV)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={util.cableTV || ""}
                onChange={(e) =>
                  setUtilityField(
                    "cableTV",
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                  )
                }
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                placeholder="Monthly subscription"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Internet / WiFi
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={util.internet || ""}
                onChange={(e) =>
                  setUtilityField(
                    "internet",
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                  )
                }
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                placeholder="Monthly data bill"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Droplet className="w-3 h-3" /> Water Bill
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={util.water || ""}
                onChange={(e) =>
                  setUtilityField(
                    "water",
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                  )
                }
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                placeholder="Monthly water bill"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Trash className="w-3 h-3" /> Waste Disposal
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={util.waste || ""}
                onChange={(e) =>
                  setUtilityField(
                    "waste",
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                  )
                }
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                placeholder="Monthly waste fee"
              />
            </div>
          </div>
        )}
      </div>

      <AdSlot width={300} height={250} />

      {/* --- Dynamic Results Display --- */}
      <div className="bg-gradient-to-br from-primary to-primary-700 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-sm font-medium text-primary-100 uppercase tracking-wide">
          {mode === "daily" && "Total Daily Living Cost"}
          {mode === "business" && "Business Performance Summary"}
          {mode === "utilities" && "Total Monthly Utilities Cost"}
        </p>
        <p className="text-4xl font-extrabold mt-1">
          {mode === "daily" && naira(dailyTotal)}
          {mode === "business" &&
            (currentBalance >= 0
              ? `+${naira(currentBalance)}`
              : naira(currentBalance))}
          {mode === "utilities" && naira(utilitiesTotal)}
        </p>

        <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {mode === "daily" && (
            <>
              <div>
                <p className="text-primary-100 text-xs">Transport</p>
                <p className="font-semibold">{naira(dailyTransport)}</p>
              </div>
              <div>
                <p className="text-primary-100 text-xs">Food</p>
                <p className="font-semibold">{naira(dailyFood)}</p>
              </div>
              <div>
                <p className="text-primary-100 text-xs">Data</p>
                <p className="font-semibold">{naira(dailyData)}</p>
              </div>
              <div>
                <p className="text-primary-100 text-xs">Misc</p>
                <p className="font-semibold">{naira(dailyMisc)}</p>
              </div>
            </>
          )}
          {mode === "business" && (
            <>
              <div>
                <p className="text-primary-100 text-xs">Total Income</p>
                <p className="font-semibold">{naira(totalIncome)}</p>
              </div>
              <div>
                <p className="text-primary-100 text-xs">Total Expenses</p>
                <p className="font-semibold">{naira(totalExpenses)}</p>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <p className="text-primary-100 text-xs">Profit/Loss Balance:</p>
                <p className="font-bold">{naira(currentBalance)}</p>
              </div>
            </>
          )}
          {mode === "utilities" && (
            <>
              <div>
                <p className="text-primary-100 text-xs">Electricity</p>
                <p className="font-semibold">{naira(electricity)}</p>
              </div>
              <div>
                <p className="text-primary-100 text-xs">Internet + TV</p>
                <p className="font-semibold">{naira(internet + cableTV)}</p>
              </div>
              <div>
                <p className="text-primary-100 text-xs">Water</p>
                <p className="font-semibold">{naira(water)}</p>
              </div>
              <div>
                <p className="text-primary-100 text-xs">Waste</p>
                <p className="font-semibold">{naira(waste)}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
