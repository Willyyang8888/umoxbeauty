"use client";

import { useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { PaymentGatewayName } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/field";
import { formatCurrency } from "@/lib/utils";

type SupportCheckoutFormProps = {
  presetAmounts: number[];
  stripeEnabled: boolean;
  stripePublishableKey: string;
  enabledGateways: PaymentGatewayName[];
  initialGateway: PaymentGatewayName;
};

type CheckoutResponse = {
  reference: string;
  gateway: "STRIPE" | "MONERIS";
  clientSecret?: string;
  checkoutUrl?: string;
};

export function SupportCheckoutForm({
  presetAmounts,
  stripeEnabled,
  stripePublishableKey,
  initialGateway
}: SupportCheckoutFormProps) {
  const [amount, setAmount] = useState(presetAmounts[1] ?? 2500);
  const [customAmount, setCustomAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferredGateway] = useState<PaymentGatewayName>(initialGateway);
  const [formData, setFormData] = useState({
    donorName: "",
    donorEmail: ""
  });

  const stripePromise = useMemo(() => {
    if (!stripeEnabled || !stripePublishableKey) {
      return null;
    }

    return loadStripe(stripePublishableKey);
  }, [stripeEnabled, stripePublishableKey]);

  async function handleCreateIntent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const selectedAmount = customAmount ? Math.round(Number(customAmount) * 100) : amount;

    try {
      const response = await fetch("/api/support/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: selectedAmount,
          currency: "CAD",
          donorName: formData.donorName,
          donorEmail: formData.donorEmail,
          isAnonymous: false,
          message: "",
          termsAccepted: true,
          preferredGateway
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to initialize payment.");
      }

      setClientSecret(payload.clientSecret ?? null);
      setCheckout(payload);

      if (payload.gateway === "MONERIS" && payload.checkoutUrl) {
        window.location.href = payload.checkoutUrl;
        return;
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to initialize payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <form className="space-y-5" onSubmit={handleCreateIntent}>
          <div>
            <p className="text-sm font-semibold text-ink">Choose an amount</p>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
                    amount === preset && !customAmount
                      ? "border-brand bg-brand-soft text-brand-dark"
                      : "border-black/10 bg-white text-ink"
                  }`}
                  onClick={() => {
                    setAmount(preset);
                    setCustomAmount("");
                  }}
                >
                  {formatCurrency(preset)}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-sm font-medium text-zinc-700" htmlFor="customAmount">
              Custom amount (CAD)
            </label>
            <Input
              id="customAmount"
              type="number"
              min="10"
              max="2000"
              step="0.01"
              placeholder="Enter a custom amount"
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value)}
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Your details</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="donorName">
                  Full name
                </label>
                <Input
                  id="donorName"
                  value={formData.donorName}
                  onChange={(event) => setFormData((current) => ({ ...current, donorName: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="donorEmail">
                  Email
                </label>
                <Input
                  id="donorEmail"
                  type="email"
                  value={formData.donorEmail}
                  onChange={(event) => setFormData((current) => ({ ...current, donorEmail: event.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          {!clientSecret ? (
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Preparing secure payment..." : "Continue to payment"}
            </Button>
          ) : null}

          <div className="space-y-1 text-center text-xs text-zinc-500">
            <p>Securely processed by Stripe.</p>
            <p>One-time payment • CAD • No account required.</p>
          </div>
        </form>

        {clientSecret && checkout?.gateway === "STRIPE" && stripePromise ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripeConfirmationPanel reference={checkout.reference} />
          </Elements>
        ) : null}
      </Card>
    </div>
  );
}

function StripeConfirmationPanel({ reference }: { reference: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/support/${reference}/processing`
      },
      redirect: "if_required"
    });

    if (result.error) {
      setError(result.error.message ?? "Payment confirmation failed.");
      setSubmitting(false);
      return;
    }

    window.location.href = `/support/${reference}/processing`;
  }

  return (
    <form className="mt-6 space-y-4 border-t border-black/5 pt-6" onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-semibold text-ink">Credit card payment</p>
        <p className="mt-2 text-sm leading-7 text-zinc-600">
          Card details are handled by Stripe&apos;s hosted payment element.
        </p>
      </div>
      <div className="rounded-2xl border border-black/10 bg-white p-4">
        <PaymentElement />
      </div>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <Button type="submit" disabled={!stripe || submitting} className="w-full">
        {submitting ? "Confirming payment..." : "Pay securely"}
      </Button>
    </form>
  );
}
