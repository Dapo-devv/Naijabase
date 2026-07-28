import { useState } from "react";
import { X, Plus } from "lucide-react";
import { COMMON_MARKET_ITEMS } from "../utils/constants";

export default function MarketItemList({
  items,
  prices,
  onPriceChange,
  onAddItem,
  onRemoveItem,
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [custom, setCustom] = useState("");

  const handleAdd = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddItem(trimmed);
    setCustom("");
    setShowAdd(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Today's Expenses
        </h3>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="flex items-center gap-1 text-sm font-medium text-primary dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {showAdd && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600 animate-fade-in">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Common items
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_MARKET_ITEMS.filter((c) => !items.includes(c)).map((c) => (
              <button
                key={c}
                onClick={() => handleAdd(c)}
                className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full hover:border-primary dark:hover:border-primary-400 hover:text-primary dark:hover:text-primary-400 transition-colors"
              >
                + {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd(custom)}
              placeholder="Add custom item..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
            <button
              onClick={() => handleAdd(custom)}
              className="px-4 py-2 text-sm font-medium bg-primary text-white dark:text-white rounded-lg hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
            No items yet. Add one to start logging.
          </p>
        )}
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-2.5"
          >
            <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {item}
            </span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">
                ₦
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={prices[item] ?? ""}
                onChange={(e) => onPriceChange(item, e.target.value)}
                placeholder="0"
                className="w-32 pl-7 pr-2 py-2 text-sm text-right border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            <button
              onClick={() => onRemoveItem(item)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              aria-label={`Remove ${item}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
