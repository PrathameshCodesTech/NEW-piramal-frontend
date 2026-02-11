import { useLocation, useNavigate } from "react-router-dom";
import PaymentsListPage from "./PaymentsListPage";
import BillingPlaceholderPage from "../BillingPlaceholderPage";
import Modal from "../../../components/ui/Modal";

export default function PaymentsListWithCreateModal() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isCreate = pathname === "/billing/collections/payments/create";

  return (
    <>
      <PaymentsListPage />
      {isCreate && (
        <Modal open={true} onClose={() => navigate("/billing/collections/payments")} title="Record Payment" size="md">
          <BillingPlaceholderPage title="Record Payment" backTo="/billing/collections/payments" inModal />
        </Modal>
      )}
    </>
  );
}
