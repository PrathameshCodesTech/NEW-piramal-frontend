import { useLocation, useNavigate } from "react-router-dom";
import DisputeRulesListPage from "./DisputeRulesListPage";
import DisputeRuleCreatePage from "./DisputeRuleCreatePage";
import Modal from "../../../components/ui/Modal";

export default function DisputeRulesListWithCreateModal() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isCreate = pathname === "/billing/dispute-rules/create";

  return (
    <>
      <DisputeRulesListPage />
      {isCreate && (
        <Modal
          open={true}
          onClose={() => navigate("/billing/dispute-rules")}
          title="Create Dispute Rule"
          size="md"
        >
          <DisputeRuleCreatePage inModal />
        </Modal>
      )}
    </>
  );
}
