import { useLocation, useNavigate } from "react-router-dom";
import ClausesListPage from "./ClausesListPage";
import ClauseCreatePage from "./ClauseCreatePage";
import Modal from "../../../components/ui/Modal";

export default function ClausesListWithCreateModal() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isCreate = pathname === "/clauses/clauses/create";

  return (
    <>
      <ClausesListPage />
      {isCreate && (
        <Modal
          open={true}
          onClose={() => navigate("/clauses/clauses")}
          title="Create Clause"
          size="xl"
        >
          <ClauseCreatePage inModal />
        </Modal>
      )}
    </>
  );
}
