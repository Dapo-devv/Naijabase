import { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { COMMON_MARKET_ITEMS } from '../utils/constants';

export default function MarketItemList({ items, prices, onPriceChange, onAddItem, onRemoveItem }) {
  const [showAdd, setShowAdd] = useState(false);
  const [custom, setCustom] = useState('');

  const handleAdd = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddItem(trimmed);
    setCustom('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Today's Prices</h3>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {showAdd && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 animate-fade-in">
          <p className="text-xs font-medium text-gray-500 mb-2">Common items</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_MARKET_ITEMS.filter((c) => !items.includes(c)).map((c) => (
              <button
                key={c}
                onClick={() => handleAdd(c)}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-full hover:border-primary hover:text-primary transition-colors"
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
              onKeyDown={(e) => e.key === 'Enter' && handleAdd(custom)}
              placeholder="Add custom item..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <button
              onClick={() => handleAdd(custom)}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No items yet. Add one to start logging.</p>
        )}
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl p-2.5">
            <span className="flex-1 text-sm font-medium text-gray-700">{item}</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₦</span>
              <input
                type="number"
                inputMode="numeric"
                value={prices[item] ?? ''}
                onChange={(e) => onPriceChange(item, e.target.value)}
                placeholder="0"
                className="w-32 pl-7 pr-2 py-2 text-sm text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <button
              onClick={() => onRemoveItem(item)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
