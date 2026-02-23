import { useState } from "react";
import { CheckCircle2, Circle, Clock, XCircle, ChevronRight, FileText, Eye, Download, X, File } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../../../../components/ui/Card";
import Button from "../../../../../components/ui/Button";
import Badge from "../../../../../components/ui/Badge";
import { statusColor } from "../constants";
import { agreementsAPI } from "../../../../../services/api";

const LIFECYCLE_STEPS = [
  { key: "DRAFT", label: "Draft", description: "Being prepared" },
  { key: "PENDING", label: "Under Review", description: "Submitted for approval" },
  { key: "ACTIVE", label: "Active", description: "Executed & running" },
  { key: "END", label: "Closed", description: "Expired or terminated" },
];

const stepIndex = (status) => {
  if (status === "DRAFT") return 0;
  if (status === "PENDING") return 1;
  if (status === "ACTIVE") return 2;
  if (status === "EXPIRED" || status === "TERMINATED") return 3;
  return 0;
};

function LifecyclePipeline({ status }) {
  const current = stepIndex(status);
  const isTerminated = status === "TERMINATED";

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wide">Lease Lifecycle</p>
      <div className="flex items-center gap-0">
        {LIFECYCLE_STEPS.map((step, i) => {
          const isDone = i < current;
          const isActive = i === current;
          const isClosed = step.key === "END";
          const isTerminatedStep = isClosed && isTerminated;

          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 mb-1 transition-colors ${
                  isActive && isTerminatedStep
                    ? "border-red-500 bg-red-50 text-red-600"
                    : isActive
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                    : isDone
                    ? "border-emerald-400 bg-emerald-400 text-white"
                    : "border-gray-300 bg-white text-gray-300"
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isActive && (status === "EXPIRED" || status === "TERMINATED") ? (
                    <XCircle className="w-4 h-4" />
                  ) : isActive ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <p className={`text-xs font-medium text-center ${
                  isActive && isTerminatedStep ? "text-red-600" : isActive ? "text-emerald-700" : isDone ? "text-emerald-600" : "text-gray-400"
                }`}>
                  {isClosed && isTerminated ? "Terminated" : isClosed && status === "EXPIRED" ? "Expired" : step.label}
                </p>
                <p className="text-[10px] text-gray-400 text-center hidden sm:block">{step.description}</p>
              </div>
              {i < LIFECYCLE_STEPS.length - 1 && (
                <ChevronRight className={`w-4 h-4 shrink-0 mx-0.5 ${isDone || isActive ? "text-emerald-400" : "text-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PdfPreviewModal({ isOpen, onClose, htmlContent, title }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-[90vw] h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="bg-white shadow-lg rounded-lg overflow-auto h-full">
            <iframe
              srcDoc={htmlContent}
              title="PDF Preview"
              className="w-full h-full min-h-[600px]"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionPdfItem({ section, agreementId, sectionIndex }) {
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = async () => {
    setLoadingPreview(true);
    try {
      const html = await agreementsAPI.previewHtml(agreementId, section.id);
      setPreviewHtml(html);
      setShowPreview(true);
    } catch (err) {
      toast.error(err.message || "Failed to load preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownloadPdf = async () => {
    setLoadingPdf(true);
    try {
      const blob = await agreementsAPI.generatePdf(agreementId, section.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${agreementId}_section_${section.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (err) {
      toast.error(err.message || "Failed to download PDF");
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
            {sectionIndex + 1}
          </span>
          <div>
            <p className="text-sm font-medium text-gray-900">{section.name}</p>
            <p className="text-xs text-gray-500">
              {(section.clauses?.length || 0)} clause(s)
              {section.children?.length > 0 && ` • ${section.children.length} sub-section(s)`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreview}
            loading={loadingPreview}
            icon={Eye}
            className="text-xs"
          >
            Preview
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadPdf}
            loading={loadingPdf}
            icon={Download}
            className="text-xs"
          >
            PDF
          </Button>
        </div>
      </div>
      {section.children?.length > 0 && (
        <div className="ml-6 mt-2 space-y-2">
          {section.children.map((child, childIdx) => (
            <div key={child.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {sectionIndex + 1}.{childIdx + 1}
                </span>
                <span className="text-sm text-gray-700">{child.name}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={async () => {
                    setLoadingPreview(true);
                    try {
                      const html = await agreementsAPI.previewHtml(agreementId, child.id);
                      setPreviewHtml(html);
                      setShowPreview(true);
                    } catch (err) {
                      toast.error(err.message || "Failed to load preview");
                    } finally {
                      setLoadingPreview(false);
                    }
                  }}
                  disabled={loadingPreview}
                  className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Preview
                </button>
                <button
                  onClick={async () => {
                    setLoadingPdf(true);
                    try {
                      const blob = await agreementsAPI.generatePdf(agreementId, child.id);
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${agreementId}_section_${child.id}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast.success("PDF downloaded successfully");
                    } catch (err) {
                      toast.error(err.message || "Failed to download PDF");
                    } finally {
                      setLoadingPdf(false);
                    }
                  }}
                  disabled={loadingPdf}
                  className="text-xs px-2 py-1 text-emerald-600 hover:text-emerald-800 hover:underline"
                >
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <PdfPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        htmlContent={previewHtml}
        title={section.name}
      />
    </>
  );
}

export default function ReviewActionsTab({
  data,
  updatingStatus,
  onSubmit,
  onActivate,
  onTerminate,
  onRefresh,
}) {
  const [loadingFullPdf, setLoadingFullPdf] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [fullPreviewHtml, setFullPreviewHtml] = useState(null);
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Get sections from structure if available
  const sections = data?.structure?.sections || [];

  const handleFullPreview = async () => {
    setLoadingPreview(true);
    try {
      const html = await agreementsAPI.previewHtml(data.id);
      setFullPreviewHtml(html);
      setShowFullPreview(true);
    } catch (err) {
      toast.error(err.message || "Failed to load preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleFullPdfDownload = async () => {
    setLoadingFullPdf(true);
    try {
      const blob = await agreementsAPI.generatePdf(data.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.lease_id}_v${data.version_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (err) {
      toast.error(err.message || "Failed to download PDF");
    } finally {
      setLoadingFullPdf(false);
    }
  };

  return (
    <>
      <Card className="p-6 max-w-4xl">
        {/* PDF Generation Section */}
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Agreement Document
            </h3>
          </div>

          {/* Full Agreement Actions */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              variant="primary"
              size="sm"
              icon={Eye}
              onClick={handleFullPreview}
              loading={loadingPreview}
            >
              Preview Full Agreement
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={handleFullPdfDownload}
              loading={loadingFullPdf}
            >
              Download Full PDF
            </Button>
          </div>

          {/* Section-wise PDFs */}
          {sections.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs text-gray-600 font-medium mb-3 uppercase tracking-wide">
                Section-wise Documents
              </p>
              <div className="space-y-2">
                {sections.map((section, idx) => (
                  <SectionPdfItem
                    key={section.id}
                    section={section}
                    agreementId={data.id}
                    sectionIndex={idx}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <File className="w-4 h-4 inline-block mr-1" />
                No agreement structure assigned. Assign a structure in the Basic & Parties tab to generate section-wise PDFs.
              </p>
            </div>
          )}
        </div>

        <LifecyclePipeline status={data.status} />

        <div className="flex items-center gap-2 mb-4">
          <Badge color={statusColor(data.status)}>{data.status}</Badge>
          <Badge color="blue">{data.agreement_type}</Badge>
          <span className="text-xs text-gray-500">Version v{data.version_number}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-500">Tenant</p>
            <p className="text-sm font-medium">{data.tenant_name || data.tenant_details?.legal_name || "-"}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-500">Site</p>
            <p className="text-sm font-medium">{data.site_name || data.site_details?.name || "-"}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-500">Total Area</p>
            <p className="text-sm font-medium">{data.total_allocated_area || 0}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-500">Monthly Rent (Total)</p>
            <p className="text-sm font-medium">{Number(data.total_monthly_rent || 0).toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-500">Notes</p>
            <p className="text-sm font-medium">{(data.notes_list || []).length}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-500">Documents</p>
            <p className="text-sm font-medium">{(data.documents || []).length}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {data.status === "DRAFT" && (
            <Button loading={updatingStatus} onClick={onSubmit}>
              Submit for Review
            </Button>
          )}
          {data.status === "PENDING" && (
            <Button loading={updatingStatus} onClick={onActivate}>
              Activate
            </Button>
          )}
          {data.status === "ACTIVE" && (
            <Button variant="danger" loading={updatingStatus} onClick={onTerminate}>
              Terminate
            </Button>
          )}
          <Button variant="secondary" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </Card>

      <PdfPreviewModal
        isOpen={showFullPreview}
        onClose={() => setShowFullPreview(false)}
        htmlContent={fullPreviewHtml}
        title={`${data.lease_id} - Full Agreement`}
      />
    </>
  );
}
