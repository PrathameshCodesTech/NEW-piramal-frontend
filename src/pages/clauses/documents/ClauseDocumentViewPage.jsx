import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  clauseDocumentsAPI,
  clauseDocumentLinksAPI,
  clausesAPI,
} from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

export default function ClauseDocumentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [clauses, setClauses] = useState([]);
  const [linking, setLinking] = useState(false);
  const [selectedClause, setSelectedClause] = useState("");

  const [links, setLinks] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const d = await clauseDocumentsAPI.get(id);
      setData(d);
      const linkRes = await clauseDocumentLinksAPI.list({ document_id: id });
      setLinks(linkRes?.results || linkRes || []);
    } catch {
      setData(null);
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLinks = () => {
    clauseDocumentLinksAPI
      .list({ document_id: id })
      .then((res) => setLinks(res?.results || res || []))
      .catch(() => setLinks([]));
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    clausesAPI.list().then((res) => setClauses(res?.results || res || [])).catch(() => setClauses([]));
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await clauseDocumentsAPI.delete(id);
      toast.success("Document deleted");
      navigate("/clauses/documents");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const linkedIds = (data?.linked_clauses || data?.clause_links || links || []).map(
    (l) => l.clause_id || l.clause
  );

  const displayLinks = data?.linked_clauses || data?.clause_links || links;

  const handleLink = async () => {
    if (!selectedClause || linkedIds.includes(selectedClause)) return;
    setLinking(true);
    try {
      await clauseDocumentLinksAPI.create({
        document: id,
        clause: selectedClause,
      });
      toast.success("Clause linked");
      setSelectedClause("");
      fetchLinks();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async (linkId) => {
    try {
      await clauseDocumentLinksAPI.delete(linkId);
      toast.success("Link removed");
      fetchLinks();
    } catch (err) {
      toast.error(err.message);
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
    return <div className="text-center py-12 text-gray-500">Document not found</div>;
  }

  const displayLinksList = displayLinks || [];

  return (
    <div>
      <PageHeader
        title={data.name}
        subtitle={data.document_type || "Document"}
        backTo="/clauses/documents"
        actions={<Button variant="danger" onClick={() => setShowDelete(true)}>Delete</Button>}
      />

      <div className="max-w-2xl space-y-4">
        <Card className="p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["Name", data.name],
              ["Type", data.document_type],
              ["Size", data.file_size ? `${(data.file_size / 1024).toFixed(1)} KB` : "—"],
              ["Uploaded", data.created_at ? new Date(data.created_at).toLocaleDateString() : "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium text-gray-500">{label}</dt>
                <dd className="text-sm text-gray-800 mt-0.5">{value || "—"}</dd>
              </div>
            ))}
          </dl>
          {data.file_url && (
            <div className="mt-4">
              <a
                href={data.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:underline text-sm"
              >
                Open / Download file
              </a>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Linked Clauses</h3>
          {displayLinksList.length > 0 && (
            <ul className="space-y-2 mb-4">
              {displayLinksList.map((l) => (
                <li
                  key={l.link_id || l.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm">{l.clause_title || l.document_name}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleUnlink(l.link_id || l.id)}>
                    Unlink
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {clauses.length > 0 && (
            <div className="flex gap-2">
              <select
                value={selectedClause}
                onChange={(e) => setSelectedClause(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select clause to link...</option>
                {clauses
                  .filter((c) => !linkedIds.includes(c.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.clause_id} - {c.title}
                    </option>
                  ))}
              </select>
              <Button size="sm" onClick={handleLink} loading={linking} disabled={!selectedClause}>
                Link
              </Button>
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${data.name}"?`}
        loading={deleting}
      />
    </div>
  );
}
