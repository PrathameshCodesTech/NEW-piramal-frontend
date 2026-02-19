import { useState } from "react";
import { Download, Pencil, X } from "lucide-react";
import Card from "../../../../../components/ui/Card";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import Select from "../../../../../components/ui/Select";
import EmptyState from "../../../../../components/ui/EmptyState";
import { LEASE_DOC_TYPE_OPTIONS } from "../constants";

export default function DocumentsTab({
  form,
  setForm,
  onUpload,
  uploading,
  documents,
  loading,
  onDelete,
  onEdit,
}) {
  const [editingDoc, setEditingDoc] = useState(null); // full doc object when editing
  const [editFields, setEditFields] = useState({ title: "", description: "", document_type: "" });
  const [editSaving, setEditSaving] = useState(false);

  const startEdit = (doc) => {
    setEditingDoc(doc);
    setEditFields({
      title: doc.title || "",
      description: doc.description || "",
      document_type: doc.document_type || "",
    });
  };

  const cancelEdit = () => {
    setEditingDoc(null);
    setEditFields({ title: "", description: "", document_type: "" });
  };

  const handleSaveEdit = async () => {
    if (!editFields.title.trim()) return;
    setEditSaving(true);
    try {
      await onEdit(editingDoc.id, {
        title: editFields.title.trim(),
        description: editFields.description || "",
        document_type: editFields.document_type,
      });
      cancelEdit();
    } finally {
      setEditSaving(false);
    }
  };

  const setField = (k) => (e) => setEditFields((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      {/* Upload form (hidden while editing) */}
      {!editingDoc && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Upload Lease Document</h3>
          <form onSubmit={onUpload} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Document Type"
              value={form.document_type}
              onChange={(e) => setForm((p) => ({ ...p, document_type: e.target.value }))}
              options={LEASE_DOC_TYPE_OPTIONS}
            />
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">File <span className="text-red-500">*</span></label>
              <input
                type="file"
                onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" loading={uploading}>Upload Document</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Edit form (shown instead of upload form when editing) */}
      {editingDoc && (
        <Card className="p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Edit Document</h3>
            <button type="button" onClick={cancelEdit} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Document Type"
              value={editFields.document_type}
              onChange={setField("document_type")}
              options={LEASE_DOC_TYPE_OPTIONS}
            />
            <Input
              label="Title"
              value={editFields.title}
              onChange={setField("title")}
              required
            />
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                rows={3}
                value={editFields.description}
                onChange={setField("description")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
              />
            </div>
            <p className="sm:col-span-2 text-xs text-gray-400">
              File cannot be replaced — to update the file, delete this document and upload a new one.
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" type="button" onClick={cancelEdit} disabled={editSaving}>Cancel</Button>
            <Button type="button" onClick={handleSaveEdit} loading={editSaving}>Save Changes</Button>
          </div>
        </Card>
      )}

      {/* Documents list */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <EmptyState title="No documents" description="Upload lease documents for this agreement." />
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Uploaded</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  className={`hover:bg-gray-50 ${editingDoc?.id === doc.id ? "bg-blue-50" : ""}`}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{doc.title}</p>
                    {doc.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[240px]">{doc.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{doc.document_type}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* View / Download */}
                      {doc.file && (
                        <a
                          href={doc.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                          title="View / Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                          View
                        </a>
                      )}
                      {/* Edit */}
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        onClick={() => startEdit(doc)}
                        title="Edit document details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      {/* Delete */}
                      <button
                        type="button"
                        className="text-xs text-red-500 hover:text-red-600 font-medium"
                        onClick={() => onDelete(doc.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
