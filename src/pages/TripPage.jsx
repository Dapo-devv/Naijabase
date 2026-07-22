import { useState } from 'react';
import { MapPin, Save, Route, Plus, Trash2, Calendar, Pencil, Eye, X } from 'lucide-react';
import AdSlot from '../components/AdSlot';
import TripStateSelector from '../components/TripStateSelector';
import { useNaijaBase } from '../context/NaijaBaseContext';
import { todayISO, formatDate, naira } from '../utils/constants';

export default function TripPage() {
  const { currentUser, updateUserData } = useNaijaBase();
  const data = currentUser?.data;

  // --- Form State ---
  const [editingTripId, setEditingTripId] = useState(null);
  const [viewingTrip, setViewingTrip] = useState(null); // NEW: For the View Modal
  const [originCountry, setOriginCountry] = useState('Nigeria');
  const [originRegion, setOriginRegion] = useState('');
  const [destCountry, setDestCountry] = useState('Nigeria');
  const [destRegion, setDestRegion] = useState('');
  const [tripDate, setTripDate] = useState(todayISO());
  
  // Budget State: array of expense objects
  const [budgetItems, setBudgetItems] = useState([
    { id: 1, name: 'Transport (Local)', amount: 0 },
    { id: 2, name: 'Accommodation', amount: 0 },
    { id: 3, name: 'Food & Drinks', amount: 0 },
    { id: 4, name: 'Activities & Tours', amount: 0 },
    { id: 5, name: 'Emergency Funds', amount: 0 },
  ]);
  const [customName, setCustomName] = useState('');
  const [saved, setSaved] = useState(false);

  if (!data) return null;

  const originLabel = originRegion || originCountry;
  const destLabel = destRegion || destCountry;
  const canSave = originRegion && destRegion && tripDate;

  const totalBudget = budgetItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleAmountChange = (id, value) => {
    setBudgetItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, amount: parseFloat(value) || 0 } : item
      )
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
    setCustomName('');
  };

  const handleEditTrip = (id) => {
    const trip = data.trips.find((t) => t.id === id);
    if (!trip) return;

    setEditingTripId(id);
    setOriginCountry(trip.originCountry || 'Nigeria');
    setOriginRegion(trip.originRegion || '');
    setDestCountry(trip.destCountry || 'Nigeria');
    setDestRegion(trip.destRegion || '');
    setTripDate(trip.date || todayISO());
    setBudgetItems(trip.budgetItems || []);
    setSaved(false);
    setViewingTrip(null);
  };

  const handleSave = () => {
    if (!canSave) return;
    
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
        nextTrips = d.trips.map((t) => t.id === editingTripId ? tripData : t);
      } else {
        nextTrips = [...d.trips, tripData];
      }
      return { ...d, trips: nextTrips };
    });

    setSaved(true);
    setEditingTripId(null);

    // --- CLEAR EVERYTHING FOR NEW INPUT ---
    setOriginCountry('Nigeria');
    setOriginRegion('');
    setDestCountry('Nigeria');
    setDestRegion('');
    setTripDate(todayISO());
    setBudgetItems([
      { id: 1, name: 'Transport (Local)', amount: 0 },
      { id: 2, name: 'Accommodation', amount: 0 },
      { id: 3, name: 'Food & Drinks', amount: 0 },
      { id: 4, name: 'Activities & Tours', amount: 0 },
      { id: 5, name: 'Emergency Funds', amount: 0 },
    ]);
    setCustomName('');
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

  const sortedTrips = [...data.trips].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-text flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" /> Trip Budget Planner
        </h1>
        <p className="text-sm text-gray-500">Plan and budget your upcoming trips by expense category.</p>
      </div>

      {editingTripId && (
        <div className="flex items-center gap-2 text-sm text-secondary-600 bg-secondary-50 px-3 py-2 rounded-lg border border-secondary-200">
          <Pencil className="w-4 h-4" /> Editing trip budget for <strong>{originLabel} → {destLabel}</strong>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Departure</p>
            <TripStateSelector
              country={originCountry}
              setCountry={setOriginCountry}
              region={originRegion}
              setRegion={setOriginRegion}
              label="From"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Destination</p>
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
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Trip Date
          </label>
          <input
            type="date"
            value={tripDate}
            onChange={(e) => setTripDate(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Estimated Expenses</h3>
          <div className="space-y-3">
            {budgetItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5">
                <span className="flex-1 text-sm font-medium text-gray-700">{item.name}</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₦</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={item.amount || ''}
                    onChange={(e) => handleAmountChange(item.id, e.target.value)}
                    placeholder="0"
                    className="w-32 pl-7 pr-2 py-2 text-sm text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomItem()}
              placeholder="Add custom expense..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <button
              onClick={handleAddCustomItem}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-2">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Estimated Budget</p>
            <p className="text-2xl font-extrabold text-primary">{naira(totalBudget)}</p>
          </div>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" /> {editingTripId ? 'Update Trip Budget' : 'Save Trip Budget'}
          </button>
        </div>
        {saved && (
          <p className="text-center text-sm text-green-600 animate-fade-in">
            {editingTripId ? 'Trip budget updated!' : 'Trip budget saved!'}
          </p>
        )}
      </div>

      <AdSlot width={300} height={250} />

      <div>
        <h2 className="text-lg font-bold text-neutral-text flex items-center gap-2 mb-4">
          <Route className="w-5 h-5 text-primary" /> Recent Trip Budgets
        </h2>
        {sortedTrips.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 border border-dashed">
            <p className="text-sm">No trips planned yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-semibold text-neutral-text">{trip.origin} → {trip.destination}</p>
                  <p className="text-xs text-gray-500">{formatDate(trip.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-1">
                    <p className="text-xs text-gray-400">Budget</p>
                    <p className="text-lg font-bold text-primary">{naira(trip.totalBudget || 0)}</p>
                  </div>
                  {/* View Button */}
                  <button
                    onClick={() => setViewingTrip(trip)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button
                    onClick={() => handleEditTrip(trip.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Trip Budget Modal */}
      {viewingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-neutral-text">Trip Budget Details</h3>
              <button onClick={() => setViewingTrip(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Route</p>
                <p className="font-semibold">{viewingTrip.origin} → {viewingTrip.destination}</p>
              </div>
              <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3">
                <span className="text-sm text-gray-500">Date</span>
                <span className="font-semibold">{formatDate(viewingTrip.date)}</span>
              </div>
              <div className="flex justify-between items-center bg-primary-50 rounded-xl p-3">
                <span className="text-sm text-primary-600">Total Budget</span>
                <span className="font-bold text-primary text-lg">{naira(viewingTrip.totalBudget || 0)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Expense Breakdown</p>
                <div className="space-y-1.5">
                  {viewingTrip.budgetItems && viewingTrip.budgetItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-medium text-gray-900">{naira(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
              <button onClick={() => setViewingTrip(null)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}