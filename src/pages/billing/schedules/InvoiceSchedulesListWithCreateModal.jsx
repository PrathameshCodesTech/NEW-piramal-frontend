import { useLocation, useNavigate } from "react-router-dom";
import InvoiceSchedulesListPage from "./InvoiceSchedulesListPage";
import InvoiceScheduleCreatePage from "./InvoiceScheduleCreatePage";
import Modal from "../../../components/ui/Modal";

export default function InvoiceSchedulesListWithCreateModal() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isCreate = pathname === "/billing/schedules/create";

  return (
    <>
      <InvoiceSchedulesListPage />
      {isCreate && (
        <Modal
          open={true}
          onClose={() => navigate("/billing/schedules")}
          title="Create Invoice Schedule"
          size="lg"
        >
          <InvoiceScheduleCreatePage inModal />
        </Modal>
      )}
    </>
  );
}
