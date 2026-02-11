import { useLocation, useNavigate } from "react-router-dom";
import ClauseUsagesListPage from "./ClauseUsagesListPage";
import ClauseUsageCreatePage from "./ClauseUsageCreatePage";
import Modal from "../../../components/ui/Modal";

export default function ClauseUsagesListWithCreateModal() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isCreate = pathname === "/clauses/usages/create";

  return (
    <>
      <ClauseUsagesListPage />
      {isCreate && (
        <Modal
          open={true}
          onClose={() => navigate("/clauses/usages")}
          title="Attach Clause to Agreement"
          size="md"
        >
          <ClauseUsageCreatePage inModal />
        </Modal>
      )}
    </>
  );
}
