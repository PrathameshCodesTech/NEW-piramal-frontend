import Card from "../../../../../components/ui/Card";
import Button from "../../../../../components/ui/Button";
import DataTable from "../../../../../components/ui/DataTable";
import EmptyState from "../../../../../components/ui/EmptyState";

export default function NotesTab({
  noteText,
  setNoteText,
  onSave,
  saving,
  notes,
  loading,
  onDelete,
}) {
  const columns = [
    { key: "note_text", label: "Note" },
    { key: "created_by_name", label: "By" },
    {
      key: "created_at",
      label: "Created",
      render: (r) => (r.created_at ? new Date(r.created_at).toLocaleString() : "-"),
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
        <form onSubmit={onSave} className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Add Note</label>
          <textarea
            rows={3}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Add Note
            </Button>
          </div>
        </form>
      </Card>
      <Card>
        {!loading && notes.length === 0 ? (
          <EmptyState title="No notes" description="Add notes for this agreement." />
        ) : (
          <DataTable columns={columns} data={notes} loading={loading} />
        )}
      </Card>
    </div>
  );
}

