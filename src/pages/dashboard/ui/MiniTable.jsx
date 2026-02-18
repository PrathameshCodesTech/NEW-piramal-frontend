import { ArrowRight } from "lucide-react";
import Card from "./Card";

const cn = (...a) => a.filter(Boolean).join(" ");

export default function MiniTable({ title, cols, rows, onRowClick, onViewAll, highlightColumn }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {onViewAll && rows.length > 0 && (
          <button onClick={onViewAll} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-gray-500">No data available</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {cols.map((col, i) => (
                  <th key={col} className={cn("px-4 py-2 text-xs font-semibold text-gray-500 uppercase", i === 0 ? "text-left" : "text-right")}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.slice(0, 5).map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && "cursor-pointer hover:bg-gray-50")}
                >
                  {cols.map((col, colIdx) => (
                    <td
                      key={col}
                      className={cn(
                        "px-4 py-2.5",
                        colIdx === 0 ? "text-left font-medium text-gray-800" : "text-right text-gray-600",
                        highlightColumn === col && "font-semibold text-amber-600"
                      )}
                    >
                      {row?.[col] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
