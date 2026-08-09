import { useState } from "react";
import {
  MapPin,
  Save,
  Route,
  Plus,
  Trash2,
  Calendar,
  Pencil,
  Eye,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdSlot from "../components/AdSlot";
import TripStateSelector from "../components/TripStateSelector";
import { useNaijaBase } from "../context/NaijaBaseContext";
import { todayISO, formatDate, naira } from "../utils/constants";
import LoadingSpinner from "../components/LoadingSpinner";

export default function TripPage() {
  const { currentUser, updateUserData } = useNaijaBase();
  const data = currentUser?.data;

  const [editingTripId, setEditingTripId] = useState(null);
  const [viewingTrip, setViewingTrip] = useState(null);
  const [originCountry, setOriginCountry] = useState("Nigeria");
  const [originRegion, setOriginRegion] = useState("");
  const [destCountry, setDestCountry] = useState("Nigeria");
  const [destRegion, setDestRegion] = useState("");
  const [tripDate, setTripDate] = useState(todayISO());

  const [budgetItems, setBudgetItems] = useState([
    { id: 1, name: "Transport (Local)", amount: 0 },
    { id: 2, name: "Accommodation", amount: 0 },
    { id: 3, name: "Food & Drinks", amount: 0 },
    { id: 4, name: "Activities & Tours", amount: 0 },
    { id: 5, name: "Emergency Funds", amount: 0 },
  ]);
  const [customName, setCustomName] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!data) return null;

  const originLabel = originRegion || originCountry;
  const destLabel = destRegion || destCountry;
  const canSave = originRegion && destRegion && tripDate;

  const totalBudget = budgetItems.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0,
  );

  const handleAmountChange = (id, value) => {
    setBudgetItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, amount: parseFloat(value) || 0 } : item,
      ),
    );
  };

  const handleRemoveItem = (id) => {
    if (budgetItems.length <= 1) return;
    setBudgetItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddCustomItem = () => {
    const trimmed = customName.trim();
    if (!trimmed) return;
    const newItem = { id: Date.now(), name: trimmed, amount: 0 };
    setBudgetItems((prev) => [...prev, newItem]);
    setCustomName("");
  };

  const handleEditTrip = (id) => {
    const trip = data.trips.find((t) => t.id === id);
    if (!trip) return;

    setEditingTripId(id);
    setOriginCountry(trip.originCountry || "Nigeria");
    setOriginRegion(trip.originRegion || "");
    setDestCountry(trip.destCountry || "Nigeria");
    setDestRegion(trip.destRegion || "");
    setTripDate(trip.date || todayISO());
    setBudgetItems(trip.budgetItems || []);
    setSaved(false);
    setViewingTrip(null);
  };

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const tripData = {
      id: editingTripId || Date.now(),
      origin: originLabel,
      originCountry,
      originRegion,
      destination: destLabel,
      destCountry,
      destRegion,
      date: tripDate,
      totalBudget: totalBudget,
      budgetItems: budgetItems,
    };

    updateUserData((d) => {
      let nextTrips;
      if (editingTripId) {
        nextTrips = d.trips.map((t) => (t.id === editingTripId ? tripData : t));
      } else {
        nextTrips = [...d.trips, tripData];
      }
      return { ...d, trips: nextTrips };
    });

    setIsSaving(false);
    setSaved(true);
    setEditingTripId(null);

    setOriginCountry("Nigeria");
    setOriginRegion("");
    setDestCountry("Nigeria");
    setDestRegion("");
    setTripDate(todayISO());
    setBudgetItems([
      { id: 1, name: "Transport (Local)", amount: 0 },
      { id: 2, name: "Accommodation", amount: 0 },
      { id: 3, name: "Food & Drinks", amount: 0 },
      { id: 4, name: "Activities & Tours", amount: 0 },
      { id: 5, name: "Emergency Funds", amount: 0 },
    ]);
    setCustomName("");
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDeleteTrip = (id) => {
    if (!window.confirm(`Delete this trip budget?`)) return;
    updateUserData((d) => ({
      ...d,
      trips: d.trips.filter((t) => t.id !== id),
    }));
    setViewingTrip(null);
    if (editingTripId === id) setEditingTripId(null);
  };

  const sortedTrips = [...data.trips]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto px-4 py-6 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-text dark:text-white flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary dark:text-primary-400" /> Trip
          Budget Planner
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Plan and budget your upcoming trips by expense category.
        </p>
      </div>

      {editingTripId && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/30 px-3 py-2 rounded-lg border border-secondary-200 dark:border-secondary-800"
        >
          <Pencil className="w-4 h-4" /> Editing trip budget for{" "}
          <strong>
            {originLabel} → {destLabel}
          </strong>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Departure
            </p>
            <TripStateSelector
              country={originCountry}
              setCountry={setOriginCountry}
              region={originRegion}
              setRegion={setOriginRegion}
              label="From"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Destination
            </p>
            <TripStateSelector
              country={destCountry}
              setCountry={setDestCountry}
              region={destRegion}
              setRegion={setDestRegion}
              label="To"
            />
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Trip Date
          </label>
          <div className="relative w-full max-w-full sm:max-w-[200px]">
            <div className="flex items-center w-full px-4 py-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-colors cursor-pointer group">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                className="w-full bg-transparent border-none text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer text-base font-medium placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            Estimated Expenses
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
            {budgetItems.map((item) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2.5"
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
                      handleAmountChange(item.id, e.target.value)
                    }
                    placeholder="0"
                    className="w-32 pl-7 pr-2 py-2 text-sm text-right border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemoveItem(item.id)}
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
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCustomItem()}
              placeholder="Add custom expense..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddCustomItem}
              className="px-4 py-2 text-sm font-medium bg-primary text-white dark:text-white rounded-lg hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </motion.button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Total Estimated Budget
            </p>
            <p className="text-2xl font-extrabold text-primary dark:text-primary-400">
              {naira(totalBudget)}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={!canSave || isSaving}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-primary text-white dark:text-white font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <LoadingSpinner size={20} color="text-white" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isSaving
              ? "Saving..."
              : editingTripId
                ? "Update Trip Budget"
                : "Save Trip Budget"}
          </motion.button>
        </div>
        {saved && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-green-600 dark:text-green-400"
          >
            {editingTripId ? "Trip budget updated!" : "Trip budget saved!"}
          </motion.p>
        )}
      </motion.div>

      <AdSlot width={300} height={250} />

      <div>
        <h2 className="text-lg font-bold text-neutral-text dark:text-white flex items-center gap-2 mb-4">
          <Route className="w-5 h-5 text-primary dark:text-primary-400" />{" "}
          Recent Trip Budgets
        </h2>
        {sortedTrips.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 border border-dashed dark:border-gray-700">
            <p className="text-sm">No trips planned yet.</p>
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
            {sortedTrips.map((trip) => (
              <motion.div
                key={trip.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-semibold text-neutral-text dark:text-white">
                    {trip.origin} → {trip.destination}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(trip.date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-1">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Budget
                    </p>
                    <p className="text-lg font-bold text-primary dark:text-primary-400">
                      {naira(trip.totalBudget || 0)}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewingTrip(trip)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditTrip(trip.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* View Trip Budget Modal */}
      <AnimatePresence>
        {viewingTrip && (
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
                  Trip Budget Details
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setViewingTrip(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </motion.button>
              </div>
              <div className="p-5 space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Route
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {viewingTrip.origin} → {viewingTrip.destination}
                  </p>
                </div>
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Date
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {formatDate(viewingTrip.date)}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-primary-50 dark:bg-primary-900/30 rounded-xl p-3">
                  <span className="text-sm text-primary-600 dark:text-primary-400">
                    Total Budget
                  </span>
                  <span className="font-bold text-primary dark:text-primary-400 text-lg">
                    {naira(viewingTrip.totalBudget || 0)}
                  </span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Expense Breakdown
                  </p>
                  <div className="space-y-1.5">
                    {viewingTrip.budgetItems &&
                      viewingTrip.budgetItems.map((item) => (
                        <div
                          key={item.id}
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
                  onClick={() => setViewingTrip(null)}
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
