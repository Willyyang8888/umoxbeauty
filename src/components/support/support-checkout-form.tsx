"use client";

import { useCallback, useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { PaymentGatewayName } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { formatCurrency } from "@/lib/utils";

type SupportCheckoutFormProps = {
  presetAmounts: number[];
  stripeEnabled: boolean;
  stripePublishableKey: string;
  enabledGateways: PaymentGatewayName[];
  initialGateway: PaymentGatewayName;
  minAmountCents: number;
  maxAmountCents: number;
};

type CheckoutResponse = {
  reference: string;
  gateway: "STRIPE" | "MONERIS";
  clientSecret?: string;
  checkoutUrl?: string;
};

const formatCad = (cents: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(cents / 100);

export function SupportCheckoutForm({
  presetAmounts,
  stripeEnabled,
  stripePublishableKey,
  initialGateway,
  minAmountCents,
  maxAmountCents
}: SupportCheckoutFormProps) {
  const [amount, setAmount] = useState(presetAmounts[1] ?? 2500);
  const [customAmount, setCustomAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [busy, setBusy] = useState(false);
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

  const elementsOptions = useMemo(() => {
    if (!clientSecret) return undefined;
    return {
      clientSecret,
      appearance: {
        theme: "stripe" as const
      }
    };
  }, [clientSecret]);

  const selectedAmount = customAmount ? Math.round(Number(customAmount) * 100) : amount;

  const selectedAmountValid =
    Number.isFinite(selectedAmount) &&
    selectedAmount >= minAmountCents &&
    selectedAmount <= maxAmountCents;

  const customAmountInvalid =
    customAmount.trim() !== "" &&
    (!Number.isFinite(selectedAmount) ||
      selectedAmount < minAmountCents ||
      selectedAmount > maxAmountCents);

  async function createIntentNow() {
    if (!selectedAmountValid) {
      setError(
        customAmount
          ? `Minimum custom support amount is ${formatCad(minAmountCents)} (maximum ${formatCad(maxAmountCents)}).`
          : null
      );
      return false;
    }
    setBusy(true);
    setError(null);

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

      if (payload.gateway === "MONERIS" && payload.checkoutUrl) {
        window.location.href = payload.checkoutUrl;
        return false;
      }

      if (payload.clientSecret) {
        setClientSecret(payload.clientSecret);
        setCheckout(payload);
        return true;
      }

      throw new Error("Unable to initialize payment.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to initialize payment.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-5">
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
                    setClientSecret(null);
                    setCheckout(null);
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
              min={minAmountCents / 100}
              max={maxAmountCents / 100}
              step="0.01"
              placeholder={`Enter a custom amount (minimum ${formatCad(minAmountCents)})`}
              value={customAmount}
              aria-invalid={customAmountInvalid || undefined}
              className={
                customAmountInvalid
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
                  : undefined
              }
              onChange={(event) => {
                setCustomAmount(event.target.value);
                setClientSecret(null);
                setCheckout(null);
                if (error && customAmount !== event.target.value) {
                  setError(null);
                }
              }}
            />
            {customAmountInvalid ? (
              <p className="mt-2 text-sm font-medium text-red-600">
                Minimum custom support amount is {formatCad(minAmountCents)} (maximum{" "}
                {formatCad(maxAmountCents)}).
              </p>
            ) : null}
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
                  autoComplete="name"
                  value={formData.donorName}
                  onChange={(event) => {
                    setFormData((current) => ({ ...current, donorName: event.target.value }));
                    setClientSecret(null);
                    setCheckout(null);
                  }}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="donorEmail">
                  Email
                </label>
                <Input
                  id="donorEmail"
                  type="email"
                  autoComplete="email"
                  value={formData.donorEmail}
                  onChange={(event) => {
                    setFormData((current) => ({ ...current, donorEmail: event.target.value }));
                    setClientSecret(null);
                    setCheckout(null);
                  }}
                />
              </div>
            </div>
          </div>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <div className="space-y-1 text-center text-xs text-zinc-500">
            <p>Securely processed by Stripe.</p>
            <p>One-time payment • CAD • No account required.</p>
          </div>
        </div>

        {!clientSecret ? (
          <div className="mt-6 border-t border-black/5 pt-6">
            <Button
              type="button"
              onClick={createIntentNow}
              disabled={busy || !selectedAmountValid}
              title={
                !selectedAmountValid && customAmount
                  ? `Minimum custom support amount is ${formatCad(minAmountCents)} (maximum ${formatCad(maxAmountCents)}).`
                  : undefined
              }
              className="w-full"
            >
              {busy ? "Preparing secure payment..." : "Confirm donation"}
            </Button>
            {!selectedAmountValid && customAmount ? (
              <p className="mt-2 text-center text-sm font-medium text-red-600">
                Minimum custom support amount is {formatCad(minAmountCents)}.
              </p>
            ) : null}
          </div>
        ) : null}

        {clientSecret && checkout?.gateway === "STRIPE" && stripePromise && elementsOptions ? (
          <Elements stripe={stripePromise} options={elementsOptions}>
            <StripeConfirmationPanel
              reference={checkout.reference}
              disabled={busy}
            />
          </Elements>
        ) : null}
      </Card>
    </div>
  );
}

function StripeConfirmationPanel({ reference, disabled }: { reference: string; disabled?: boolean }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!stripe || !elements) {
        return;
      }

      setSubmitting(true);
      setError(null);

      const timeoutId = window.setTimeout(() => {
        setError("Payment is taking longer than expected. You can try again or check your bank for a pending charge.");
        setSubmitting(false);
      }, 20000);

      try {
        const submitResult = await elements.submit();
        if (submitResult.error) {
          window.clearTimeout(timeoutId);
          setError(submitResult.error.message ?? "Please complete your card details.");
          setSubmitting(false);
          return;
        }

        const result = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/support/${reference}/processing`
          }
        });

        window.clearTimeout(timeoutId);

        if (result.error) {
          setError(result.error.message ?? "Payment confirmation failed.");
          setSubmitting(false);
          return;
        }

        const finalResult = result as unknown as { paymentIntent?: { status: string } };

        if (finalResult.paymentIntent) {
          const s = finalResult.paymentIntent.status;
          if (s === "succeeded" || s === "processing" || s === "requires_action") {
            window.location.href = `/support/${reference}/processing`;
            return;
          }
          if (s === "requires_payment_method") {
            setError("Payment was not completed. Please check your card details and try again.");
            setSubmitting(false);
            return;
          }
          setError("Payment was not completed. Please check your card details and try again.");
          setSubmitting(false);
          return;
        }

        window.location.href = `/support/${reference}/processing`;
      } catch (err) {
        window.clearTimeout(timeoutId);
        setError(err instanceof Error ? err.message : "Payment confirmation failed.");
        setSubmitting(false);
      }
    },
    [stripe, elements, reference]
  );

  return (
    <form className="mt-6 space-y-4 border-t border-black/5 pt-6" onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-black/10 bg-white p-4">
        <PaymentElement
          options={{
            layout: { type: "tabs" as const },
            wallets: {
              link: "never" as const
            },
            fields: {
              billingDetails: {
                name: "never",
                email: "never",
                phone: "never",
                address: {
                  country: "never",
                  postalCode: "never"
                }
              }
            }
          } as any}
        />
      </div>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <Button type="submit" disabled={!stripe || submitting || disabled} className="w-full">
        {submitting ? "Confirming donation..." : "Confirm donation"}
      </Button>
    </form>
  );
}
