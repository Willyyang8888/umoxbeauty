import { Card } from "@/components/ui/card";
import { getReleaseReadiness } from "@/lib/release-readiness";
import { getDashboardMetrics } from "@/server/services/admin-service";
import { formatCurrency, formatDate } from "@/lib/utils";

const labels = [
  { key: "totalCollected", title: "Total collected" },
  { key: "successCount", title: "Successful transactions" },
  { key: "failedCount", title: "Failed transactions" },
  { key: "processingCount", title: "Pending confirmation" },
  { key: "refundTotal", title: "Refund total" },
  { key: "webhookFailures", title: "Webhook failures" }
] as const;

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();
  const readiness = await getReleaseReadiness();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Operations overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {labels.map((item) => (
          <Card key={item.key}>
            <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">{item.title}</p>
            <p className="mt-3 text-2xl font-semibold text-ink">
              {item.key.includes("Collected") || item.key.includes("refund")
                ? formatCurrency(metrics[item.key as "totalCollected" | "refundTotal"])
                : metrics[item.key as "successCount" | "failedCount" | "processingCount" | "webhookFailures"]}
            </p>
          </Card>
        ))}
      </div>

      <Card className={readiness.canPublishToProduction ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}>
        <p className="text-sm font-semibold text-ink">Release readiness</p>
        <p className="mt-2 text-sm leading-7 text-zinc-700">
          {readiness.canPublishToProduction
            ? "Current configuration passes the production readiness gate."
            : "Production publishing is blocked until the listed readiness items are completed."}
        </p>
        {!readiness.canPublishToProduction ? (
          <ul className="mt-3 space-y-1 text-sm leading-7 text-zinc-700">
            {readiness.blockers.slice(0, 4).map((blocker) => (
              <li key={blocker}>- {blocker}</li>
            ))}
          </ul>
        ) : null}
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Recent transactions</p>
          <p className="text-sm text-zinc-500">
            Stripe {metrics.stripeCount} / Moneris {metrics.monerisCount}
          </p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="pb-3">Reference</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-black/5">
                  <td className="py-3">{transaction.publicReference}</td>
                  <td className="py-3">{transaction.donorEmail}</td>
                  <td className="py-3">{formatCurrency(transaction.amount, transaction.currency)}</td>
                  <td className="py-3">{transaction.status}</td>
                  <td className="py-3">{formatDate(transaction.createdAt)}</td>
                </tr>
              ))}
              {metrics.recentTransactions.length === 0 ? (
                <tr>
                  <td className="py-6 text-zinc-500" colSpan={5}>
                    No transactions yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
