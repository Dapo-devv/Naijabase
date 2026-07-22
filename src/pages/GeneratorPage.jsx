import { useState } from "react";
import {
  Zap,
  Briefcase,
  User,
  Fuel,
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
} from "lucide-react";
import AdSlot from "../components/AdSlot";
import ApplianceToggle from "../components/ApplianceToggle";
import { useNaijaBase } from "../context/NaijaBaseContext";
import { naira } from "../utils/constants";

export default function GeneratorPage() {
  const { currentUser, updateUserData } = useNaijaBase();
  const g = currentUser?.data?.generator;
  if (!g) return null;

  // --- Mode State (Generator, Daily Life, Business, Utilities) ---
  const [mode, setMode] = useState("generator");

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

  const toggleAppliance = (key) => {
    updateUserData((d) => ({
      ...d,
      generator: {
        ...d.generator,
        appliances: {
          ...d.generator.appliances,
          [key]: !d.generator.appliances[key],
        },
      },
    }));
  };

  // --- Helper to parse inputs safely ---
  const parseNum = (val) => parseFloat(val) || 0;

  // --- MODE 1: FUEL GENERATOR (Original) ---
  const fuel = parseNum(g.fuelCostPerLiter);
  const baseRate = parseNum(g.consumptionRate);
  const applianceLoad =
    (g.appliances.ac ? 0.8 : 0) +
    (g.appliances.fridge ? 0.4 : 0) +
    (g.appliances.tv ? 0.2 : 0) +
    (g.appliances.lights ? 0.1 : 0);
  const totalGenConsumption = baseRate + applianceLoad;
  const genCost = totalGenConsumption * fuel;

  // --- MODE 2: DAILY LIFE ---
  const dailyTransport = parseNum(g.dailyTransport || 0);
  const dailyFood = parseNum(g.dailyFood || 0);
  const dailyData = parseNum(g.dailyData || 0);
  const dailyMisc = parseNum(g.dailyMisc || 0);
  const dailyTotal = dailyTransport + dailyFood + dailyData + dailyMisc;

  // --- MODE 3: BUSINESS ---
  const bizRent = parseNum(g.bizRent || 0);
  const bizStaff = parseNum(g.bizStaff || 0);
  const bizMaterials = parseNum(g.bizMaterials || 0);
  const bizLogistics = parseNum(g.bizLogistics || 0);
  const bizTotal = bizRent + bizStaff + bizMaterials + bizLogistics;

  // --- NEW MODE 4: UTILITIES & BILLS ---
  const util = g.utilities || {};
  const electricity = parseNum(util.electricity || 0);
  const cableTV = parseNum(util.cableTV || 0);
  const internet = parseNum(util.internet || 0);
  const water = parseNum(util.water || 0);
  const waste = parseNum(util.waste || 0);
  const utilitiesTotal = electricity + cableTV + internet + water + waste;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-text flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" /> Expense & Utility Hub
        </h1>
        <p className="text-sm text-gray-500">
          Track generator costs, daily living, business overhead, and household
          bills.
        </p>
      </div>

      {/* --- Mode Toggle Tabs --- */}
      <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setMode("generator")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${mode === "generator" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Fuel className="w-4 h-4" /> Generator
        </button>
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
        {/* NEW TAB: Utilities */}
        <button
          onClick={() => setMode("utilities")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${mode === "utilities" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Home className="w-4 h-4" /> Utilities
        </button>
      </div>

      {/* --- Input Forms by Mode --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        {/* MODE 1: GENERATOR */}
        {mode === "generator" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Fuel Cost per Liter (₦)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={g.fuelCostPerLiter}
                  onChange={(e) =>
                    setField(
                      "fuelCostPerLiter",
                      e.target.value === "" ? "" : parseFloat(e.target.value),
                    )
                  }
                  className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. 650"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Base Consumption (L/hr)
                </label>
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  value={g.consumptionRate}
                  onChange={(e) =>
                    setField(
                      "consumptionRate",
                      e.target.value === "" ? "" : parseFloat(e.target.value),
                    )
                  }
                  className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. 2.5"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Appliances
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    key: "ac",
                    label: "Air Conditioner",
                    icon: Zap,
                    load: "+0.8 L/hr",
                  },
                  {
                    key: "fridge",
                    label: "Refrigerator",
                    icon: Zap,
                    load: "+0.4 L/hr",
                  },
                  {
                    key: "tv",
                    label: "Television",
                    icon: Zap,
                    load: "+0.2 L/hr",
                  },
                  {
                    key: "lights",
                    label: "Lights",
                    icon: Zap,
                    load: "+0.1 L/hr",
                  },
                ].map((a) => (
                  <div key={a.key}>
                    <ApplianceToggle
                      label={a.label}
                      icon={a.icon}
                      on={g.appliances[a.key]}
                      onToggle={() => toggleAppliance(a.key)}
                    />
                    <p className="text-[10px] text-gray-400 mt-1 ml-1">
                      {a.load}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* MODE 2: DAILY LIFE */}
        {mode === "daily" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Truck className="w-3 h-3" /> Transport Fare
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

        {/* MODE 3: BUSINESS */}
        {mode === "business" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Users className="w-3 h-3" /> Staff Wages / Daily
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={g.bizStaff || ""}
                onChange={(e) =>
                  setField(
                    "bizStaff",
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                  )
                }
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                placeholder="Daily staff cost"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Box className="w-3 h-3" /> Raw Materials
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={g.bizMaterials || ""}
                onChange={(e) =>
                  setField(
                    "bizMaterials",
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                  )
                }
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                placeholder="Daily materials cost"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Truck className="w-3 h-3" /> Logistics / Transport
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={g.bizLogistics || ""}
                onChange={(e) =>
                  setField(
                    "bizLogistics",
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                  )
                }
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                placeholder="Delivery/Pickup costs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> Overhead / Rent
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={g.bizRent || ""}
                onChange={(e) =>
                  setField(
                    "bizRent",
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                  )
                }
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30"
                placeholder="Daily rent/overhead"
              />
            </div>
          </div>
        )}

        {/* 🚀 MODE 4: UTILITIES & BILLS */}
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
          {mode === "generator" && "Total Generator Cost per Hour"}
          {mode === "daily" && "Total Daily Living Cost"}
          {mode === "business" && "Total Daily Business Cost"}
          {mode === "utilities" && "Total Monthly Utilities Cost"}
        </p>
        <p className="text-4xl font-extrabold mt-1">
          {mode === "generator" && naira(genCost)}
          {mode === "daily" && naira(dailyTotal)}
          {mode === "business" && naira(bizTotal)}
          {mode === "utilities" && naira(utilitiesTotal)}
        </p>

        <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4 text-sm">
          {mode === "generator" && (
            <>
              <div>
                <p className="text-primary-100 text-xs">Total Consumption</p>
                <p className="font-semibold">
                  {totalGenConsumption.toFixed(1)} L/hr
                </p>
              </div>
              <div>
                <p className="text-primary-100 text-xs">Appliance Load</p>
                <p className="font-semibold">{applianceLoad.toFixed(1)} L/hr</p>
              </div>
            </>
          )}
          {mode === "daily" && (
            <>
              <div>
                <p className="text-primary-100 text-xs">Transport</p>
                <p className="font-semibold">{naira(dailyTransport)}</p>
              </div>
              <div>
                <p className="text-primary-100 text-xs">Food + Data + Misc</p>
                <p className="font-semibold">
                  {naira(dailyFood + dailyData + dailyMisc)}
                </p>
              </div>
            </>
          )}
          {mode === "business" && (
            <>
              <div>
                <p className="text-primary-100 text-xs">Staff + Overhead</p>
                <p className="font-semibold">{naira(bizStaff + bizRent)}</p>
              </div>
              <div>
                <p className="text-primary-100 text-xs">
                  Materials + Logistics
                </p>
                <p className="font-semibold">
                  {naira(bizMaterials + bizLogistics)}
                </p>
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
                <p className="text-primary-100 text-xs">
                  Internet + TV + Water + Waste
                </p>
                <p className="font-semibold">
                  {naira(internet + cableTV + water + waste)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
