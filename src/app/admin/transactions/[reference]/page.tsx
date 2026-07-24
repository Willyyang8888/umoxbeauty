import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { getTransactionDetails } from "@/server/services/admin-service";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function TransactionDetailPage({
  params
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const transaction = await getTransactionDetails(reference);

  if (!transaction) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">Transaction detail</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          {transaction.publicReference}
        </h1>
      </div>

      <Card className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Gateway" value={transaction.gateway} />
        <DetailItem label="Status" value={transaction.status} />
        <DetailItem label="Amount" value={formatCurrency(transaction.amount, transaction.currency)} />
        <DetailItem label="Created" value={formatDate(transaction.createdAt)} />
        <DetailItem label="Donor name" value={transaction.donorName} />
        <DetailItem label="Email" value={transaction.donorEmail} />
        <DetailItem
          label="Card"
          value={
            transaction.cardBrand && transaction.cardLast4
              ? `${transaction.cardBrand} ending ${transaction.cardLast4}`
              : "Not stored"
          }
        />
        <DetailItem label="Gateway ID" value={transaction.gatewayTransactionId ?? "Pending"} />
      </Card>

      <Card>
        <p className="text-sm font-semibold text-ink">Webhook events</p>
        <div className="mt-4 space-y-3">
          {transaction.webhookEvents.map((event) => (
            <div key={event.id} className="rounded-2xl border border-black/5 bg-zinc-50 p-4 text-sm">
              <p className="font-medium text-ink">
                {event.eventType} | {event.processingStatus}
              </p>
              <p className="mt-1 text-zinc-600">{formatDate(event.receivedAt)}</p>
              {event.errorMessage ? <p className="mt-1 text-red-600">{event.errorMessage}</p> : null}
            </div>
          ))}
          {transaction.webhookEvents.length === 0 ? (
            <p className="text-sm text-zinc-500">No webhook events recorded yet.</p>
          ) : null}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold text-ink">Refunds</p>
        <div className="mt-4 space-y-3">
          {transaction.refunds.map((refund) => (
            <div key={refund.id} className="rounded-2xl border border-black/5 bg-zinc-50 p-4 text-sm">
              <p className="font-medium text-ink">
                {formatCurrency(refund.amount, refund.currency)} | {refund.status}
              </p>
              <p className="mt-1 text-zinc-600">{refund.reason}</p>
            </div>
          ))}
          {transaction.refunds.length === 0 ? (
            <p className="text-sm text-zinc-500">No refunds recorded.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
