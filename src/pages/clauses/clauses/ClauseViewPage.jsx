import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, Trash2, Copy, ArrowUpCircle, History } from "lucide-react";
import { clausesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

const TABS = ["Details", "Versions"];

export default function ClauseViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [showBump, setShowBump] = useState(false);
  const [bumpForm, setBumpForm] = useState({ bump_type: "MINOR", change_summary: "", body_text: "" });
  const [bumping, setBumping] = useState(false);

  useEffect(() => {
    clausesAPI.get(id).then((res) => { setData(res); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (activeTab === 1) {
      setVersionsLoading(true);
      clausesAPI.versions(id).then((res) => setVersions(res?.results || res || [])).catch(() => setVersions([])).finally(() => setVersionsLoading(false));
    }
  }, [activeTab, id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await clausesAPI.delete(id);
      toast.success("Clause deleted");
      navigate("/clauses/clauses");
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(false); }
  };

  const handleDuplicate = async () => {
    try {
      const res = await clausesAPI.duplicate(id);
      toast.success("Clause duplicated");
      navigate(`/clauses/clauses/${res.id}`);
    } catch (err) { toast.error(err.message); }
  };

  const handleBump = async () => {
    setBumping(true);
    try {
      await clausesAPI.bump(id, { bump_type: bumpForm.bump_type, change_summary: bumpForm.change_summary || null, body_text: bumpForm.body_text || null });
      toast.success("Version bumped");
      setShowBump(false);
      setBumpForm({ bump_type: "MINOR", change_summary: "", body_text: "" });
      const updated = await clausesAPI.get(id);
      setData(updated);
      if (activeTab === 1) {
        const vers = await clausesAPI.versions(id);
        setVersions(vers?.results || vers || []);
      }
    } catch (err) { toast.error(err.message); }
    finally { setBumping(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-12 text-gray-500">Clause not found</div>;

  const statusColor = (s) => (s === "ACTIVE" ? "emerald" : s === "DRAFT" ? "amber" : s === "ARCHIVED" ? "gray" : "red");

  return (
    <div>
      <PageHeader
        title={data.title}
        subtitle={data.clause_id || "Clause"}
        backTo="/clauses/clauses"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={ArrowUpCircle} onClick={() => { setBumpForm({ ...bumpForm, body_text: data.current_version_data?.body_text || data.body_text || "" }); setShowBump(true); }}>Bump Version</Button>
            <Button variant="secondary" size="sm" icon={Copy} onClick={handleDuplicate}>Duplicate</Button>
            <Button variant="secondary" icon={Pencil} onClick={() => navigate(`/clauses/clauses/${id}/edit`)}>Edit</Button>
            <Button variant="danger" icon={Trash2} onClick={() => setShowDelete(true)}>Delete</Button>
          </div>
        }
      />
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} className={`px-4 py-2.5 text-sm font-medium ${activeTab === i ? "text-emerald-700 border-b-2 border-emerald-500" : "text-gray-500"}`}>{tab}</button>
        ))}
      </div>
      {activeTab === 0 && (
        <div className="max-w-3xl space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Badge color={statusColor(data.status)}>{data.status}</Badge>
              <Badge color={data.applies_to === "ALL" ? "purple" : "blue"}>{data.applies_to}</Badge>
              <span className="text-sm text-gray-500 ml-auto">v{data.current_version || 1}.{data.current_minor_version || 0}</span>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {[["Clause ID", data.clause_id], ["Title", data.title], ["Category", data.category_name || data.category_detail?.name], ["Applies To", data.applies_to], ["Status", data.status], ["Version", `v${data.current_version || 1}.${data.current_minor_version || 0}`], ["Created", data.created_at ? new Date(data.created_at).toLocaleDateString() : null], ["Updated", data.updated_at ? new Date(data.updated_at).toLocaleDateString() : null]].map(([label, value]) => (
                <div key={label}><dt className="text-xs font-medium text-gray-500">{label}</dt><dd className="text-sm text-gray-800 mt-0.5">{value || "—"}</dd></div>
              ))}
            </dl>
          </Card>
          {(data.current_version_data?.body_text || data.body_text) && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Clause Body</h3>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{data.current_version_data?.body_text || data.body_text}</div>
            </Card>
          )}
          {data.linked_documents?.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Linked Documents</h3>
              <ul className="space-y-2">
                {data.linked_documents.map((doc) => (
                  <li key={doc.link_id}>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline text-sm">{doc.document_name} ({doc.document_type})</a>
                    <span className="text-gray-400 mx-2">·</span>
                    <button type="button" onClick={() => navigate(`/clauses/documents/${doc.document_id}`)} className="text-gray-500 hover:text-emerald-600 text-sm">View</button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
      {activeTab === 1 && (
        <div className="max-w-3xl">
          {versionsLoading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div> : versions.length === 0 ? <Card className="p-8 text-center text-sm text-gray-500">No version history available.</Card> : (
            <div className="space-y-3">
              {versions.map((v) => (
                <Card key={v.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-800">v{v.major_version}.{v.minor_version}</span>
                      <Badge color={v.version_status === "CURRENT" ? "emerald" : "gray"}>{v.version_status}</Badge>
                    </div>
                    <span className="text-xs text-gray-500">{v.created_at ? new Date(v.created_at).toLocaleDateString() : ""}</span>
                  </div>
                  {v.change_summary && <p className="text-sm text-gray-600 mb-2">{v.change_summary}</p>}
                  {v.body_text && <details className="text-xs"><summary className="text-gray-500 cursor-pointer">View clause text</summary><div className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">{v.body_text}</div></details>}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Delete Clause" message={`Are you sure you want to delete "${data.title}"? This cannot be undone.`} loading={deleting} />
      {showBump && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <Card className="p-6 w-full max-w-lg">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Bump Version</h3>
            <div className="space-y-4">
              <Select label="Bump Type" value={bumpForm.bump_type} onChange={(e) => setBumpForm({ ...bumpForm, bump_type: e.target.value })} options={[{ value: "MINOR", label: "Minor (patch)" }, { value: "MAJOR", label: "Major (breaking)" }]} />
              <Input label="Change Summary" value={bumpForm.change_summary} onChange={(e) => setBumpForm({ ...bumpForm, change_summary: e.target.value })} placeholder="Describe what changed..." />
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Updated Body Text</label><textarea value={bumpForm.body_text} onChange={(e) => setBumpForm({ ...bumpForm, body_text: e.target.value })} rows={8} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-y" /></div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowBump(false)}>Cancel</Button>
                <Button size="sm" icon={ArrowUpCircle} onClick={handleBump} loading={bumping}>Bump to {bumpForm.bump_type === "MAJOR" ? `v${(data.current_version || 1) + 1}.0` : `v${data.current_version || 1}.${(data.current_minor_version || 0) + 1}`}</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
