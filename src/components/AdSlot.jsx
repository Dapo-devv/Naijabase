export default function AdSlot({ width, height, label = 'Ad Space', className = '' }) {
  const w = width ? `${width}px` : '100%';
  const h = height ? `${height}px` : 'auto';
  return (
    <div
      className={`mx-auto flex items-center justify-center border-2 border-dashed border-gray-300 p-4 text-center text-gray-500 bg-gray-50/60 rounded-lg ${className}`}
      style={{ width: w, height: h, maxWidth: '100%' }}
      aria-label="Advertisement slot"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-[10px] text-gray-400 mt-1">
          {width}×{height}
        </p>
      </div>
    </div>
  );
}
