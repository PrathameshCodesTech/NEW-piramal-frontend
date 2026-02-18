import { X } from "lucide-react";

const cn = (...a) => a.filter(Boolean).join(" ");

export default function Modal({ open, onClose, title, subtitle, children, maxWidth = "lg", bodyMaxHeight, greenHeader = false }) {
  if (!open) return null;
  const maxW = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl", "2xl": "max-w-2xl", "3xl": "max-w-3xl" }[maxWidth] || "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={cn("relative bg-white rounded-xl shadow-xl border border-gray-200 w-full", maxW)}>
        {greenHeader ? (
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-4 rounded-t-xl">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {subtitle && <p className="text-sm text-emerald-100 mt-0.5">{subtitle}</p>}
            <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className={cn("px-5 py-4", bodyMaxHeight && "overflow-y-auto")} style={bodyMaxHeight ? { maxHeight: bodyMaxHeight } : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
}
