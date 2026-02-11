export default function Select({
  label,
  error,
  options = [],
  placeholder = "Select...",
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        className={`w-full border rounded-lg outline-none transition-colors px-3 py-2 text-sm bg-white ${
          error
            ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        }`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
