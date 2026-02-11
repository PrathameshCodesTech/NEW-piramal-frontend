import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";

export default function BillingPlaceholderPage({ title = "Page", backTo = "/billing", inModal = false }) {
  const content = (
    <Card className={inModal ? "p-6 text-center border-0 shadow-none" : "p-8 text-center"}>
      <p className="text-gray-500">This page is under construction. Structure is in place.</p>
    </Card>
  );
  if (inModal) return content;
  return (
    <div>
      <PageHeader title={title} backTo={backTo} />
      {content}
    </div>
  );
}
