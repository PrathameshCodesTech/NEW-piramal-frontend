import { Clock } from "lucide-react";
import Input from "../../../../components/ui/Input";

export default function ScheduleSection(props) {
  const { form, setForm, readOnly = false, errors = {} } = props;

  const set = (f) => (e) => {
    setForm((prev) => ({ ...prev, [f]: e.target.value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-amber-600" />
        <h3 className="text-sm font-semibold text-gray-800">Schedule Dates</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          value={form.start_date ?? ""}
          onChange={set("start_date")}
          readOnly={readOnly}
          required
          error={errors.start_date}
        />
        <Input
          label="End Date (optional)"
          type="date"
          value={form.end_date ?? ""}
          onChange={set("end_date")}
          readOnly={readOnly}
          error={errors.end_date}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Day of Month"
          type="number"
          min={1}
          max={31}
          value={form.day_of_month ?? ""}
          onChange={set("day_of_month")}
          placeholder="1"
          readOnly={readOnly}
          error={errors.day_of_month}
        />
        <Input
          label="Generate Days Before"
          type="number"
          min={0}
          value={form.generate_days_before ?? ""}
          onChange={set("generate_days_before")}
          placeholder="0"
          readOnly={readOnly}
          error={errors.generate_days_before}
        />
      </div>
    </div>
  );
}
