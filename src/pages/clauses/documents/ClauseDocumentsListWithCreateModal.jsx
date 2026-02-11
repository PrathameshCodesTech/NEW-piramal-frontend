import { useLocation, useNavigate } from "react-router-dom";
import ClauseDocumentsListPage from "./ClauseDocumentsListPage";
import ClauseDocumentUploadPage from "./ClauseDocumentUploadPage";
import Modal from "../../../components/ui/Modal";

export default function ClauseDocumentsListWithCreateModal() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isUpload = pathname === "/clauses/documents/upload";

  return (
    <>
      <ClauseDocumentsListPage />
      {isUpload && (
        <Modal
          open={true}
          onClose={() => navigate("/clauses/documents")}
          title="Upload Document"
          size="xl"
        >
          <ClauseDocumentUploadPage inModal />
        </Modal>
      )}
    </>
  );
}
