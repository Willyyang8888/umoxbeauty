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
  enabledGateways,
  initialGateway
}: SupportCheckoutFormProps) {
  const [amount, setAmount] = useState(presetAmounts[1] ?? 2500);
  const [customAmount, setCustomAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferredGateway, setPreferredGateway] = useState<PaymentGatewayName>(initialGateway);
  const [formData, setFormData] = useState({
    donorName: "",
    donorEmail: "",
    isAnonymous: false,
    message: "",
    termsAccepted: false
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
          isAnonymous: formData.isAnonymous,
          message: formData.message,
          termsAccepted: formData.termsAccepted,
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
            <p className="text-sm font-semibold text-ink">Choose a payment gateway</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setPreferredGateway("STRIPE")}
                disabled={!enabledGateways.includes("STRIPE")}
                className={`rounded-2xl border px-4 py-4 text-left text-sm transition ${
                  preferredGateway === "STRIPE"
                    ? "border-brand bg-brand-soft text-brand-dark"
                    : "border-black/10 bg-white text-ink"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <span className="block font-semibold">Stripe</span>
                <span className="mt-1 block text-zinc-600">
                  Hosted Payment Element with webhook-confirmed status.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPreferredGateway("MONERIS")}
                disabled={!enabledGateways.includes("MONERIS")}
                className={`rounded-2xl border px-4 py-4 text-left text-sm transition ${
                  preferredGateway === "MONERIS"
                    ? "border-brand bg-brand-soft text-brand-dark"
                    : "border-black/10 bg-white text-ink"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <span className="block font-semibold">Moneris</span>
                <span className="mt-1 block text-zinc-600">
                  Internal test-mode simulation until merchant product configuration is confirmed.
                </span>
              </button>
            </div>
          </div>

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

          <div className="grid gap-4 md:grid-cols-2">
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

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="message">
              Message (optional)
            </label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(event) => setFormData((current) => ({ ...current, message: event.target.value }))}
              placeholder="Share a short note of support"
            />
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-black/10 bg-zinc-50 p-4 text-sm text-zinc-700">
            <input
              type="checkbox"
              className="mt-1"
              checked={formData.isAnonymous}
              onChange={(event) => setFormData((current) => ({ ...current, isAnonymous: event.target.checked }))}
            />
            Display my support anonymously in any future supporter acknowledgements.
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-black/10 bg-zinc-50 p-4 text-sm text-zinc-700">
            <input
              type="checkbox"
              className="mt-1"
              checked={formData.termsAccepted}
              onChange={(event) => setFormData((current) => ({ ...current, termsAccepted: event.target.checked }))}
              required
            />
            I agree to the payment, refund, privacy, and terms policies published on this site.
          </label>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <Button type="submit" disabled={loading}>
            {loading ? "Preparing secure payment..." : preferredGateway === "MONERIS" ? "Continue to Moneris test checkout" : "Continue to secure payment"}
          </Button>
        </form>
      </Card>

      {clientSecret && checkout?.gateway === "STRIPE" && stripePromise ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <StripeConfirmationPanel reference={checkout.reference} />
        </Elements>
      ) : null}
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
    <Card>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <p className="text-sm font-semibold text-ink">Credit card payment</p>
          <p className="mt-2 text-sm leading-7 text-zinc-600">
            Card details are handled by Stripe&apos;s hosted payment element. The final payment result
            is confirmed by server-side webhook processing.
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <PaymentElement />
        </div>
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        <Button type="submit" disabled={!stripe || submitting}>
          {submitting ? "Confirming payment..." : "Pay securely"}
        </Button>
      </form>
    </Card>
  );
}
