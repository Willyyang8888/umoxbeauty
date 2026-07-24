import { notFound, redirect } from "next/navigation";

import { MonerisTestPanel } from "@/components/support/moneris-test-panel";
import { getPublicTransaction } from "@/server/services/support-service";

export default async function MonerisTestPage({
  params
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const transaction = await getPublicTransaction(reference);

  if (!transaction || transaction.gateway !== "MONERIS") {
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
      <MonerisTestPanel
        reference={reference}
        amount={transaction.amount}
        currency={transaction.currency}
      />
    </div>
  );
}
