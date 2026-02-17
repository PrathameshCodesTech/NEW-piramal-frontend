import { useLocation, useNavigate } from "react-router-dom";
import InvoicesListPage from "./InvoicesListPage";
import InvoiceCreatePage from "./InvoiceCreatePage";
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
          <InvoiceCreatePage inModal />
        </Modal>
      )}
    </>
  );
}
