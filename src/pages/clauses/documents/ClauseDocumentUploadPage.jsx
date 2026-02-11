import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { clauseDocumentsAPI, clausesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";

const DOC_TYPE_OPTIONS = [
  { value: "PDF", label: "PDF" },
  { value: "DOCX", label: "Word Document" },
  { value: "XLSX", label: "Excel Spreadsheet" },
  { value: "IMAGE", label: "Image" },
  { value: "OTHER", label: "Other" },
];

export default function ClauseDocumentUploadPage({ inModal = false }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clauses, setClauses] = useState([]);
  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState("PDF");
  const [file, setFile] = useState(null);
  const [linkToClauses, setLinkToClauses] = useState([]);

  useEffect(() => {
    clausesAPI.list().then((res) => setClauses(res?.results || res || [])).catch(() => setClauses([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name || file.name);
      formData.append("document_type", documentType);
      formData.append("file", file);
      linkToClauses.forEach((id) => formData.append("link_to_clauses", id));
      await clauseDocumentsAPI.upload(formData);
      toast.success("Document uploaded");
      navigate("/clauses/documents");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleClause = (id) => {
    setLinkToClauses((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clauseOptions = clauses.map((c) => ({
    value: c.id,
    label: `${c.clause_id || c.id} - ${c.title}`,
  }));

  const formContent = (
    <Card className={inModal ? "p-0 border-0 shadow-none" : "p-6 max-w-2xl"}>
      <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Document Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional (defaults to filename)" />
          <Select label="Document Type" value={documentType} onChange={(e) => setDocumentType(e.target.value)} options={DOC_TYPE_OPTIONS} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
          </div>
          {clauseOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link to Clauses</label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {clauseOptions.map((o) => (
                  <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={linkToClauses.includes(o.value)} onChange={() => toggleClause(o.value)} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-sm">{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate("/clauses/documents")}>Cancel</Button>
            <Button type="submit" loading={loading}>Upload</Button>
          </div>
        </form>
    </Card>
  );

  if (inModal) return formContent;
  return (
    <div>
      <PageHeader title="Upload Document" backTo="/clauses/documents" />
      {formContent}
    </div>
  );
}
