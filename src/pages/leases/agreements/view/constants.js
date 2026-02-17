export const AGREEMENT_TABS = [
  "Tenant Setup",
  "Basic & Parties",
  "Property & Unit Allocation",
  "Financials",
  "Legal / Clause Config",
  "Notes",
  "Documents",
  "Review + Actions",
];

export const AGREEMENT_TYPE_OPTIONS = [
  { value: "COMMERCIAL_RETAIL", label: "Commercial Retail" },
  { value: "OFFICE", label: "Office" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "INDUSTRIAL", label: "Industrial" },
  { value: "RESIDENTIAL", label: "Residential" },
];

export const BILLING_FREQ_OPTIONS = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "HALF_YEARLY", label: "Half Yearly" },
  { value: "ANNUALLY", label: "Annually" },
];

export const PAYMENT_DUE_OPTIONS = [
  { value: "1ST_DAY_OF_MONTH", label: "1st Day of Month" },
  { value: "5TH_DAY_OF_MONTH", label: "5th Day of Month" },
  { value: "10TH_DAY_OF_MONTH", label: "10th Day of Month" },
  { value: "15TH_DAY_OF_MONTH", label: "15th Day of Month" },
  { value: "ON_COMMENCEMENT_DATE", label: "On Commencement Date" },
];

export const ESCALATION_TYPE_OPTIONS = [
  { value: "FIXED_PERCENT", label: "Fixed %" },
  { value: "CPI_INDEX", label: "CPI Index" },
  { value: "MARKET_RATE", label: "Market Rate" },
  { value: "STEP_UP", label: "Step Up" },
  { value: "NONE", label: "None" },
];

export const CAM_BASIS_OPTIONS = [
  { value: "PRO_RATA", label: "Pro-rata" },
  { value: "FIXED", label: "Fixed" },
  { value: "PERCENTAGE", label: "Percentage" },
];

export const INVOICE_RULE_OPTIONS = [
  { value: "1ST_DAY_OF_MONTH", label: "1st Day of Month" },
  { value: "5TH_DAY_OF_MONTH", label: "5th Day of Month" },
  { value: "10TH_DAY_OF_MONTH", label: "10th Day of Month" },
  { value: "ON_COMMENCEMENT_DATE", label: "On Commencement Date" },
];

export const ALLOCATION_MODE_OPTIONS = [
  { value: "FULL", label: "Full" },
  { value: "PARTIAL", label: "Partial" },
];

export const ALLOCATION_LEVEL_OPTIONS = [
  { value: "UNIT", label: "Unit" },
  { value: "FLOOR", label: "Floor" },
];

export const LEASE_DOC_TYPE_OPTIONS = [
  { value: "AGREEMENT", label: "Lease Agreement" },
  { value: "AMENDMENT", label: "Amendment" },
  { value: "ADDENDUM", label: "Addendum" },
  { value: "NOTICE", label: "Notice" },
  { value: "RENEWAL", label: "Renewal" },
  { value: "OTHER", label: "Other" },
];

export const statusColor = (status) => {
  if (status === "ACTIVE") return "emerald";
  if (status === "PENDING") return "amber";
  if (status === "DRAFT") return "blue";
  if (status === "TERMINATED") return "red";
  return "gray";
};

export const toNumberOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export const calculateAnnualRentFromMonthly = (monthlyRent) => {
  const monthly = toNumberOrNull(monthlyRent);
  if (monthly === null) return null;
  return Number((monthly * 12).toFixed(2));
};

export const calculateMonthlyRentFromRateAndArea = (allocatedAreaSqft, ratePerSqftMonthly) => {
  const area = toNumberOrNull(allocatedAreaSqft);
  const rate = toNumberOrNull(ratePerSqftMonthly);
  if (area === null || rate === null) return null;
  return Number((area * rate).toFixed(2));
};

export const resolveBaseRentMonthly = (
  baseRentMonthly,
  ratePerSqftMonthly,
  totalAllocatedAreaSqft
) => {
  const derived = calculateMonthlyRentFromRateAndArea(
    totalAllocatedAreaSqft,
    ratePerSqftMonthly
  );
  if (derived !== null) return derived;
  return toNumberOrNull(baseRentMonthly);
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toUtcDate = (value) => {
  if (!value) return null;
  const parts = String(value).split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  return new Date(Date.UTC(y, m - 1, d));
};

const fromUtcDate = (date) => {
  if (!(date instanceof Date)) return "";
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const addDaysUtc = (date, days) => {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const addYearsUtc = (date, years) => {
  const next = new Date(date.getTime());
  next.setUTCFullYear(next.getUTCFullYear() + years);
  return next;
};

const endOfMonthUtc = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));

const daysInMonthUtc = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();

const minDate = (a, b) => (a.getTime() <= b.getTime() ? a : b);
const maxDate = (a, b) => (a.getTime() >= b.getTime() ? a : b);

const diffDaysInclusive = (start, end) =>
  Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;

const clampPercent = (value) => {
  const n = toNumberOrNull(value);
  if (n === null) return 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
};

const round2 = (value) => Number((value || 0).toFixed(2));

const buildPhase = (day, commencement, primaryDays, extendedDays, extendedPercent) => {
  const dayOffset = diffDaysInclusive(commencement, day) - 1;
  if (dayOffset < primaryDays) {
    return { phase: "PRIMARY_BUFFER", chargePct: 0 };
  }
  if (dayOffset < primaryDays + extendedDays) {
    return { phase: "EXTENDED_BUFFER", chargePct: extendedPercent / 100 };
  }
  return { phase: "NORMAL", chargePct: 1 };
};

const sumDailyCharges = (
  start,
  end,
  monthlyBase,
  commencement,
  primaryDays,
  extendedDays,
  extendedPercent
) => {
  let gross = 0;
  let charged = 0;
  let primaryConcession = 0;
  let extendedConcession = 0;

  for (let day = new Date(start.getTime()); day <= end; day = addDaysUtc(day, 1)) {
    const dailyBase = monthlyBase / daysInMonthUtc(day);
    const { phase, chargePct } = buildPhase(
      day,
      commencement,
      primaryDays,
      extendedDays,
      extendedPercent
    );
    const dailyCharged = dailyBase * chargePct;
    gross += dailyBase;
    charged += dailyCharged;
    if (phase === "PRIMARY_BUFFER") {
      primaryConcession += dailyBase;
    } else if (phase === "EXTENDED_BUFFER") {
      extendedConcession += dailyBase - dailyCharged;
    }
  }

  return {
    gross: round2(gross),
    charged: round2(charged),
    primaryConcession: round2(primaryConcession),
    extendedConcession: round2(extendedConcession),
  };
};

export const calculateBufferSummary = ({
  commencementDate,
  expiryDate,
  monthlyBaseRent,
  primaryBufferDays,
  extendedBufferDays,
  extendedBufferChargePercent,
  allocatedAreaSqft,
}) => {
  const commencement = toUtcDate(commencementDate);
  const expiry = toUtcDate(expiryDate);
  const monthlyBase = toNumberOrNull(monthlyBaseRent);
  if (!commencement || monthlyBase === null || monthlyBase <= 0) {
    return null;
  }

  const primaryDays = Math.max(0, Math.trunc(toNumberOrNull(primaryBufferDays) || 0));
  const extendedDays = Math.max(0, Math.trunc(toNumberOrNull(extendedBufferDays) || 0));
  const extendedPercent = clampPercent(extendedBufferChargePercent);
  const areaSqft = toNumberOrNull(allocatedAreaSqft);

  const primaryStart = primaryDays > 0 ? commencement : null;
  const primaryEnd = primaryDays > 0 ? addDaysUtc(commencement, primaryDays - 1) : null;
  const extendedStart =
    extendedDays > 0 ? addDaysUtc(commencement, primaryDays) : null;
  const extendedEnd =
    extendedDays > 0 ? addDaysUtc(extendedStart, extendedDays - 1) : null;
  const firstChargeStart = addDaysUtc(commencement, primaryDays);
  const fullChargeStart = addDaysUtc(commencement, primaryDays + extendedDays);

  const firstYearEnd = addDaysUtc(addYearsUtc(commencement, 1), -1);
  const annualRangeEnd = expiry ? minDate(firstYearEnd, expiry) : firstYearEnd;
  const annualRangeStart = commencement;
  const annualTotals =
    annualRangeEnd >= annualRangeStart
      ? sumDailyCharges(
          annualRangeStart,
          annualRangeEnd,
          monthlyBase,
          commencement,
          primaryDays,
          extendedDays,
          extendedPercent
        )
      : { gross: 0, charged: 0, primaryConcession: 0, extendedConcession: 0 };

  const termRangeEnd = expiry || annualRangeEnd;
  const termTotals =
    termRangeEnd >= commencement
      ? sumDailyCharges(
          commencement,
          termRangeEnd,
          monthlyBase,
          commencement,
          primaryDays,
          extendedDays,
          extendedPercent
        )
      : { gross: 0, charged: 0, primaryConcession: 0, extendedConcession: 0 };

  const firstInvoiceEnd = endOfMonthUtc(firstChargeStart);
  const firstInvoiceRangeEnd = expiry ? minDate(firstInvoiceEnd, expiry) : firstInvoiceEnd;
  const firstInvoiceAmount =
    firstInvoiceRangeEnd >= firstChargeStart
      ? sumDailyCharges(
          firstChargeStart,
          firstInvoiceRangeEnd,
          monthlyBase,
          commencement,
          primaryDays,
          extendedDays,
          extendedPercent
        ).charged
      : 0;

  const nextCycleStart = addDaysUtc(firstInvoiceRangeEnd, 1);
  const nextCycleEnd = endOfMonthUtc(nextCycleStart);
  const nextCycleRangeEnd = expiry ? minDate(nextCycleEnd, expiry) : nextCycleEnd;
  const nextCycleAmount =
    nextCycleRangeEnd >= nextCycleStart
      ? sumDailyCharges(
          nextCycleStart,
          nextCycleRangeEnd,
          monthlyBase,
          commencement,
          primaryDays,
          extendedDays,
          extendedPercent
        ).charged
      : 0;

  const effectiveMonthly = round2(annualTotals.charged / 12);
  const effectiveRateSqft =
    areaSqft && areaSqft > 0 ? round2(effectiveMonthly / areaSqft) : null;
  const currentDailyBaseRent = round2(monthlyBase / daysInMonthUtc(commencement));

  return {
    primaryBufferDays: primaryDays,
    extendedBufferDays: extendedDays,
    extendedBufferChargePercent: round2(extendedPercent),
    primaryBufferStartDate: primaryStart ? fromUtcDate(primaryStart) : null,
    primaryBufferEndDate: primaryEnd ? fromUtcDate(primaryEnd) : null,
    extendedBufferStartDate: extendedStart ? fromUtcDate(extendedStart) : null,
    extendedBufferEndDate: extendedEnd ? fromUtcDate(extendedEnd) : null,
    firstChargeDate: fromUtcDate(firstChargeStart),
    fullChargeDate: fromUtcDate(fullChargeStart),
    annualGrossRent: annualTotals.gross,
    annualPrimaryBufferConcession: annualTotals.primaryConcession,
    annualExtendedBufferConcession: annualTotals.extendedConcession,
    annualNetCollectible: annualTotals.charged,
    effectiveMonthlyRent: effectiveMonthly,
    effectiveRatePerSqft: effectiveRateSqft,
    termGrossRent: termTotals.gross,
    termPrimaryBufferConcession: termTotals.primaryConcession,
    termExtendedBufferConcession: termTotals.extendedConcession,
    termNetCollectible: termTotals.charged,
    currentDailyBaseRent,
    firstInvoiceAmount: round2(firstInvoiceAmount),
    nextCycleAmount: round2(nextCycleAmount),
  };
};

export const mapTemplateEscalationTypeToLeaseType = (templateType) => {
  if (templateType === "INDEX_LINKED") return "CPI_INDEX";
  if (templateType === "STEP_WISE") return "STEP_UP";
  return "FIXED_PERCENT";
};

export const mapTemplateFrequencyToMonths = (frequency) => {
  if (frequency === "EVERY_2_YEARS") return 24;
  if (frequency === "EVERY_3_YEARS") return 36;
  if (frequency === "EVERY_5_YEARS") return 60;
  return 12;
};

export const deriveEscalationFormFromTemplate = (template) => {
  if (!template) return null;
  return {
    escalation_type: mapTemplateEscalationTypeToLeaseType(template.escalation_type),
    escalation_value:
      template.escalation_percentage === null || template.escalation_percentage === undefined
        ? ""
        : String(template.escalation_percentage),
    escalation_frequency_months: String(mapTemplateFrequencyToMonths(template.frequency)),
    first_escalation_months:
      template.first_escalation_months === null || template.first_escalation_months === undefined
        ? "12"
        : String(template.first_escalation_months),
    apply_to_cam: !!template.apply_to_cam,
    apply_to_parking: !!template.apply_to_parking,
  };
};

export const cleanObject = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
