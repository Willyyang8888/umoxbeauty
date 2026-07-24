import Link from "next/link";

import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

type SupportStatusCardProps = {
  title: string;
  description: string;
  transaction: {
    publicReference: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: Date;
    paidAt: Date | null;
    receiptDispatches?: Array<{ status: string }>;
  };
};

export function SupportStatusCard({ title, description, transaction }: SupportStatusCardProps) {
  return (
    <Card className="mx-auto max-w-2xl">
      <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">Support status</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{title}</h1>
      <p className="mt-3 text-sm leading-7 text-zinc-600">{description}</p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-zinc-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Reference</dt>
          <dd className="mt-2 text-sm font-medium text-ink">{transaction.publicReference}</dd>
        </div>
        <div className="rounded-2xl bg-zinc-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Amount</dt>
          <dd className="mt-2 text-sm font-medium text-ink">
            {formatCurrency(transaction.amount, transaction.currency)}
          </dd>
        </div>
        <div className="rounded-2xl bg-zinc-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Created</dt>
          <dd className="mt-2 text-sm font-medium text-ink">{formatDate(transaction.createdAt)}</dd>
        </div>
        <div className="rounded-2xl bg-zinc-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Current status</dt>
          <dd className="mt-2 text-sm font-medium text-ink">{transaction.status}</dd>
        </div>
      </dl>

      <p className="mt-6 text-sm text-zinc-600">
        Email receipt status: {transaction.receiptDispatches?.[0]?.status ?? "pending or not configured"}.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/support" className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white">
          Return to support page
        </Link>
        <Link href="/" className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-ink">
          Back to homepage
        </Link>
      </div>
    </Card>
  );
}
