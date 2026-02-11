import { AGREEMENT_TABS } from "./constants";

export default function AgreementTabsNav({ activeTab, onChange }) {
  return (
    <div className="flex gap-2 mb-4 border-b border-gray-200 overflow-x-auto">
      {AGREEMENT_TABS.map((tab, index) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(index)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
            activeTab === index
              ? "text-emerald-700 border-emerald-500"
              : "text-gray-500 border-transparent hover:text-gray-700"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

