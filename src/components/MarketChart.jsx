import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0A8C4A', '#F4A261', '#2563EB', '#DC2626', '#7C3AED', '#0891B2', '#EA580C', '#65A30D'];

export default function MarketChart({ logs, items }) {
  if (!logs || logs.length < 2) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 border border-dashed">
        <p className="text-sm">Add more data to see trends</p>
        <p className="text-xs mt-1">Log prices on at least 2 different days</p>
      </div>
    );
  }

  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const chartData = sorted.map((log) => {
    const row = { date: log.date };
    items.forEach((item) => {
      row[item] = log.prices?.[item] ?? null;
    });
    return row;
  });

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Price Trends</h3>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => '₦' + (v >= 1000 ? (v / 1000) + 'k' : v)} />
            <Tooltip
              formatter={(value) => (value == null ? '—' : '₦' + Number(value).toLocaleString())}
              contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {items.map((item, i) => (
              <Line
                key={item}
                type="monotone"
                dataKey={item}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
