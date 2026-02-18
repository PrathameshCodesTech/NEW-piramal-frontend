export default function ChartLegend({ items }) {
  return (
    <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-6 flex-wrap">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
