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
  tenantContactsAPI,
} from "../../../../services/api";
import PageHeader from "../../../../components/ui/PageHeader";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import AgreementTabsNav from "../view/AgreementTabsNav";
import AgreementTabPager from "../view/AgreementTabPager";
import { cleanObject, toNumberOrNull } from "../view/constants";
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
  unit: "",
  allocation_mode: "FULL",
  allocated_area_sqft: "",
  monthly_rent: "",
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
  const [contacts, setContacts] = useState([]);
  const [templates, setTemplates] = useState([]);

  const [basicForm, setBasicForm] = useState(initialBasicForm);
  const [financialForm, setFinancialForm] = useState(initialFinancialForm);

  const [allocations, setAllocations] = useState([]);
  const [allocationsLoading, setAllocationsLoading] = useState(false);
  const [allocationForm, setAllocationForm] = useState(initialAllocationForm);
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

  useEffect(() => {
    sitesAPI.list().then((r) => setSites(r?.results || r || [])).catch(() => setSites([]));
    tenantCompaniesAPI.list().then((r) => setTenants(r?.results || r || [])).catch(() => setTenants([]));
    escalationTemplatesAPI
      .list({ status: "ACTIVE" })
      .then((r) => setTemplates(r?.results || r || []))
      .catch(() => setTemplates([]));
  }, []);

  useEffect(() => {
    if (!basicForm.tenant) {
      setContacts([]);
      return;
    }
    tenantContactsAPI
      .list({ company_id: basicForm.tenant })
      .then((r) => setContacts(r?.results || r || []))
      .catch(() => setContacts([]));
  }, [basicForm.tenant]);

  useEffect(() => {
    if (!agreementId) return;
    if (activeTab === 1) fetchAllocationsAndUnits();
    if (activeTab === 3) fetchClauseConfig();
    if (activeTab === 4) fetchNotes();
    if (activeTab === 5) fetchDocuments();
  }, [activeTab, agreementId, data?.site, basicForm.site]);

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

      const flattened = [];
      (tree?.towers || []).forEach((tower) => {
        (tower.floors || []).forEach((floor) => {
          (floor.units || []).forEach((unit) => {
            flattened.push({
              id: unit.id,
              label: `${tower.name} / ${floor.label || floor.number} / ${unit.unit_no}`,
              available: unit.available_area_sqft,
            });
          });
        });
      });
      setUnitOptions(flattened);
    } catch {
      setAllocations([]);
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
    setActiveTab((prev) => Math.min(prev + 1, 6));
  };
  const goToTab = (tabIndex) => {
    if (tabIndex > 0 && !agreementId) {
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
        tenant: basicForm.tenant ? parseInt(basicForm.tenant, 10) : null,
        primary_contact: basicForm.primary_contact ? parseInt(basicForm.primary_contact, 10) : null,
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
          base_rent_monthly: toNumberOrNull(financialForm.base_rent_monthly),
          rate_per_sqft_monthly: toNumberOrNull(financialForm.rate_per_sqft_monthly),
          annual_rent: toNumberOrNull(financialForm.annual_rent),
          billing_frequency: financialForm.billing_frequency,
          payment_due_date: financialForm.payment_due_date,
          first_rent_due_date: financialForm.first_rent_due_date || null,
          currency: financialForm.currency || "INR",
        }),
        escalation: cleanObject({
          template: financialForm.escalation_template ? parseInt(financialForm.escalation_template, 10) : null,
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
      await allocationsAPI.create({
        agreement: parseInt(agreementId, 10),
        unit: parseInt(allocationForm.unit, 10),
        allocation_mode: allocationForm.allocation_mode,
        allocated_area_sqft: toNumberOrNull(allocationForm.allocated_area_sqft),
        monthly_rent: toNumberOrNull(allocationForm.monthly_rent),
      });
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
  const contactOptions = contacts.map((c) => ({ value: String(c.id), label: c.name || c.email || `Contact ${c.id}` }));
  const templateOptions = templates.map((t) => ({ value: String(t.id), label: t.name }));

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

      {activeTab > 0 && !agreementId ? (
        <Card className="p-6 max-w-3xl">
          <p className="text-sm text-gray-700">
            Create the agreement first in <strong>Basic & Parties</strong>. This generates a draft and enables all
            remaining tabs with real API calls.
          </p>
          <div className="mt-4">
            <Button type="button" variant="secondary" onClick={() => setActiveTab(0)}>
              Go to Basic & Parties
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {activeTab === 0 && (
            <BasicPartiesTab
              form={basicForm}
              setForm={setBasicForm}
              tenantOptions={tenantOptions}
              siteOptions={siteOptions}
              contactOptions={contactOptions}
              onSubmit={handleSubmit}
              saving={savingBasic}
            />
          )}

          {activeTab === 1 && (
            <PropertyAllocationTab
              allocationForm={allocationForm}
              setAllocationForm={setAllocationForm}
              unitOptions={unitOptions}
              onCreate={handleCreateAllocation}
              savingAllocation={savingAllocation}
              allocations={allocations}
              allocationsLoading={allocationsLoading}
              onDelete={handleDeleteAllocation}
            />
          )}

          {activeTab === 2 && (
            <FinancialsTab
              form={financialForm}
              setForm={setFinancialForm}
              templateOptions={templateOptions}
              onSubmit={handleSaveFinancials}
              saving={savingFinancials}
            />
          )}

          {activeTab === 3 && (
            <ClauseConfigTab
              loading={clauseLoading}
              form={terminationForm}
              setForm={setTerminationForm}
              onSubmit={handleSaveClauseConfig}
              saving={savingClause}
              clauseConfig={clauseConfig}
            />
          )}

          {activeTab === 4 && (
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

          {activeTab === 5 && (
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

          {activeTab === 6 && (
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
        totalTabs={7}
        onBack={goBack}
        onNext={goNext}
        disableNext={!agreementId}
      />

      {loadingAgreement && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}


