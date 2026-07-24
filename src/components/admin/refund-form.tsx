"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/field";
import { formatCurrency } from "@/lib/utils";

type RefundCandidate = {
  id: string;
  publicReference: string;
  donorEmail: string;
  amount: number;
  currency: string;
  refunds: Array<{ amount: number; status: string }>;
};

export function RefundForm({ transactions }: { transactions: RefundCandidate[] }) {
  const [transactionId, setTransactionId] = useState(transactions[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activeTransaction = transactions.find((item) => item.id === transactionId);
  const alreadyRefunded = activeTransaction?.refunds
    .filter((refund) => refund.status !== "FAILED")
    .reduce((sum, refund) => sum + refund.amount, 0) ?? 0;
  const refundable = activeTransaction ? Math.max(activeTransaction.amount - alreadyRefunded, 0) : 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);

    const response = await fetch("/api/admin/refunds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transactionId,
        amount: Math.round(Number(amount) * 100),
        reason,
        confirm
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Unable to create refund.");
      setLoading(false);
      return;
    }

    setStatus("Refund request completed and transaction status was updated.");
    setAmount("");
    setReason("");
    setConfirm(false);
    setLoading(false);
  }

  return (
    <Card>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="refundTransaction">
            Transaction
          </label>
          <select
            id="refundTransaction"
            className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm"
            value={transactionId}
            onChange={(event) => setTransactionId(event.target.value)}
          >
            {transactions.map((transaction) => (
              <option key={transaction.id} value={transaction.id}>
                {transaction.publicReference} | {transaction.donorEmail} |{" "}
                {formatCurrency(transaction.amount, transaction.currency)}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700">
          Refundable amount: {formatCurrency(refundable, activeTransaction?.currency ?? "CAD")}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="refundAmount">
            Refund amount
          </label>
          <Input
            id="refundAmount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="refundReason">
            Refund reason
          </label>
          <Textarea
            id="refundReason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
          />
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-black/10 bg-zinc-50 p-4 text-sm text-zinc-700">
          <input type="checkbox" checked={confirm} onChange={(event) => setConfirm(event.target.checked)} />
          I confirm this refund is intentional and should be recorded under my admin account.
        </label>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        {status ? <p className="text-sm font-medium text-brand-dark">{status}</p> : null}

        <Button type="submit" disabled={!transactions.length || loading}>
          {loading ? "Processing refund..." : "Submit refund"}
        </Button>
      </form>
    </Card>
  );
}
