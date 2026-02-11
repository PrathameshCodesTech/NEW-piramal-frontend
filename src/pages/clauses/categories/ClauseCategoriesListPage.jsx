import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FolderOpen } from "lucide-react";
import { clauseCategoriesAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import EmptyState from "../../../components/ui/EmptyState";

export default function ClauseCategoriesListPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    clauseCategoriesAPI
      .list()
      .then((r) => setCategories(r?.results || r || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "description", label: "Description", render: (r) => r.description || "—" },
    { key: "sort_order", label: "Sort Order", render: (r) => r.sort_order ?? "—" },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button icon={Plus} onClick={() => navigate("/clauses/categories/create")}>
          New Category
        </Button>
      </div>
      <Card>
        {!loading && categories.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No categories yet"
            description="Create your first clause category"
            actionLabel="New Category"
            onAction={() => navigate("/clauses/categories/create")}
          />
        ) : (
          <DataTable
            columns={columns}
            data={categories}
            loading={loading}
            onRowClick={(r) => navigate(`/clauses/categories/${r.id}`)}
          />
        )}
      </Card>
    </div>
  );
}
