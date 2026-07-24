import Link from "next/link";
import { notFound } from "next/navigation";

import { SupportStatusCard } from "@/components/support/support-status-card";
import { Card } from "@/components/ui/card";
import { getPublicTransaction } from "@/server/services/support-service";

export default async function FailedPage({
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
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <SupportStatusCard
        title="Payment was not completed"
        description="The site shows a safe failure summary without exposing sensitive risk data. You can retry manually with the same or another enabled gateway."
        transaction={transaction}
      />
      <Card>
        <p className="text-sm font-semibold text-ink">Next steps</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/support?gateway=STRIPE" className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white">
            Retry with Stripe
          </Link>
          <Link
            href="/support?gateway=MONERIS"
            className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-ink"
          >
            Choose Moneris manually
          </Link>
        </div>
      </Card>
    </div>
  );
}
