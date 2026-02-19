import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LayoutList,
  Info,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
  FileText,
} from "lucide-react";
import {
  agreementStructuresAPI,
  agreementSectionsAPI,
} from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import Badge from "../../../components/ui/Badge";

function SectionTreeItem({ section, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = section.children && section.children.length > 0;

  return (
    <div className="ml-4">
      <div className="flex items-center gap-2 py-1.5 group">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="p-0.5 text-gray-400 hover:text-gray-600"
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <span className="w-4 inline-block" />
          )}
        </button>
        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="text-sm font-medium text-gray-800">{section.name}</span>
        {section.description && (
          <span className="text-xs text-gray-500 truncate max-w-[200px]">
            — {section.description}
          </span>
        )}
        <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            icon={Pencil}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(section);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={Trash2}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(section);
            }}
          >
            Delete
          </Button>
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="border-l border-gray-200 ml-4 pl-2">
          {section.children.map((child) => (
            <SectionTreeItem
              key={child.id}
              section={child}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AgreementStructureViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddSection, setShowAddSection] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    name: "",
    description: "",
    sort_order: "0",
    parent: "",
  });

  const fetchStructure = useCallback(async () => {
    setLoading(true);
    try {
      const res = await agreementStructuresAPI.get(id);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStructure();
  }, [fetchStructure]);

  const resetSectionForm = () => {
    setSectionForm({
      name: "",
      description: "",
      sort_order: "0",
      parent: "",
    });
    setEditingSection(null);
  };

  const openAddSection = (parent = null) => {
    resetSectionForm();
    setSectionForm((prev) => ({
      ...prev,
      parent: parent ? String(parent.id) : "",
    }));
    setShowAddSection(true);
  };

  const openEditSection = (section) => {
    setEditingSection(section);
    const parentId = section.parent;
    setSectionForm({
      name: section.name,
      description: section.description || "",
      sort_order: String(section.sort_order ?? 0),
      parent: parentId ? String(parentId) : "",
    });
    setShowAddSection(true);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!sectionForm.name?.trim()) {
      toast.error("Section name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: sectionForm.name.trim(),
        description: sectionForm.description || "",
        sort_order: parseInt(sectionForm.sort_order, 10) || 0,
        parent: sectionForm.parent ? parseInt(sectionForm.parent, 10) : null,
      };
      if (editingSection) {
        await agreementSectionsAPI.update(editingSection.id, payload);
        toast.success("Section updated");
      } else {
        await agreementSectionsAPI.create({
          ...payload,
          structure: parseInt(id, 10),
        });
        toast.success("Section added");
      }
      setShowAddSection(false);
      resetSectionForm();
      fetchStructure();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!showDelete) return;
    setSaving(true);
    try {
      await agreementSectionsAPI.delete(showDelete.id);
      toast.success("Section deleted");
      setShowDelete(null);
      fetchStructure();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStructure = async () => {
    setSaving(true);
    try {
      await agreementStructuresAPI.delete(id);
      toast.success("Structure deleted");
      navigate("/leases/agreement-structures");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Flatten sections for parent dropdown (exclude current when editing)
  const allSections = [];
  const flatten = (sections) => {
    (sections || []).forEach((s) => {
      allSections.push(s);
      if (s.children?.length) flatten(s.children);
    });
  };
  flatten(data?.sections || []);
  const parentOptions = [
    { value: "", label: "— None (root section) —" },
    ...allSections
      .filter((s) => !editingSection || s.id !== editingSection.id)
      .map((s) => ({
        value: String(s.id),
        label: s.name,
      })),
  ];

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!data)
    return <div className="text-center py-12 text-gray-500">Structure not found.</div>;

  return (
    <div>
      <PageHeader
        title={data.name}
        subtitle="Agreement Structure"
        backTo="/leases/agreement-structures"
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              icon={Pencil}
              onClick={() => navigate(`/leases/agreement-structures/${id}/edit`)}
            >
              Edit
            </Button>
            <Button variant="danger" icon={Trash2} onClick={handleDeleteStructure} loading={saving}>
              Delete
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          {data.is_default && (
            <Badge color="emerald">Default</Badge>
          )}
        </div>

        {data.description && (
          <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Description</h4>
            </div>
            <p className="text-sm text-gray-700">{data.description}</p>
          </div>
        )}

        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LayoutList className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Sections</h4>
            </div>
            <Button size="sm" icon={Plus} onClick={() => openAddSection()}>
              Add Section
            </Button>
          </div>
          {(!data.sections || data.sections.length === 0) ? (
            <p className="text-sm text-gray-500 py-4">
              No sections yet. Add sections to define how clauses are grouped in agreements.
            </p>
          ) : (
            <div className="space-y-0">
              {data.sections.map((section) => (
                <SectionTreeItem
                  key={section.id}
                  section={section}
                  onEdit={openEditSection}
                  onDelete={setShowDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showAddSection}
        onClose={() => {
          setShowAddSection(false);
          resetSectionForm();
        }}
        title={editingSection ? "Edit Section" : "Add Section"}
        size="sm"
      >
        <form onSubmit={handleSaveSection} className="space-y-4">
          <Input
            label="Section Name"
            value={sectionForm.name}
            onChange={(e) => setSectionForm((p) => ({ ...p, name: e.target.value }))}
            required
            placeholder="e.g. Rent & Payment"
          />
          <Input
            label="Description"
            value={sectionForm.description}
            onChange={(e) => setSectionForm((p) => ({ ...p, description: e.target.value }))}
          />
          <Input
            label="Sort Order"
            type="number"
            value={sectionForm.sort_order}
            onChange={(e) => setSectionForm((p) => ({ ...p, sort_order: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Section
            </label>
            <select
              value={sectionForm.parent}
              onChange={(e) => setSectionForm((p) => ({ ...p, parent: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
            >
              {parentOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setShowAddSection(false);
                resetSectionForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingSection ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!showDelete}
        onClose={() => setShowDelete(null)}
        onConfirm={handleDeleteSection}
        title="Delete Section"
        message={
          showDelete
            ? `Are you sure you want to delete "${showDelete.name}"? This cannot be undone.`
            : ""
        }
        loading={saving}
      />
    </div>
  );
}
