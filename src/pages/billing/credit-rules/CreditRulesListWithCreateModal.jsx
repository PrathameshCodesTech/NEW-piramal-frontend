import { useLocation, useNavigate } from "react-router-dom";
import CreditRulesListPage from "./CreditRulesListPage";
import BillingPlaceholderPage from "../BillingPlaceholderPage";
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
          <BillingPlaceholderPage title="Create Credit Rule" backTo="/billing/credit-rules" inModal />
        </Modal>
      )}
    </>
  );
}
