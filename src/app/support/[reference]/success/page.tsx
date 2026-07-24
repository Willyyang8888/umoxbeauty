import { notFound } from "next/navigation";

import { SupportStatusCard } from "@/components/support/support-status-card";
import { getPublicTransaction } from "@/server/services/support-service";

export default async function SuccessPage({
  params
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const transaction = await getPublicTransaction(reference);

  if (!transaction) {
    notFound();
  }

  return (
    <div className="px-6 py-12">
      <SupportStatusCard
        title="Thank you for your support"
        description="This page reads the final state from the server-side database record rather than trusting a redirect alone."
        transaction={transaction}
      />
    </div>
  );
}
