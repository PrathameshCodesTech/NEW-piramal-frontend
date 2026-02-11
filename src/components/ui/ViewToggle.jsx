import { LayoutGrid, List } from "lucide-react";

export default function ViewToggle({ value = "grid", onChange, className = "" }) {
  return (
    <div className={`flex gap-1 ${className}`}>
      <button
        type="button"
        onClick={() => onChange?.("grid")}
        className={`p-2 rounded-lg transition-colors cursor-pointer ${
          value === "grid"
            ? "bg-emerald-100 text-emerald-700"
            : "text-gray-500 hover:bg-gray-100"
        }`}
        title="Grid view"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange?.("list")}
        className={`p-2 rounded-lg transition-colors cursor-pointer ${
          value === "list"
            ? "bg-emerald-100 text-emerald-700"
            : "text-gray-500 hover:bg-gray-100"
        }`}
        title="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
