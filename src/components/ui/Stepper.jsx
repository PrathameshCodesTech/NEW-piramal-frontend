import { Check } from "lucide-react";

export default function Stepper({ steps, activeStep, onStepClick }) {
  return (
    <div className="flex items-start mb-8">
      {steps.map((step, i) => {
        const isActive = i === activeStep;
        const isPast = i < activeStep;
        const Icon = step.icon;

        return (
          <div key={i} className="flex items-center flex-1 min-w-0 last:flex-none last:flex-initial">
            <button
              onClick={() => onStepClick?.(i)}
              className="flex flex-col items-center text-center group cursor-pointer shrink-0"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                    : isPast
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                }`}
              >
                {isPast ? <Check className="w-5 h-5" /> : i + 1}
              </div>
              <span
                className={`mt-2 text-sm font-medium block ${
                  isActive ? "text-emerald-700" : isPast ? "text-emerald-600" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
              {step.subtitle && (
                <span className="text-xs text-gray-400 mt-0.5 block max-w-[120px]">
                  {step.subtitle}
                </span>
              )}
            </button>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mt-5 shrink min-w-[24px] ${
                  isPast ? "bg-emerald-200" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
