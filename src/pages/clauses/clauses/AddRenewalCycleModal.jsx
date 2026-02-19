import { useState } from "react";
import { X } from "lucide-react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

const RENT_FORMULA_OPTIONS = [
  { value: "Market rate + 5% of current rent", label: "Market rate + 5% of current rent" },
  { value: "Fixed increase of 10% over current rent", label: "Fixed increase of 10% over current rent" },
  { value: "Market rate", label: "Market rate" },
  { value: "Negotiated", label: "Negotiated" },
  { value: "CPI-linked", label: "CPI-linked" },
];

export default function AddRenewalCycleModal({ onClose, onAdd, cycleNumber }) {
  const [formData, setFormData] = useState({
    cycle: cycleNumber,
    termYears: "5",
    termMonths: "0",
    rentFormula: "Market rate",
    comments: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const years = Math.max(0, Number(formData.termYears || 0));
    const months = Math.min(11, Math.max(0, Number(formData.termMonths || 0)));
    const term = `${years} year${years === 1 ? "" : "s"}${months > 0 ? ` ${months} month${months === 1 ? "" : "s"}` : ""}`;
    const rentFormula = formData.rentFormula || "";
    onAdd({
      cycle: cycleNumber,
      termYears: years,
      termMonths: months,
      term_years: years,
      term_months: months,
      term,
      rentFormula,
      rent_formula: rentFormula,
      comments: formData.comments || "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Add Renewal Cycle</h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cycle</label>
            <input
              type="text"
              value={`Cycle ${cycleNumber}`}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
            <p className="text-xs text-gray-500 mb-2">Specify the duration of the renewal cycle.</p>
            <div className="flex gap-2">
              <Input
                type="number"
                value={formData.termYears}
                onChange={(e) => setFormData((p) => ({ ...p, termYears: e.target.value }))}
                placeholder="Years"
                min={0}
              />
              <Input
                type="number"
                value={formData.termMonths}
                onChange={(e) => setFormData((p) => ({ ...p, termMonths: e.target.value }))}
                placeholder="Months"
                min={0}
                max={11}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rent Formula</label>
            <select
              value={formData.rentFormula}
              onChange={(e) => setFormData((p) => ({ ...p, rentFormula: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {RENT_FORMULA_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData((p) => ({ ...p, comments: e.target.value }))}
              rows={3}
              placeholder="Standard renewal terms apply."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add Cycle</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
