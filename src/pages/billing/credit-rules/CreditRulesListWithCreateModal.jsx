import { useLocation, useNavigate } from "react-router-dom";
import CreditRulesListPage from "./CreditRulesListPage";
import CreditRuleCreatePage from "./CreditRuleCreatePage";
import Modal from "../../../components/ui/Modal";

export default function CreditRulesListWithCreateModal() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isCreate = pathname === "/billing/credit-rules/create";

  return (
    <>
      <CreditRulesListPage />
      {isCreate && (
        <Modal
          open={true}
          onClose={() => navigate("/billing/credit-rules")}
          title="Create Credit Rule"
          size="md"
        >
          <CreditRuleCreatePage inModal />
        </Modal>
      )}
    </>
  );
}
