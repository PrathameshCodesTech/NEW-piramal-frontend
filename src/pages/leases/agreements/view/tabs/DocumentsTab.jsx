import Card from "../../../../../components/ui/Card";
import Button from "../../../../../components/ui/Button";
import DataTable from "../../../../../components/ui/DataTable";
import EmptyState from "../../../../../components/ui/EmptyState";
import Input from "../../../../../components/ui/Input";
import Select from "../../../../../components/ui/Select";
import { LEASE_DOC_TYPE_OPTIONS } from "../constants";

export default function DocumentsTab({
  form,
  setForm,
  onUpload,
  uploading,
  documents,
  loading,
  onDelete,
}) {
  const columns = [
    { key: "title", label: "Title" },
    { key: "document_type", label: "Type" },
    {
      key: "file_size",
      label: "Size",
      render: (r) => (r.file_size ? `${(r.file_size / 1024).toFixed(1)} KB` : "-"),
    },
    {
      key: "created_at",
      label: "Uploaded",
      render: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : "-"),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <button
          type="button"
          className="text-red-600 hover:text-red-700 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(r.id);
          }}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <input
              type="file"
              onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" loading={uploading}>
              Upload Document
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        {!loading && documents.length === 0 ? (
          <EmptyState title="No documents" description="Upload lease documents for this agreement." />
        ) : (
          <DataTable columns={columns} data={documents} loading={loading} />
        )}
      </Card>
    </div>
  );
}

