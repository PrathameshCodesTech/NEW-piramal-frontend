import { useLocation, useNavigate } from "react-router-dom";
import ClauseCategoriesListPage from "./ClauseCategoriesListPage";
import ClauseCategoryCreatePage from "./ClauseCategoryCreatePage";
import Modal from "../../../components/ui/Modal";

export default function ClauseCategoriesListWithCreateModal() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isCreate = pathname === "/clauses/categories/create";

  return (
    <>
      <ClauseCategoriesListPage />
      {isCreate && (
        <Modal
          open={true}
          onClose={() => navigate("/clauses/categories")}
          title="Create Category"
          size="md"
        >
          <ClauseCategoryCreatePage inModal />
        </Modal>
      )}
    </>
  );
}
