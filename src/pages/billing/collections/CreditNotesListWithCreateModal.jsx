import { useLocation, useNavigate } from "react-router-dom";
import CreditNotesListPage from "./CreditNotesListPage";
import CreditNoteCreatePage from "./CreditNoteCreatePage";
import Modal from "../../../components/ui/Modal";

export default function CreditNotesListWithCreateModal() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isCreate = pathname === "/billing/collections/credit-notes/create";

  return (
    <>
      <CreditNotesListPage />
      {isCreate && (
        <Modal open={true} onClose={() => navigate("/billing/collections/credit-notes")} title="Create Credit Note" size="md">
          <CreditNoteCreatePage inModal />
        </Modal>
      )}
    </>
  );
}
