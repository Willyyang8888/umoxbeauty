"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function MonerisTestPanel({
  reference,
  amount,
  currency
}: {
  reference: string;
  amount: number;
  currency: string;
}) {
  const [loading, setLoading] = useState<null | "SUCCEEDED" | "FAILED" | "CANCELED">(null);
  const [error, setError] = useState<string | null>(null);

  async function simulate(result: "SUCCEEDED" | "FAILED" | "CANCELED") {
    setLoading(result);
    setError(null);

    const response = await fetch(`/api/support/${reference}/moneris-test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ result })
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Unable to complete simulated Moneris checkout.");
      setLoading(null);
      return;
    }

    window.location.href = payload.redirectTo;
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">Moneris test mode</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Simulated hosted checkout</h1>
      <p className="mt-3 text-sm leading-7 text-zinc-600">
        This is an internal test interface used until the actual Moneris account product and official
        hosted component are confirmed. It does not connect to a production Moneris endpoint.
      </p>
      <div className="mt-6 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700">
        Reference: {reference} | Amount: {formatCurrency(amount, currency)}
      </div>
      {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => simulate("SUCCEEDED")} disabled={loading !== null}>
          {loading === "SUCCEEDED" ? "Processing..." : "Simulate success"}
        </Button>
        <Button variant="secondary" onClick={() => simulate("FAILED")} disabled={loading !== null}>
          {loading === "FAILED" ? "Processing..." : "Simulate failure"}
        </Button>
        <Button variant="ghost" onClick={() => simulate("CANCELED")} disabled={loading !== null}>
          {loading === "CANCELED" ? "Processing..." : "Simulate cancel"}
        </Button>
      </div>
    </Card>
  );
}
