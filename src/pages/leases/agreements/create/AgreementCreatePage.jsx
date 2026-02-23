import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  agreementStructuresAPI,
} from "../../../../services/api";
import PageHeader from "../../../../components/ui/PageHeader";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import AgreementTabsNav from "../view/AgreementTabsNav";
import AgreementTabPager from "../view/AgreementTabPager";
import {
  calculateBufferSummary,
  calculateAnnualRentFromMonthly,
  calculateMonthlyRentFromRateAndArea,
  cleanObject,
  deriveEscalationFormFromTemplate,
  resolveBaseRentMonthly,
  toNumberOrNull,
} from "../view/constants";
import TenantSetupTab from "../view/tabs/TenantSetupTab";
import BasicPartiesTab from "../view/tabs/BasicPartiesTab";
import PropertyAllocationTab from "../view/tabs/PropertyAllocationTab";
import FinancialsTab from "../view/tabs/FinancialsTab";
import ClauseConfigTab from "../view/tabs/ClauseConfigTab";
import NotesTab from "../view/tabs/NotesTab";
import DocumentsTab from "../view/tabs/DocumentsTab";
import ReviewActionsTab from "../view/tabs/ReviewActionsTab";

const initialBasicForm = {
  lease_id: "",
  agreement_type: "OFFICE",
  structure: "",
  tenant: "",
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

export default function AgreementCreatePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [agreementId, setAgreementId] = useState(null);
  const [data, setData] = useState(null);
  const [loadingAgreement, setLoadingAgreement] = useState(false);

  const [tenants, setTenants] = useState([]);
  const [sites, setSites] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [structures, setStructures] = useState([]);

  const [basicForm, setBasicForm] = useState(initialBasicForm);
  const [financialForm, setFinancialForm] = useState(initialFinancialForm);
  const [serverBufferSummary, setServerBufferSummary] = useState(null);

  const [allocations, setAllocations] = useState([]);
  const [allocationsLoading, setAllocationsLoading] = useState(false);
  const [allocationForm, setAllocationForm] = useState(initialAllocationForm);
  const [floorOptions, setFloorOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);

  const [clauseForm, setClauseForm] = useState({
    termination: {
      tenant_early_exit_permitted: false,
      tenant_notice_days: 90,
      tenant_penalty_type: "",
      tenant_penalty_value: "",
      tenant_exit_conditions: "",
      landlord_early_termination_permitted: false,
      landlord_notice_days: 180,
      landlord_compensation_type: "",
      landlord_compensation_value: "",
      landlord_relocation_assistance: false,
      landlord_termination_conditions: "",
      break_clause_enabled: false,
      break_date: "",
      break_notice_days: "",
      break_penalty: "",
      break_penalty_type: "",
      break_conditions: "",
      cure_period_days: 30,
      termination_clause: "",
    },
    renewal_option: {
      pre_renewal_notice_days: 120,
      auto_renewal_enabled: false,
      auto_renewal_term_months: "",
      max_renewal_cycles: 3,
      renewal_notes: "",
    },
    sublet_signage: {
      sublet_permission: "PROHIBITED",
      sublet_approval_required: true,
      max_sublet_percentage: "",
      sublet_restrictions: "",
      signage_permitted: true,
      signage_approval_required: true,
      signage_area_sqft: "",
      signage_area_unit: "SQFT",
      signage_locations: "",
      signage_cost_responsibility: "Tenant",
    },
    exclusivity: {
      exclusive_use_granted: false,
      exclusive_category: "",
      exclusive_radius: "Within Property",
      exclusive_exceptions: "",
      non_compete_enabled: false,
      non_compete_duration_months: "",
      non_compete_radius_km: "",
      non_compete_scope: "",
    },
    insurance_requirement: {
      restore_condition: "ORIGINAL",
      restore_details: "",
      reinstatement_timeline_days: "",
      public_liability_required: true,
      public_liability_coverage: "",
      public_liability_currency: "INR",
      property_insurance_required: true,
      property_insurance_coverage: "",
      landlord_additional_insured: true,
      proof_required: true,
      proof_frequency: "Annual",
      indemnity_notes: "",
    },
    dispute_resolution: {
      dispute_mechanism: "MEDIATION",
      arbitration_seat: "",
      arbitration_language: "English",
      number_of_arbitrators: 1,
      arbitration_institution: "",
      mediation_required_first: false,
      mediation_period_days: "",
      governing_law_country: "India",
      governing_law_state: "",
      jurisdiction_court: "",
      exclusive_jurisdiction: true,
      dispute_summary: "",
    },
  });
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

  useEffect(() => {
    sitesAPI.list().then((r) => setSites(r?.results || r || [])).catch(() => setSites([]));
    tenantCompaniesAPI.list().then((r) => setTenants(r?.results || r || [])).catch(() => setTenants([]));
    escalationTemplatesAPI
      .list({ status: "ACTIVE" })
      .then((r) => setTemplates(r?.results || r || []))
      .catch(() => setTemplates([]));
    agreementStructuresAPI
      .list()
      .then((r) => setStructures(r?.results || r || []))
      .catch(() => setStructures([]));
  }, []);

  useEffect(() => {
    if (!agreementId) return;
    if (activeTab === 2) fetchAllocationsAndUnits();
    if (activeTab === 4) fetchClauseConfig();
    if (activeTab === 5) fetchNotes();
    if (activeTab === 6) fetchDocuments();
  }, [activeTab, agreementId, data?.site, basicForm.site]);

  useEffect(() => {
    setServerBufferSummary(null);
  }, [agreementId]);

  useEffect(() => {
    if (!financialForm.escalation_template) return;
    const selectedTemplate = templates.find(
      (t) => String(t.id) === String(financialForm.escalation_template)
    );
    const derived = deriveEscalationFormFromTemplate(selectedTemplate);
    if (!derived) return;
    setFinancialForm((prev) => ({ ...prev, ...derived }));
  }, [financialForm.escalation_template, templates]);

  useEffect(() => {
    if (activeTab !== 3 || !agreementId) return;
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
        const res = await agreementsAPI.pricingPreview(agreementId, payload);
        setServerBufferSummary(res?.summary || null);
      } catch {
        setServerBufferSummary(null);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [
    activeTab,
    agreementId,
    financialForm.commencement_date,
    financialForm.expiry_date,
    financialForm.rate_per_sqft_monthly,
    financialForm.base_rent_monthly,
    financialForm.rent_free_days,
    financialForm.extended_buffer_days,
    financialForm.extended_buffer_charge_percent,
  ]);

  const hydrateForms = (agreement) => {
    setBasicForm({
      lease_id: agreement.lease_id || "",
      agreement_type: agreement.agreement_type || "OFFICE",
      structure: agreement.structure ? String(agreement.structure) : "",
      tenant: agreement.tenant ? String(agreement.tenant) : "",
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

  const fetchAgreement = async (targetId) => {
    if (!targetId) return;
    setLoadingAgreement(true);
    try {
      const res = await agreementsAPI.get(targetId);
      setData(res);
      hydrateForms(res);
    } catch {
      setData(null);
    } finally {
      setLoadingAgreement(false);
    }
  };

  const fetchAllocationsAndUnits = async () => {
    if (!agreementId) return;
    const selectedSite = data?.site || toNumberOrNull(basicForm.site);
    if (!selectedSite) {
      setAllocations([]);
      setFloorOptions([]);
      setUnitOptions([]);
      return;
    }

    setAllocationsLoading(true);
    try {
      const [allocRes, tree] = await Promise.all([
        allocationsAPI.byAgreement(agreementId),
        leaseAvailabilityAPI.tree(selectedSite),
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

  const fetchClauseConfig = async () => {
    if (!agreementId) return;
    setClauseLoading(true);
    try {
      const res = await leaseClauseConfigAPI.get(agreementId);
      const merge = (defaults, src) => {
        if (!src) return defaults;
        const out = { ...defaults };
        Object.keys(defaults).forEach((k) => {
          if (src[k] !== undefined && src[k] !== null) out[k] = src[k];
        });
        return out;
      };
      setClauseForm((p) => ({
        termination: merge(p.termination, res?.termination),
        renewal_option: merge(p.renewal_option, res?.renewal_option),
        sublet_signage: merge(p.sublet_signage, res?.sublet_signage),
        exclusivity: merge(p.exclusivity, res?.exclusivity),
        insurance_requirement: merge(p.insurance_requirement, res?.insurance_requirement),
        dispute_resolution: merge(p.dispute_resolution, res?.dispute_resolution),
      }));
    } catch {
      /* keep defaults on error */
    } finally {
      setClauseLoading(false);
    }
  };

  const fetchNotes = async () => {
    if (!agreementId) return;
    setNotesLoading(true);
    try {
      const res = await leaseNotesAPI.byAgreement(agreementId);
      setNotes(res?.results || res || []);
    } catch {
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  const fetchDocuments = async () => {
    if (!agreementId) return;
    setDocumentsLoading(true);
    try {
      const res = await leaseDocumentsAPI.list({ agreement_id: agreementId });
      setDocuments(res?.results || res || []);
    } catch {
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const goBack = () => setActiveTab((prev) => Math.max(prev - 1, 0));
  const goNext = (targetAgreementId = agreementId) => {
    if (!targetAgreementId) {
      toast.error("Save Basic & Parties first");
      return;
    }
    setActiveTab((prev) => Math.min(prev + 1, 7));
  };
  const goToTab = (tabIndex) => {
    if (tabIndex > 1 && !agreementId) {
      toast.error("Create agreement in Basic & Parties first");
      return;
    }
    setActiveTab(tabIndex);
  };

  const ensureAgreement = () => {
    if (agreementId) return true;
    toast.error("Create agreement in Basic & Parties first");
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavingBasic(true);
    try {
      const payload = {
        lease_id: basicForm.lease_id,
        agreement_type: basicForm.agreement_type,
        structure: basicForm.structure ? parseInt(basicForm.structure, 10) : null,
        tenant: basicForm.tenant ? parseInt(basicForm.tenant, 10) : null,
        primary_contact: null,
        site: basicForm.site ? parseInt(basicForm.site, 10) : null,
        landlord_entity: basicForm.landlord_entity || "",
        ref_code: basicForm.ref_code || "",
        notes: basicForm.notes || "",
      };

      let currentId = agreementId;
      if (currentId) {
        await agreementsAPI.update(currentId, payload);
        toast.success("Basic details updated");
      } else {
        const created = await agreementsAPI.create({ ...payload, status: "DRAFT" });
        currentId = created.id;
        setAgreementId(created.id);
        toast.success("Draft agreement created");
      }

      await fetchAgreement(currentId);
      goNext(currentId);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingBasic(false);
    }
  };

  const handleSaveFinancials = async (e) => {
    e.preventDefault();
    if (!ensureAgreement()) return;
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

      await agreementsAPI.bundle(agreementId, payload);
      toast.success("Financials updated");
      await fetchAgreement(agreementId);
      goNext();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingFinancials(false);
    }
  };

  const handleCreateAllocation = async (e) => {
    e.preventDefault();
    if (!ensureAgreement()) return;
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
        agreement: parseInt(agreementId, 10),
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
      await fetchAgreement(agreementId);
      goNext();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingAllocation(false);
    }
  };

  const handleDeleteAllocation = async (allocationId) => {
    if (!ensureAgreement()) return;
    try {
      await allocationsAPI.delete(allocationId);
      toast.success("Allocation removed");
      await fetchAllocationsAndUnits();
      await fetchAgreement(agreementId);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSaveClauseConfig = async (e) => {
    e.preventDefault();
    if (!ensureAgreement()) return;
    setSavingClause(true);
    try {
      await leaseClauseConfigAPI.update(agreementId, {
        termination: clauseForm.termination,
        renewal_option: clauseForm.renewal_option,
        sublet_signage: clauseForm.sublet_signage,
        exclusivity: clauseForm.exclusivity,
        insurance_requirement: clauseForm.insurance_requirement,
        dispute_resolution: clauseForm.dispute_resolution,
      });
      toast.success("Legal config saved");
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
    if (!ensureAgreement()) return;
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      await leaseNotesAPI.create({
        agreement: parseInt(agreementId, 10),
        note_text: noteText.trim(),
      });
      setNoteText("");
      toast.success("Note added");
      await fetchNotes();
      await fetchAgreement(agreementId);
      goNext();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!ensureAgreement()) return;
    try {
      await leaseNotesAPI.delete(noteId);
      toast.success("Note deleted");
      await fetchNotes();
      await fetchAgreement(agreementId);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!ensureAgreement()) return;
    if (!docForm.file) {
      toast.error("Please select a file");
      return;
    }
    setUploadingDoc(true);
    try {
      const fd = new FormData();
      fd.append("agreement", agreementId);
      fd.append("document_type", docForm.document_type);
      fd.append("title", docForm.title);
      fd.append("description", docForm.description || "");
      fd.append("file", docForm.file);
      await leaseDocumentsAPI.upload(fd);
      setDocForm(initialDocForm);
      toast.success("Document uploaded");
      await fetchDocuments();
      await fetchAgreement(agreementId);
      goNext();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!ensureAgreement()) return;
    try {
      await leaseDocumentsAPI.delete(docId);
      toast.success("Document deleted");
      await fetchDocuments();
      await fetchAgreement(agreementId);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const runStatusAction = async (action, label) => {
    if (!ensureAgreement()) return;
    setUpdatingStatus(true);
    try {
      await action(agreementId);
      toast.success(label);
      await fetchAgreement(agreementId);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const tenantOptions = tenants.map((t) => ({ value: String(t.id), label: t.legal_name || `Tenant ${t.id}` }));
  const siteOptions = sites.map((s) => ({ value: String(s.id), label: s.name || s.code || `Site ${s.id}` }));
  const templateOptions = templates.map((t) => ({ value: String(t.id), label: t.name }));
  const structureOptions = structures.map((s) => ({ value: String(s.id), label: s.name }));
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
        title={agreementId ? `Agreement Wizard: ${basicForm.lease_id || agreementId}` : "Create Agreement Wizard"}
        subtitle="API-driven multi-step flow"
        backTo="/leases/agreements"
        actions={
          agreementId ? (
            <Button size="sm" variant="secondary" onClick={() => navigate(`/leases/agreements/${agreementId}`)}>
              Open Detail Page
            </Button>
          ) : null
        }
      />
      <AgreementTabsNav activeTab={activeTab} onChange={goToTab} />

      {activeTab > 1 && !agreementId ? (
        <Card className="p-6 max-w-3xl">
          <p className="text-sm text-gray-700">
            Create the agreement first in <strong>Basic & Parties</strong>. This generates a draft and enables all
            remaining tabs with real API calls.
          </p>
          <div className="mt-4">
            <Button type="button" variant="secondary" onClick={() => setActiveTab(1)}>
              Go to Basic & Parties
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {activeTab === 0 && (
            <TenantSetupTab
              tenantOptions={tenantOptions}
              selectedTenant={basicForm.tenant}
              onTenantSelect={(val) => setBasicForm((p) => ({ ...p, tenant: val }))}
              onTenantCreated={(newTenant) => {
                setTenants((prev) => [...prev, newTenant]);
                setBasicForm((p) => ({ ...p, tenant: String(newTenant.id) }));
              }}
            />
          )}

          {activeTab === 1 && (
            <BasicPartiesTab
              form={basicForm}
              setForm={setBasicForm}
              tenantOptions={tenantOptions}
              siteOptions={siteOptions}
              structureOptions={structureOptions}
              onSubmit={handleSubmit}
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
              form={clauseForm}
              setForm={setClauseForm}
              onSubmit={handleSaveClauseConfig}
              saving={savingClause}
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
              data={data || { status: "DRAFT", agreement_type: basicForm.agreement_type, version_number: 1 }}
              updatingStatus={updatingStatus}
              onSubmit={() => runStatusAction(agreementsAPI.submit, "Agreement submitted")}
              onActivate={() => runStatusAction(agreementsAPI.activate, "Agreement activated")}
              onTerminate={() => runStatusAction(agreementsAPI.terminate, "Agreement terminated")}
              onRefresh={() => fetchAgreement(agreementId)}
            />
          )}
        </>
      )}

      <AgreementTabPager
        activeTab={activeTab}
        totalTabs={8}
        onBack={goBack}
        onNext={goNext}
        disableNext={activeTab > 0 && !agreementId}
      />

      {loadingAgreement && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

