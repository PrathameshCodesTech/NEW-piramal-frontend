export const AGREEMENT_TABS = [
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

export const cleanObject = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));

