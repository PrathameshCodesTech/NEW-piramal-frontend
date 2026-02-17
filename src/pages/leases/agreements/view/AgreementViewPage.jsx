import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  agreementsAPI,
  allocationsAPI,
  escalationTemplatesAPI,
  leaseAvailabilityAPI,
  leaseClauseConfigAPI,
  leaseNotesAPI,
  leaseDocumentsAPI,
  sitesAPI,
  tenantCompaniesAPI,
  tenantContactsAPI,
} from "../../../../services/api";
import PageHeader from "../../../../components/ui/PageHeader";
import {
  calculateBufferSummary,
  calculateAnnualRentFromMonthly,
  calculateMonthlyRentFromRateAndArea,
  cleanObject,
  deriveEscalationFormFromTemplate,
  resolveBaseRentMonthly,
  toNumberOrNull,
} from "./constants";
import AgreementTabsNav from "./AgreementTabsNav";
import AgreementTabPager from "./AgreementTabPager";
import BasicPartiesTab from "./tabs/BasicPartiesTab";
import PropertyAllocationTab from "./tabs/PropertyAllocationTab";
import FinancialsTab from "./tabs/FinancialsTab";
import ClauseConfigTab from "./tabs/ClauseConfigTab";
import NotesTab from "./tabs/NotesTab";
import DocumentsTab from "./tabs/DocumentsTab";
import ReviewActionsTab from "./tabs/ReviewActionsTab";
import TenantSetupTab from "./tabs/TenantSetupTab";
import Button from "../../../../components/ui/Button";
import { CalendarPlus, FileText } from "lucide-react";

const initialBasicForm = {
  lease_id: "",
  agreement_type: "OFFICE",
  tenant: "",
  primary_contact: "",
  site: "",
  landlord_entity: "",
  ref_code: "",
  notes: "",
};

const initialFinancialForm = {
  commencement_date: "",
  expiry_date: "",
  initial_term_months: "",
  base_rent_monthly: "",
  rate_per_sqft_monthly: "",
  annual_rent: "",
  billing_frequency: "MONTHLY",
  payment_due_date: "1ST_DAY_OF_MONTH",
  first_rent_due_date: "",
  currency: "INR",
  rent_free_days: "",
  extended_buffer_days: "",
  extended_buffer_charge_percent: "50",
  escalation_template: "",
  escalation_type: "FIXED_PERCENT",
  escalation_value: "",
  escalation_frequency_months: "12",
  first_escalation_months: "12",
  apply_to_cam: false,
  apply_to_parking: false,
  cam_allocation_basis: "PRO_RATA",
  cam_per_sqft_monthly: "",
  cam_fixed_amount_monthly: "",
  cam_percentage_value: "",
  cam_monthly_total: "",
  deposit_amount: "",
  deposit_months_equivalent: "",
  invoice_generate_rule: "1ST_DAY_OF_MONTH",
  grace_days: "7",
  late_fee_flat: "",
  late_fee_percent: "",
  interest_annual_percent: "",
  gst_applicable: true,
  gst_rate: "18",
};

const initialAllocationForm = {
  allocation_level: "UNIT",
  floor: "",
  unit: "",
  allocation_mode: "FULL",
  allocated_area_sqft: "",
};

const initialDocForm = {
  document_type: "AGREEMENT",
  title: "",
  description: "",
  file: null,
};

export default function AgreementViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [sites, setSites] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [templates, setTemplates] = useState([]);

  const [basicForm, setBasicForm] = useState(initialBasicForm);
  const [financialForm, setFinancialForm] = useState(initialFinancialForm);
  const [serverBufferSummary, setServerBufferSummary] = useState(null);

  const [allocations, setAllocations] = useState([]);
  const [allocationsLoading, setAllocationsLoading] = useState(false);
  const [allocationForm, setAllocationForm] = useState(initialAllocationForm);
  const [floorOptions, setFloorOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);

  const [terminationForm, setTerminationForm] = useState({
    tenant_early_exit_permitted: false,
    tenant_notice_days: "90",
    termination_clause: "",
  });
  const [clauseConfig, setClauseConfig] = useState(null);
  const [clauseLoading, setClauseLoading] = useState(false);

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteText, setNoteText] = useState("");

  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [docForm, setDocForm] = useState(initialDocForm);

  const [savingBasic, setSavingBasic] = useState(false);
  const [savingFinancials, setSavingFinancials] = useState(false);
  const [savingAllocation, setSavingAllocation] = useState(false);
  const [savingClause, setSavingClause] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchAgreement = async () => {
    setLoading(true);
    try {
      const res = await agreementsAPI.get(id);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const hydrateForms = (agreement) => {
    setBasicForm({
      lease_id: agreement.lease_id || "",
      agreement_type: agreement.agreement_type || "OFFICE",
      tenant: agreement.tenant ? String(agreement.tenant) : "",
      primary_contact: agreement.primary_contact ? String(agreement.primary_contact) : "",
      site: agreement.site ? String(agreement.site) : "",
      landlord_entity: agreement.landlord_entity || "",
      ref_code: agreement.ref_code || "",
      notes: agreement.notes || "",
    });

    setFinancialForm({
      commencement_date: agreement.term_dates?.commencement_date || "",
      expiry_date: agreement.term_dates?.expiry_date || "",
      initial_term_months: agreement.term_dates?.initial_term_months ?? "",
      base_rent_monthly: agreement.financials?.base_rent_monthly ?? "",
      rate_per_sqft_monthly: agreement.financials?.rate_per_sqft_monthly ?? "",
      annual_rent: agreement.financials?.annual_rent ?? "",
      billing_frequency: agreement.financials?.billing_frequency || "MONTHLY",
      payment_due_date: agreement.financials?.payment_due_date || "1ST_DAY_OF_MONTH",
      first_rent_due_date: agreement.financials?.first_rent_due_date || "",
      currency: agreement.financials?.currency || "INR",
      rent_free_days: agreement.rent_free?.rent_free_days ?? "",
      extended_buffer_days: agreement.rent_free?.extended_buffer_days ?? "",
      extended_buffer_charge_percent: agreement.rent_free?.extended_buffer_charge_percent ?? 50,
      escalation_template: agreement.escalation?.template ? String(agreement.escalation.template) : "",
      escalation_type: agreement.escalation?.escalation_type || "FIXED_PERCENT",
      escalation_value: agreement.escalation?.escalation_value ?? "",
      escalation_frequency_months: agreement.escalation?.escalation_frequency_months ?? 12,
      first_escalation_months: agreement.escalation?.first_escalation_months ?? 12,
      apply_to_cam: !!agreement.escalation?.apply_to_cam,
      apply_to_parking: !!agreement.escalation?.apply_to_parking,
      cam_allocation_basis: agreement.cam?.allocation_basis || "PRO_RATA",
      cam_per_sqft_monthly: agreement.cam?.per_sqft_monthly ?? "",
      cam_fixed_amount_monthly: agreement.cam?.fixed_amount_monthly ?? "",
      cam_percentage_value: agreement.cam?.percentage_value ?? "",
      cam_monthly_total: agreement.cam?.monthly_total ?? "",
      deposit_amount: agreement.deposit?.amount ?? "",
      deposit_months_equivalent: agreement.deposit?.months_equivalent ?? "",
      invoice_generate_rule: agreement.billing?.invoice_generate_rule || "1ST_DAY_OF_MONTH",
      grace_days: agreement.billing?.grace_days ?? 7,
      late_fee_flat: agreement.billing?.late_fee_flat ?? "",
      late_fee_percent: agreement.billing?.late_fee_percent ?? "",
      interest_annual_percent: agreement.billing?.interest_annual_percent ?? "",
      gst_applicable: agreement.billing?.gst_applicable ?? true,
      gst_rate: agreement.billing?.gst_rate ?? 18,
    });
  };

  const fetchLookupData = async () => {
    sitesAPI.list().then((r) => setSites(r?.results || r || [])).catch(() => setSites([]));
    tenantCompaniesAPI.list().then((r) => setTenants(r?.results || r || [])).catch(() => setTenants([]));
    escalationTemplatesAPI
      .list({ status: "ACTIVE" })
      .then((r) => setTemplates(r?.results || r || []))
      .catch(() => setTemplates([]));
  };

  const fetchContactsForTenant = async (tenantId) => {
    if (!tenantId) {
      setContacts([]);
      return;
    }
    tenantContactsAPI
      .list({ company_id: tenantId })
      .then((r) => setContacts(r?.results || r || []))
      .catch(() => setContacts([]));
  };

  const fetchAllocationsAndUnits = async () => {
    if (!data?.site) {
      setAllocations([]);
      setFloorOptions([]);
      setUnitOptions([]);
      return;
    }
    setAllocationsLoading(true);
    try {
      const [allocRes, tree] = await Promise.all([
        allocationsAPI.byAgreement(id),
        leaseAvailabilityAPI.tree(data.site),
      ]);
      setAllocations(allocRes?.results || allocRes || []);

      const flattenedFloors = [];
      const flattenedUnits = [];
      (tree?.towers || []).forEach((tower) => {
        (tower.floors || []).forEach((floor) => {
          flattenedFloors.push({
            id: floor.id,
            label: `${tower.name} / ${floor.label || floor.number}`,
            available: floor.available_area_sqft,
            blocked: !!floor.has_floor_allocation,
          });
          (floor.units || []).forEach((unit) => {
            flattenedUnits.push({
              id: unit.id,
              label: `${tower.name} / ${floor.label || floor.number} / ${unit.unit_no}`,
              available: unit.available_area_sqft,
              disabled: !!unit.blocked_by_floor_allocation,
            });
          });
        });
      });
      setFloorOptions(flattenedFloors);
      setUnitOptions(flattenedUnits);
    } catch {
      setAllocations([]);
      setFloorOptions([]);
      setUnitOptions([]);
    } finally {
      setAllocationsLoading(false);
    }
  };

  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      const res = await leaseNotesAPI.byAgreement(id);
      setNotes(res?.results || res || []);
    } catch {
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setDocumentsLoading(true);
    try {
      const res = await leaseDocumentsAPI.list({ agreement_id: id });
      setDocuments(res?.results || res || []);
    } catch {
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const fetchClauseConfig = async () => {
    setClauseLoading(true);
    try {
      const res = await leaseClauseConfigAPI.get(id);
      setClauseConfig(res);
      setTerminationForm({
        tenant_early_exit_permitted: !!res?.termination?.tenant_early_exit_permitted,
        tenant_notice_days: res?.termination?.tenant_notice_days ?? 90,
        termination_clause: res?.termination?.termination_clause || "",
      });
    } catch {
      setClauseConfig(null);
    } finally {
      setClauseLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreement();
    fetchLookupData();
  }, [id]);

  useEffect(() => {
    if (!data) return;
    hydrateForms(data);
  }, [data]);

  useEffect(() => {
    fetchContactsForTenant(basicForm.tenant);
  }, [basicForm.tenant]);

  useEffect(() => {
    setServerBufferSummary(null);
  }, [id]);

  useEffect(() => {
    if (activeTab !== 3 || !id) return;
    if (!financialForm.commencement_date) {
      setServerBufferSummary(null);
      return;
    }

    const payload = {
      term_dates: cleanObject({
        commencement_date: financialForm.commencement_date || null,
        expiry_date: financialForm.expiry_date || null,
      }),
      financials: cleanObject({
        base_rent_monthly: null,
        rate_per_sqft_monthly: toNumberOrNull(financialForm.rate_per_sqft_monthly),
      }),
      rent_free: cleanObject({
        rent_free_days: toNumberOrNull(financialForm.rent_free_days),
        extended_buffer_days: toNumberOrNull(financialForm.extended_buffer_days),
        extended_buffer_charge_percent: toNumberOrNull(financialForm.extended_buffer_charge_percent),
      }),
    };

    const timer = setTimeout(async () => {
      try {
        const res = await agreementsAPI.pricingPreview(id, payload);
        setServerBufferSummary(res?.summary || null);
      } catch {
        setServerBufferSummary(null);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [
    activeTab,
    id,
    financialForm.commencement_date,
    financialForm.expiry_date,
    financialForm.rate_per_sqft_monthly,
    financialForm.base_rent_monthly,
    financialForm.rent_free_days,
    financialForm.extended_buffer_days,
    financialForm.extended_buffer_charge_percent,
  ]);

  useEffect(() => {
    if (activeTab === 2) fetchAllocationsAndUnits();
    if (activeTab === 4) fetchClauseConfig();
    if (activeTab === 5) fetchNotes();
    if (activeTab === 6) fetchDocuments();
  }, [activeTab, data?.site]);

  useEffect(() => {
    if (!financialForm.escalation_template) return;
    const selectedTemplate = templates.find(
      (t) => String(t.id) === String(financialForm.escalation_template)
    );
    const derived = deriveEscalationFormFromTemplate(selectedTemplate);
    if (!derived) return;
    setFinancialForm((prev) => ({ ...prev, ...derived }));
  }, [financialForm.escalation_template, templates]);

  const refreshAgreementWithMessage = async (msg) => {
    if (msg) toast.success(msg);
    await fetchAgreement();
  };

  const goBack = () => setActiveTab((prev) => Math.max(prev - 1, 0));
  const goNext = () => setActiveTab((prev) => Math.min(prev + 1, 7));

  const handleSaveBasic = async (e) => {
    e.preventDefault();
    setSavingBasic(true);
    try {
      await agreementsAPI.update(id, {
        lease_id: basicForm.lease_id,
        agreement_type: basicForm.agreement_type,
        tenant: basicForm.tenant ? parseInt(basicForm.tenant, 10) : null,
        primary_contact: basicForm.primary_contact ? parseInt(basicForm.primary_contact, 10) : null,
        site: basicForm.site ? parseInt(basicForm.site, 10) : null,
        landlord_entity: basicForm.landlord_entity || "",
        ref_code: basicForm.ref_code || "",
        notes: basicForm.notes || "",
      });
      await refreshAgreementWithMessage("Basic details updated");
      goNext();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingBasic(false);
    }
  };

  const handleSaveFinancials = async (e) => {
    e.preventDefault();
    setSavingFinancials(true);
    try {
      const payload = {
        term_dates: cleanObject({
          commencement_date: financialForm.commencement_date || null,
          expiry_date: financialForm.expiry_date || null,
          initial_term_months: toNumberOrNull(financialForm.initial_term_months),
        }),
        financials: cleanObject({
          base_rent_monthly: effectiveBaseRentMonthly,
          rate_per_sqft_monthly: toNumberOrNull(financialForm.rate_per_sqft_monthly),
          annual_rent: calculateAnnualRentFromMonthly(effectiveBaseRentMonthly),
          billing_frequency: financialForm.billing_frequency,
          payment_due_date: financialForm.payment_due_date,
          first_rent_due_date: financialForm.first_rent_due_date || null,
          currency: financialForm.currency || "INR",
        }),
        rent_free: cleanObject({
          rent_free_start_date: financialForm.commencement_date || null,
          rent_free_days: toNumberOrNull(financialForm.rent_free_days),
          extended_buffer_days: toNumberOrNull(financialForm.extended_buffer_days),
          extended_buffer_charge_percent: toNumberOrNull(financialForm.extended_buffer_charge_percent),
        }),
        escalation: cleanObject({
          template: financialForm.escalation_template ? parseInt(financialForm.escalation_template, 10) : null,
          use_template_values: !!financialForm.escalation_template,
          escalation_type: financialForm.escalation_type,
          escalation_value: toNumberOrNull(financialForm.escalation_value),
          escalation_frequency_months: toNumberOrNull(financialForm.escalation_frequency_months) || 12,
          first_escalation_months: toNumberOrNull(financialForm.first_escalation_months) || 12,
          apply_to_cam: !!financialForm.apply_to_cam,
          apply_to_parking: !!financialForm.apply_to_parking,
        }),
        cam: cleanObject({
          allocation_basis: financialForm.cam_allocation_basis,
          per_sqft_monthly: toNumberOrNull(financialForm.cam_per_sqft_monthly),
          fixed_amount_monthly: toNumberOrNull(financialForm.cam_fixed_amount_monthly),
          percentage_value: toNumberOrNull(financialForm.cam_percentage_value),
          monthly_total: toNumberOrNull(financialForm.cam_monthly_total),
        }),
        deposit: cleanObject({
          amount: toNumberOrNull(financialForm.deposit_amount),
          months_equivalent: toNumberOrNull(financialForm.deposit_months_equivalent),
        }),
        billing: cleanObject({
          invoice_generate_rule: financialForm.invoice_generate_rule,
          grace_days: toNumberOrNull(financialForm.grace_days) || 7,
          late_fee_flat: toNumberOrNull(financialForm.late_fee_flat),
          late_fee_percent: toNumberOrNull(financialForm.late_fee_percent),
          interest_annual_percent: toNumberOrNull(financialForm.interest_annual_percent),
          gst_applicable: !!financialForm.gst_applicable,
          gst_rate: toNumberOrNull(financialForm.gst_rate) || 18,
        }),
      };
      await agreementsAPI.bundle(id, payload);
      await refreshAgreementWithMessage("Financials updated");
      goNext();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingFinancials(false);
    }
  };

  const handleCreateAllocation = async (e) => {
    e.preventDefault();
    setSavingAllocation(true);
    try {
      const isFloor = allocationForm.allocation_level === "FLOOR";
      const targetId = isFloor ? allocationForm.floor : allocationForm.unit;
      if (!targetId) {
        toast.error(`Please select a ${isFloor ? "floor" : "unit"}`);
        setSavingAllocation(false);
        return;
      }

      const payload = {
        agreement: parseInt(id, 10),
        allocation_level: allocationForm.allocation_level,
        allocation_mode: allocationForm.allocation_mode,
        allocated_area_sqft: toNumberOrNull(allocationForm.allocated_area_sqft),
      };
      if (isFloor) payload.floor = parseInt(targetId, 10);
      else payload.unit = parseInt(targetId, 10);

      await allocationsAPI.create(payload);
      setAllocationForm(initialAllocationForm);
      toast.success("Allocation added");
      await fetchAllocationsAndUnits();
      await fetchAgreement();
      goNext();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingAllocation(false);
    }
  };

  const handleDeleteAllocation = async (allocationId) => {
    try {
      await allocationsAPI.delete(allocationId);
      toast.success("Allocation removed");
      await fetchAllocationsAndUnits();
      await fetchAgreement();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSaveClauseConfig = async (e) => {
    e.preventDefault();
    setSavingClause(true);
    try {
      await leaseClauseConfigAPI.update(id, {
        termination: {
          tenant_early_exit_permitted: !!terminationForm.tenant_early_exit_permitted,
          tenant_notice_days: toNumberOrNull(terminationForm.tenant_notice_days) || 90,
          termination_clause: terminationForm.termination_clause || "",
        },
      });
      toast.success("Clause config updated");
      await fetchClauseConfig();
      goNext();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingClause(false);
    }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      await leaseNotesAPI.create({
        agreement: parseInt(id, 10),
        note_text: noteText.trim(),
      });
      setNoteText("");
      toast.success("Note added");
      await fetchNotes();
      await fetchAgreement();
      goNext();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await leaseNotesAPI.delete(noteId);
      toast.success("Note deleted");
      await fetchNotes();
      await fetchAgreement();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docForm.file) {
      toast.error("Please select a file");
      return;
    }
    setUploadingDoc(true);
    try {
      const fd = new FormData();
      fd.append("agreement", id);
      fd.append("document_type", docForm.document_type);
      fd.append("title", docForm.title);
      fd.append("description", docForm.description || "");
      fd.append("file", docForm.file);
      await leaseDocumentsAPI.upload(fd);
      setDocForm(initialDocForm);
      toast.success("Document uploaded");
      await fetchDocuments();
      await fetchAgreement();
      goNext();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await leaseDocumentsAPI.delete(docId);
      toast.success("Document deleted");
      await fetchDocuments();
      await fetchAgreement();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const runStatusAction = async (action, label) => {
    setUpdatingStatus(true);
    try {
      await action(id);
      toast.success(label);
      await fetchAgreement();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">Agreement not found.</div>;
  }

  const tenantOptions = tenants.map((t) => ({ value: String(t.id), label: t.legal_name || `Tenant ${t.id}` }));
  const siteOptions = sites.map((s) => ({ value: String(s.id), label: s.name || s.code || `Site ${s.id}` }));
  const contactOptions = contacts.map((c) => ({ value: String(c.id), label: c.name || c.email || `Contact ${c.id}` }));
  const templateOptions = templates.map((t) => ({ value: String(t.id), label: t.name }));
  const totalAllocatedAreaFromData = toNumberOrNull(data?.total_allocated_area);
  const totalAllocatedAreaFromAllocations = allocations.reduce(
    (sum, alloc) => sum + (toNumberOrNull(alloc.allocated_area_sqft) || 0),
    0
  );
  const totalAllocatedAreaSqft =
    totalAllocatedAreaFromData !== null ? totalAllocatedAreaFromData : totalAllocatedAreaFromAllocations;
  const effectiveBaseRentMonthly = resolveBaseRentMonthly(
    financialForm.base_rent_monthly,
    financialForm.rate_per_sqft_monthly,
    totalAllocatedAreaSqft
  );
  const localBufferSummary = calculateBufferSummary({
    commencementDate: financialForm.commencement_date,
    expiryDate: financialForm.expiry_date,
    monthlyBaseRent: effectiveBaseRentMonthly,
    primaryBufferDays: financialForm.rent_free_days,
    extendedBufferDays: financialForm.extended_buffer_days,
    extendedBufferChargePercent: financialForm.extended_buffer_charge_percent,
    allocatedAreaSqft: totalAllocatedAreaSqft,
  });
  const bufferSummary = serverBufferSummary || localBufferSummary;
  const selectedSiteId = toNumberOrNull(data?.site ?? basicForm.site);
  const selectedSite = sites.find((s) => Number(s.id) === selectedSiteId);
  const explicitRate = toNumberOrNull(financialForm.rate_per_sqft_monthly);
  const fallbackSiteRate = selectedSite ? toNumberOrNull(selectedSite.base_rate_sqft) : null;
  const effectiveRatePerSqft = explicitRate !== null ? explicitRate : fallbackSiteRate;
  const monthlyRentPreview = calculateMonthlyRentFromRateAndArea(
    allocationForm.allocated_area_sqft,
    effectiveRatePerSqft
  );

  return (
    <div>
      <PageHeader
        title={data.lease_id}
        subtitle={data.tenant_name || data.tenant_details?.legal_name || "Lease Agreement"}
        backTo="/leases/agreements"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={CalendarPlus} onClick={() => navigate(`/billing/schedules/create?agreement=${id}`)}>
              Add Schedule
            </Button>
            <Button variant="secondary" icon={FileText} onClick={() => navigate(`/billing/invoices/create?agreement=${id}`)}>
              Add Invoice
            </Button>
          </div>
        }
      />

      <AgreementTabsNav activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 0 && (
        <TenantSetupTab
          tenantOptions={tenantOptions}
          selectedTenant={basicForm.tenant}
          onTenantSelect={(val) => setBasicForm((p) => ({ ...p, tenant: val }))}
          onTenantCreated={(newTenant) => {
            setTenants((prev) => [...prev, newTenant]);
            setBasicForm((p) => ({ ...p, tenant: String(newTenant.id) }));
            goNext();
          }}
        />
      )}

      {activeTab === 1 && (
        <BasicPartiesTab
          form={basicForm}
          setForm={setBasicForm}
          tenantOptions={tenantOptions}
          siteOptions={siteOptions}
          contactOptions={contactOptions}
          onSubmit={handleSaveBasic}
          saving={savingBasic}
        />
      )}

      {activeTab === 2 && (
        <PropertyAllocationTab
          allocationForm={allocationForm}
          setAllocationForm={setAllocationForm}
          floorOptions={floorOptions}
          unitOptions={unitOptions}
          monthlyRentPreview={monthlyRentPreview}
          effectiveRatePerSqft={effectiveRatePerSqft}
          onCreate={handleCreateAllocation}
          savingAllocation={savingAllocation}
          allocations={allocations}
          allocationsLoading={allocationsLoading}
          onDelete={handleDeleteAllocation}
        />
      )}

      {activeTab === 3 && (
        <FinancialsTab
          form={financialForm}
          setForm={setFinancialForm}
          templateOptions={templateOptions}
          effectiveBaseRentMonthly={effectiveBaseRentMonthly}
          totalAllocatedAreaSqft={totalAllocatedAreaSqft}
          bufferSummary={bufferSummary}
          onSubmit={handleSaveFinancials}
          saving={savingFinancials}
        />
      )}

      {activeTab === 4 && (
        <ClauseConfigTab
          loading={clauseLoading}
          form={terminationForm}
          setForm={setTerminationForm}
          onSubmit={handleSaveClauseConfig}
          saving={savingClause}
          clauseConfig={clauseConfig}
        />
      )}

      {activeTab === 5 && (
        <NotesTab
          noteText={noteText}
          setNoteText={setNoteText}
          onSave={handleSaveNote}
          saving={savingNote}
          notes={notes}
          loading={notesLoading}
          onDelete={handleDeleteNote}
        />
      )}

      {activeTab === 6 && (
        <DocumentsTab
          form={docForm}
          setForm={setDocForm}
          onUpload={handleUploadDocument}
          uploading={uploadingDoc}
          documents={documents}
          loading={documentsLoading}
          onDelete={handleDeleteDocument}
        />
      )}

      {activeTab === 7 && (
        <ReviewActionsTab
          data={data}
          updatingStatus={updatingStatus}
          onSubmit={() => runStatusAction(agreementsAPI.submit, "Agreement submitted")}
          onActivate={() => runStatusAction(agreementsAPI.activate, "Agreement activated")}
          onTerminate={() => runStatusAction(agreementsAPI.terminate, "Agreement terminated")}
          onRefresh={fetchAgreement}
        />
      )}

      <AgreementTabPager
        activeTab={activeTab}
        totalTabs={8}
        onBack={goBack}
        onNext={goNext}
      />
    </div>
  );
}


