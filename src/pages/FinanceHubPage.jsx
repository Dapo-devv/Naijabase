import { useState, useEffect, useRef } from "react"; // Added useRef
import {
  Briefcase,
  User,
  Coffee,
  Wifi,
  ShoppingBag,
  Users,
  Box,
  Truck,
  Home,
  Tv,
  Droplet,
  Trash,
  Banknote,
  Megaphone,
  TrendingUp,
  TrendingDown,
  Zap,
  Save,
  Calendar,
  Eye,
  Trash2,
  X,
} from "lucide-react";
import AdSlot from "../components/AdSlot";
import { useNaijaBase } from "../context/NaijaBaseContext";
import { todayISO, formatDate, naira } from "../utils/constants";

export default function FinanceHubPage() {
  const { currentUser, updateUserData } = useNaijaBase();
  const g = currentUser?.data?.generator;
  if (!g) return null;

  // --- Mode State ---
  const [mode, setMode] = useState("daily");
  const [saved, setSaved] = useState(false);
  const [viewingLog, setViewingLog] = useState(null);

  // 🚀 REF TO PREVENT RE-FILLING INPUTS AFTER SAVE
  const justSavedRef = useRef(false);

  // --- Helper to parse inputs safely ---
  const parseNum = (val) => parseFloat(val) || 0;

  // --- Local Draft States (For Inputs) ---
  const [dailyForm, setDailyForm] = useState({
    transport: "",
    food: "",
    data: "",
    misc: "",
  });
  const [bizForm, setBizForm] = useState({
    revenue: "",
    materials: "",
    logistics: "",
    staff: "",
    rent: "",
    marketing: "",
  });
  const [utilForm, setUtilForm] = useState({
    electricity: "",
    cableTV: "",
    internet: "",
    water: "",
    waste: "",
  });

  // --- Logic to load today's data into the Inputs (Blocked by justSavedRef) ---
  useEffect(() => {
    if (justSavedRef.current) return; // 🚀 STOP refilling if we just saved

    const today = todayISO();

    const todayDailyLog = g.financeLogs?.find(
      (l) => l.date === today && l.category === "Daily Life",
    );
    if (todayDailyLog) {
      setDailyForm({
        transport: todayDailyLog.data?.transport || "",
        food: todayDailyLog.data?.food || "",
        data: todayDailyLog.data?.data || "",
        misc: todayDailyLog.data?.misc || "",
      });
    } else {
      setDailyForm({ transport: "", food: "", data: "", misc: "" });
    }

    const todayBizLog = g.financeLogs?.find(
      (l) => l.date === today && l.category === "Business",
    );
    if (todayBizLog) {
      setBizForm({
        revenue: todayBizLog.data?.revenue || "",
        materials: todayBizLog.data?.materials || "",
        logistics: todayBizLog.data?.logistics || "",
        staff: todayBizLog.data?.staff || "",
        rent: todayBizLog.data?.rent || "",
        marketing: todayBizLog.data?.marketing || "",
      });
    } else {
      setBizForm({
        revenue: "",
        materials: "",
        logistics: "",
        staff: "",
        rent: "",
        marketing: "",
      });
    }

    const todayUtilLog = g.financeLogs?.find(
      (l) => l.date === today && l.category === "Utilities",
    );
    if (todayUtilLog) {
      setUtilForm({
        electricity: todayUtilLog.data?.electricity || "",
        cableTV: todayUtilLog.data?.cableTV || "",
        internet: todayUtilLog.data?.internet || "",
        water: todayUtilLog.data?.water || "",
        waste: todayUtilLog.data?.waste || "",
      });
    } else {
      setUtilForm({
        electricity: "",
        cableTV: "",
        internet: "",
        water: "",
        waste: "",
      });
    }
  }, [g]);

  // --- CARD DISPLAY TOTALS (Reads from saved data, not the inputs) ---
  const today = todayISO();
  const todayDailyLog = g.financeLogs?.find(
    (l) => l.date === today && l.category === "Daily Life",
  );
  const dailyCardTotal = todayDailyLog ? todayDailyLog.total : 0;

  const todayBizLog = g.financeLogs?.find(
    (l) => l.date === today && l.category === "Business",
  );
  const bizCardTotal = todayBizLog ? todayBizLog.total : 0;

  const todayUtilLog = g.financeLogs?.find(
    (l) => l.date === today && l.category === "Utilities",
  );
  const utilCardTotal = todayUtilLog ? todayUtilLog.total : 0;

  // --- INPUT CALCULATIONS (Used for the Breakdown text on the bottom of the card) ---
  const dailyTransport = parseNum(dailyForm.transport);
  const dailyFood = parseNum(dailyForm.food);
  const dailyData = parseNum(dailyForm.data);
  const dailyMisc = parseNum(dailyForm.misc);
  const dailyInputTotal = dailyTransport + dailyFood + dailyData + dailyMisc;

  const bizRevenue = parseNum(bizForm.revenue);
  const bizMaterials = parseNum(bizForm.materials);
  const bizLogistics = parseNum(bizForm.logistics);
  const bizStaff = parseNum(bizForm.staff);
  const bizRent = parseNum(bizForm.rent);
  const bizMarketing = parseNum(bizForm.marketing);
  const cogs = bizMaterials + bizLogistics;
  const opex = bizStaff + bizRent + bizMarketing;
  const grossProfit = bizRevenue - cogs;
  const netProfit = bizRevenue - cogs - opex;
  const grossMargin = bizRevenue > 0 ? (grossProfit / bizRevenue) * 100 : 0;
  const netMargin = bizRevenue > 0 ? (netProfit / bizRevenue) * 100 : 0;

  const utilElectricity = parseNum(utilForm.electricity);
  const utilCableTV = parseNum(utilForm.cableTV);
  const utilInternet = parseNum(utilForm.internet);
  const utilWater = parseNum(utilForm.water);
  const utilWaste = parseNum(utilForm.waste);
  const utilInputTotal =
    utilElectricity + utilCableTV + utilInternet + utilWater + utilWaste;

  // --- SAVE FUNCTIONS (Append to History & CLEAR INPUTS) ---
  const handleSaveDaily = () => {
    const newLog = {
      id: Date.now(),
      date: todayISO(),
      category: "Daily Life",
      total: dailyInputTotal,
      data: {
        transport: dailyForm.transport,
        food: dailyForm.food,
        data: dailyForm.data,
        misc: dailyForm.misc,
      },
    };
    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        dailyTransport: dailyTransport,
        dailyFood: dailyFood,
        dailyData: dailyData,
        dailyMisc: dailyMisc,
        financeLogs: [...(d.generator.financeLogs || []), newLog],
      },
    }));

    justSavedRef.current = true; // 🚀 Block the useEffect from refilling
    setSaved(true);
    setDailyForm({ transport: "", food: "", data: "", misc: "" });
    setTimeout(() => {
      justSavedRef.current = false;
      setSaved(false);
    }, 2500);
  };

  const handleSaveBusiness = () => {
    const newLog = {
      id: Date.now(),
      date: todayISO(),
      category: "Business",
      total: netProfit,
      data: {
        revenue: bizForm.revenue,
        materials: bizForm.materials,
        logistics: bizForm.logistics,
        staff: bizForm.staff,
        rent: bizForm.rent,
        marketing: bizForm.marketing,
      },
    };
    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        bizRevenue: bizRevenue,
        bizMaterials: bizMaterials,
        bizLogistics: bizLogistics,
        bizStaff: bizStaff,
        bizRent: bizRent,
        bizMarketing: bizMarketing,
        financeLogs: [...(d.generator.financeLogs || []), newLog],
      },
    }));

    justSavedRef.current = true; // 🚀 Block the useEffect from refilling
    setSaved(true);
    setBizForm({
      revenue: "",
      materials: "",
      logistics: "",
      staff: "",
      rent: "",
      marketing: "",
    });
    setTimeout(() => {
      justSavedRef.current = false;
      setSaved(false);
    }, 2500);
  };

  const handleSaveUtilities = () => {
    const newLog = {
      id: Date.now(),
      date: todayISO(),
      category: "Utilities",
      total: utilInputTotal,
      data: {
        electricity: utilForm.electricity,
        cableTV: utilForm.cableTV,
        internet: utilForm.internet,
        water: utilForm.water,
        waste: utilForm.waste,
      },
    };
    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        utilities: {
          electricity: utilElectricity,
          cableTV: utilCableTV,
          internet: utilInternet,
          water: utilWater,
          waste: utilWaste,
        },
        financeLogs: [...(d.generator.financeLogs || []), newLog],
      },
    }));

    justSavedRef.current = true; // 🚀 Block the useEffect from refilling
    setSaved(true);
    setUtilForm({
      electricity: "",
      cableTV: "",
      internet: "",
      water: "",
      waste: "",
    });
    setTimeout(() => {
      justSavedRef.current = false;
      setSaved(false);
    }, 2500);
  };

  // --- DELETE LOG FUNCTION ---
  const handleDeleteLog = (id) => {
    if (!window.confirm("Delete this finance log?")) return;
    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        financeLogs: (d.generator.financeLogs || []).filter((l) => l.id !== id),
      },
    }));
    setViewingLog(null);
  };

  // --- Sort logs ---
  const financeLogs = g.financeLogs || [];
  const sortedLogs = [...financeLogs].sort((a, b) =>
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
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${mode === "daily" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
        >
          <User className="w-4 h-4" /> Daily Life
        </button>
        <button
          onClick={() => setMode("business")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${mode === "business" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Briefcase className="w-4 h-4" /> Business
        </button>
        <button
          onClick={() => setMode("utilities")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${mode === "utilities" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Home className="w-4 h-4" /> Utilities
        </button>
      </div>

      {/* --- Input Forms by Mode --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        {mode === "daily" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Truck className="w-3 h-3" /> Transport Fare
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={dailyForm.transport}
                  onChange={(e) =>
                    setDailyForm({ ...dailyForm, transport: e.target.value })
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
                  value={dailyForm.food}
                  onChange={(e) =>
                    setDailyForm({ ...dailyForm, food: e.target.value })
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
                  value={dailyForm.data}
                  onChange={(e) =>
                    setDailyForm({ ...dailyForm, data: e.target.value })
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
                  value={dailyForm.misc}
                  onChange={(e) =>
                    setDailyForm({ ...dailyForm, misc: e.target.value })
                  }
                  className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                  placeholder="Snacks, subscriptions"
                />
              </div>
            </div>
            <button
              onClick={handleSaveDaily}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
            >
              <Save className="w-5 h-5" /> Save Daily Expenses
            </button>
          </div>
        )}

        {mode === "business" && (
          <div className="space-y-4">
            <div className="bg-primary-50/50 rounded-xl p-4 border border-primary-100">
              <p className="text-xs font-bold text-primary-700 uppercase tracking-wide mb-3 flex items-center gap-1">
                <Banknote className="w-3 h-3" /> Revenue & Cost of Goods
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Daily Sales / Revenue
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={bizForm.revenue}
                    onChange={(e) =>
                      setBizForm({ ...bizForm, revenue: e.target.value })
                    }
                    className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                    placeholder="Total daily sales"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Box className="w-3 h-3" /> Raw Materials / Stock Cost
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={bizForm.materials}
                    onChange={(e) =>
                      setBizForm({ ...bizForm, materials: e.target.value })
                    }
                    className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                    placeholder="Daily materials cost"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Logistics / Delivery
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={bizForm.logistics}
                    onChange={(e) =>
                      setBizForm({ ...bizForm, logistics: e.target.value })
                    }
                    className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                    placeholder="Delivery, pickup, or transport costs"
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> Operating Expenses (OPEX)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Users className="w-3 h-3" /> Staff Wages
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={bizForm.staff}
                    onChange={(e) =>
                      setBizForm({ ...bizForm, staff: e.target.value })
                    }
                    className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                    placeholder="Daily staff wages"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Home className="w-3 h-3" /> Rent / Overhead
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={bizForm.rent}
                    onChange={(e) =>
                      setBizForm({ ...bizForm, rent: e.target.value })
                    }
                    className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                    placeholder="Daily rent / overhead"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Megaphone className="w-3 h-3" /> Marketing / Ads
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={bizForm.marketing}
                    onChange={(e) =>
                      setBizForm({ ...bizForm, marketing: e.target.value })
                    }
                    className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                    placeholder="Daily ads / promotions"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleSaveBusiness}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
            >
              <Save className="w-5 h-5" /> Save Business Financials
            </button>
          </div>
        )}

        {mode === "utilities" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Prepaid Electricity (Monthly)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={utilForm.electricity}
                  onChange={(e) =>
                    setUtilForm({ ...utilForm, electricity: e.target.value })
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
                  value={utilForm.cableTV}
                  onChange={(e) =>
                    setUtilForm({ ...utilForm, cableTV: e.target.value })
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
                  value={utilForm.internet}
                  onChange={(e) =>
                    setUtilForm({ ...utilForm, internet: e.target.value })
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
                  value={utilForm.water}
                  onChange={(e) =>
                    setUtilForm({ ...utilForm, water: e.target.value })
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
                  value={utilForm.waste}
                  onChange={(e) =>
                    setUtilForm({ ...utilForm, waste: e.target.value })
                  }
                  className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                  placeholder="Monthly waste fee"
                />
              </div>
            </div>
            <button
              onClick={handleSaveUtilities}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
            >
              <Save className="w-5 h-5" /> Save Household Utilities
            </button>
          </div>
        )}
      </div>

      <AdSlot width={300} height={250} />

      {/* --- Dynamic Results Display (GREEN CARD) --- */}
      <div className="bg-gradient-to-br from-primary to-primary-700 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-sm font-medium text-primary-100 uppercase tracking-wide">
          {mode === "daily" && "Total Daily Living Cost"}
          {mode === "business" && "Daily Business Financial Health"}
          {mode === "utilities" && "Total Monthly Utilities Cost"}
        </p>
        <p className="text-4xl font-extrabold mt-1">
          {mode === "daily" && naira(dailyCardTotal)}
          {mode === "business" &&
            (netProfit >= 0 ? `+${naira(bizCardTotal)}` : naira(bizCardTotal))}
          {mode === "utilities" && naira(utilCardTotal)}
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
              <div className="col-span-2 border-b border-white/20 pb-2 mb-2 sm:border-b-0 sm:border-r sm:pb-0 sm:mb-0">
                <div className="flex justify-between items-center">
                  <p className="text-primary-100 text-xs">Revenue</p>
                  <p className="font-semibold">{naira(bizRevenue)}</p>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-primary-100 text-xs">Gross Profit</p>
                  <p className="font-semibold">{naira(grossProfit)}</p>
                </div>
              </div>
              <div className="col-span-2">
                <div className="flex justify-between items-center">
                  <p className="text-primary-100 text-xs">Gross Margin</p>
                  <p className="font-bold">{grossMargin.toFixed(0)}%</p>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center gap-1">
                    <p className="text-primary-100 text-xs">Net Margin</p>
                    {netProfit > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-300" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-300" />
                    )}
                  </div>
                  <p className="font-bold">{netMargin.toFixed(0)}%</p>
                </div>
              </div>
            </>
          )}
          {mode === "utilities" && (
            <>
              <div>
                <p className="text-primary-100 text-xs">Electricity</p>
                <p className="font-semibold">{naira(utilElectricity)}</p>
              </div>
              <div>
                <p className="text-primary-100 text-xs">Internet + TV</p>
                <p className="font-semibold">
                  {naira(utilInternet + utilCableTV)}
                </p>
              </div>
              <div>
                <p className="text-primary-100 text-xs">Water</p>
                <p className="font-semibold">{naira(utilWater)}</p>
              </div>
              <div>
                <p className="text-primary-100 text-xs">Waste</p>
                <p className="font-semibold">{naira(utilWaste)}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- Finance History Logs List --- */}
      <div>
        <h2 className="text-lg font-bold text-neutral-text flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" /> Finance Log History
        </h2>
        {sortedLogs.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 border border-dashed">
            <p className="text-sm">
              No finance logs yet. Save your first Daily, Business, or Utility
              expense above!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedLogs.map((log) => {
              return (
                <div
                  key={log.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          log.category === "Daily Life"
                            ? "bg-blue-100 text-blue-700"
                            : log.category === "Business"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {log.category}
                      </span>
                    </div>
                    <p className="font-semibold text-neutral-text">
                      {formatDate(log.date)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total: {naira(log.total)}
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
                      onClick={() => handleDeleteLog(log.id)}
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

      {/* --- View Modal --- */}
      {viewingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-neutral-text">
                {viewingLog.category} Details
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
                <span className="text-sm text-primary-600">Total</span>
                <span className="font-bold text-primary text-lg">
                  {naira(viewingLog.total)}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Breakdown
                </p>
                <div className="space-y-1.5">
                  {Object.entries(viewingLog.data || {}).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0"
                    >
                      <span className="text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="font-medium text-gray-900">
                        {naira(parseFloat(value))}
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
