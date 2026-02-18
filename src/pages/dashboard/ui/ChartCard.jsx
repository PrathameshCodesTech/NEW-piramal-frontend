import Card from "./Card";

const cn = (...a) => a.filter(Boolean).join(" ");

export default function ChartCard({ title, subtitle, children, chartType, onChartTypeChange, rightContent, contentClassName }) {
  return (
    <Card className="p-5 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {rightContent}
          {chartType && onChartTypeChange && (
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              {["pie", "bar", "area"].map((t) => (
                <button
                  key={t}
                  onClick={() => onChartTypeChange(t)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize",
                    chartType === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={cn(contentClassName)}>{children}</div>
    </Card>
  );
}
