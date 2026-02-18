import Modal from "../ui/Modal";

const cn = (...a) => a.filter(Boolean).join(" ");

export default function ViewAllModal({ open, onClose, title, rows = [], cols = [] }) {
  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={`${rows.length} items`} maxWidth="xl" bodyMaxHeight="70vh">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {cols.map((col, idx) => (
                <th key={col} className={cn("py-3 px-2 text-xs font-semibold text-gray-500 uppercase", idx === 0 ? "text-left" : "text-right")}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {cols.map((col, colIdx) => (
                  <td key={col} className={cn("py-3 px-2", colIdx === 0 ? "text-left font-medium text-gray-800" : "text-right text-gray-600")}>
                    {row?.[col] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
