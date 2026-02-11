import { useLocation, useNavigate } from "react-router-dom";
import InvoicesListPage from "./InvoicesListPage";
import BillingPlaceholderPage from "../BillingPlaceholderPage";
import Modal from "../../../components/ui/Modal";

export default function InvoicesListWithCreateModal() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isCreate = pathname === "/billing/invoices/create";

  return (
    <>
      <InvoicesListPage />
      {isCreate && (
        <Modal
          open={true}
          onClose={() => navigate("/billing/invoices")}
          title="Create Invoice"
          size="lg"
        >
          <BillingPlaceholderPage title="Create Invoice" backTo="/billing/invoices" inModal />
        </Modal>
      )}
    </>
  );
}
