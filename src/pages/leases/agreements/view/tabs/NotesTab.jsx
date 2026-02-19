import { useState } from "react";
import Card from "../../../../../components/ui/Card";
import Button from "../../../../../components/ui/Button";
import EmptyState from "../../../../../components/ui/EmptyState";

export default function NotesTab({
  noteText,
  setNoteText,
  onSave,
  saving,
  notes,
  loading,
  onDelete,
  onEdit,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const startEdit = (note) => {
    setEditingId(note.id);
    setEditText(note.note_text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) return;
    setEditSaving(true);
    try {
      await onEdit(id, editText.trim());
      setEditingId(null);
      setEditText("");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add note form */}
      <Card className="p-6">
        <form onSubmit={onSave} className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Add Note</label>
          <textarea
            rows={3}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
            placeholder="Write a note about this agreement..."
          />
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>Add Note</Button>
          </div>
        </form>
      </Card>

      {/* Notes list */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <EmptyState title="No notes" description="Add notes for this agreement." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {notes.map((note) => (
              <li key={note.id} className="px-5 py-4">
                {editingId === note.id ? (
                  /* ── Edit mode ── */
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full border border-emerald-400 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                      autoFocus
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        onClick={cancelEdit}
                        disabled={editSaving}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        type="button"
                        onClick={() => handleSaveEdit(note.id)}
                        loading={editSaving}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* ── Read mode ── */
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.note_text}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {note.created_by_name && <span>{note.created_by_name} · </span>}
                        {note.created_at ? new Date(note.created_at).toLocaleString() : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        onClick={() => startEdit(note)}
                      >
                        Edit
                      </button>
                      <span className="text-gray-200">|</span>
                      <button
                        type="button"
                        className="text-xs text-red-500 hover:text-red-600 font-medium"
                        onClick={() => onDelete(note.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
