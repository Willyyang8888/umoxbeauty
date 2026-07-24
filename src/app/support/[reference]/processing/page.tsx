import { notFound, redirect } from "next/navigation";

import { SupportStatusCard } from "@/components/support/support-status-card";
import { getPublicTransaction } from "@/server/services/support-service";

export default async function ProcessingPage({
  params
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const transaction = await getPublicTransaction(reference);

  if (!transaction) {
    notFound();
  }

  if (transaction.status === "SUCCEEDED") {
    redirect(`/support/${reference}/success`);
  }

  if (["FAILED", "CANCELED"].includes(transaction.status)) {
    redirect(`/support/${reference}/failed`);
  }

  return (
    <div className="px-6 py-12">
      <SupportStatusCard
        title="Payment processing"
        description="The system is confirming the payment result. You can safely refresh this page and should not submit the payment again."
        transaction={transaction}
      />
    </div>
  );
}
