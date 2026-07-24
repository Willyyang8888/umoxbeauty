import Link from "next/link";

import { Card } from "@/components/ui/card";
import { getTransactions } from "@/server/services/admin-service";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusOptions = [
  "ALL",
  "CREATED",
  "REQUIRES_PAYMENT",
  "PROCESSING",
  "SUCCEEDED",
  "FAILED",
  "CANCELED",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
  "DISPUTED"
] as const;

const gatewayOptions = ["ALL", "STRIPE", "MONERIS"] as const;

export default async function TransactionsPage({
  searchParams
}: {
  searchParams: Promise<{
    status?: string;
    gateway?: string;
    email?: string;
    minAmount?: string;
    maxAmount?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const filters = await searchParams;
  const transactions = await getTransactions({
    status: (filters.status as typeof statusOptions[number] | undefined) ?? "ALL",
    gateway: (filters.gateway as typeof gatewayOptions[number] | undefined) ?? "ALL",
    email: filters.email,
    minAmount: filters.minAmount ? Math.round(Number(filters.minAmount) * 100) : undefined,
    maxAmount: filters.maxAmount ? Math.round(Number(filters.maxAmount) * 100) : undefined,
    from: filters.from,
    to: filters.to
  });
  const exportQuery = new URLSearchParams(
    Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1]))
  ).toString();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">Transactions</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Latest support transactions</h1>
      </div>

      <Card>
        <form className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <select
            name="status"
            defaultValue={filters.status ?? "ALL"}
            className="h-11 rounded-2xl border border-black/10 bg-white px-3 text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            name="gateway"
            defaultValue={filters.gateway ?? "ALL"}
            className="h-11 rounded-2xl border border-black/10 bg-white px-3 text-sm"
          >
            {gatewayOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            name="email"
            defaultValue={filters.email ?? ""}
            placeholder="Email search"
            className="h-11 rounded-2xl border border-black/10 bg-white px-3 text-sm"
          />
          <input
            name="minAmount"
            defaultValue={filters.minAmount ?? ""}
            placeholder="Min CAD"
            className="h-11 rounded-2xl border border-black/10 bg-white px-3 text-sm"
          />
          <input
            name="maxAmount"
            defaultValue={filters.maxAmount ?? ""}
            placeholder="Max CAD"
            className="h-11 rounded-2xl border border-black/10 bg-white px-3 text-sm"
          />
          <div className="flex gap-2">
            <button className="flex-1 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white" type="submit">
              Filter
            </button>
            <Link
              href={exportQuery ? `/api/admin/export/transactions.csv?${exportQuery}` : "/api/admin/export/transactions.csv"}
              className="rounded-full border border-black/10 px-4 py-3 text-sm font-semibold text-ink"
            >
              CSV
            </Link>
          </div>
          <input
            name="from"
            type="date"
            defaultValue={filters.from ?? ""}
            className="h-11 rounded-2xl border border-black/10 bg-white px-3 text-sm"
          />
          <input
            name="to"
            type="date"
            defaultValue={filters.to ?? ""}
            className="h-11 rounded-2xl border border-black/10 bg-white px-3 text-sm"
          />
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="pb-3">Support ID</th>
                <th className="pb-3">Gateway</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Card</th>
                <th className="pb-3">Created</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-black/5">
                  <td className="py-3">{transaction.publicReference}</td>
                  <td className="py-3">{transaction.gateway}</td>
                  <td className="py-3">{transaction.donorEmail}</td>
                  <td className="py-3">{formatCurrency(transaction.amount, transaction.currency)}</td>
                  <td className="py-3">{transaction.status}</td>
                  <td className="py-3">
                    {transaction.cardBrand && transaction.cardLast4
                      ? `${transaction.cardBrand} ending ${transaction.cardLast4}`
                      : "Not stored"}
                  </td>
                  <td className="py-3">{formatDate(transaction.createdAt)}</td>
                  <td className="py-3">
                    <Link
                      href={`/admin/transactions/${transaction.publicReference}`}
                      className="text-sm font-semibold text-brand-dark"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 ? (
                <tr>
                  <td className="py-6 text-zinc-500" colSpan={8}>
                    No transactions available yet.
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
