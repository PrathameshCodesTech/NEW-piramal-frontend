import { useLocation, useNavigate } from "react-router-dom";
import BillingRulesListPage from "./BillingRulesListPage";
import BillingRuleCreatePage from "./BillingRuleCreatePage";
import Modal from "../../../components/ui/Modal";

export default function BillingRulesListWithCreateModal() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isCreate = pathname === "/billing/rules/create";

  return (
    <>
      <BillingRulesListPage />
      {isCreate && (
        <Modal open={true} onClose={() => navigate("/billing/rules")} title="Create Billing Rule" size="md">
          <BillingRuleCreatePage inModal />
        </Modal>
      )}
    </>
  );
}
