import { Card } from "@/components/ui/card";
import { RefundForm } from "@/components/admin/refund-form";
import { getRefundCandidates } from "@/server/services/admin-service";
import { formatCurrency } from "@/lib/utils";

export default async function RefundsPage() {
  const candidates = await getRefundCandidates();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">Refunds</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Refund workflow</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <RefundForm transactions={candidates} />
        <Card>
          <p className="text-sm font-semibold text-ink">Refundable transactions</p>
          <div className="mt-4 space-y-3">
            {candidates.map((candidate) => {
              const refunded = candidate.refunds
                .filter((refund) => refund.status !== "FAILED")
                .reduce((sum, refund) => sum + refund.amount, 0);
              const refundable = Math.max(candidate.amount - refunded, 0);

              return (
                <div key={candidate.id} className="rounded-2xl border border-black/5 bg-zinc-50 p-4 text-sm">
                  <p className="font-medium text-ink">{candidate.publicReference}</p>
                  <p className="mt-1 text-zinc-600">{candidate.donorEmail}</p>
                  <p className="mt-1 text-zinc-600">
                    Refundable: {formatCurrency(refundable, candidate.currency)}
                  </p>
                </div>
              );
            })}
            {candidates.length === 0 ? (
              <p className="text-sm leading-7 text-zinc-600">
                No successful or partially refunded transactions are available for refund.
              </p>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
