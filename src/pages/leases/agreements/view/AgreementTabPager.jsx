import Button from "../../../../components/ui/Button";

export default function AgreementTabPager({
  activeTab,
  totalTabs,
  onBack,
  onNext,
  disableNext = false,
}) {
  const isFirst = activeTab <= 0;
  const isLast = activeTab >= totalTabs - 1;

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <span className="text-xs text-gray-500">
        Step {activeTab + 1} of {totalTabs}
      </span>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onBack} disabled={isFirst}>
          Back
        </Button>
        {!isLast && (
          <Button type="button" variant="secondary" onClick={onNext} disabled={disableNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
