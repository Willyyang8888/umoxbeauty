import Link from "next/link";
import { PaymentGatewayName } from "@prisma/client";
import { Shield, Lock, CreditCard, ArrowLeft } from "lucide-react";

import { Card } from "@/components/ui/card";
import { SupportCheckoutForm } from "@/components/support/support-checkout-form";
import { env } from "@/lib/env";
import { getSiteContent } from "@/lib/content";
import { getSupportPageGatewayOptions } from "@/server/services/support-service";

const trustItems = [
  { icon: Shield, label: "Operated by a Canadian company" },
  { icon: Lock, label: "Secure processing" },
  { icon: CreditCard, label: "One-time CAD payment" }
];

export default async function SupportPage({
  searchParams
}: {
  searchParams: Promise<{ gateway?: string }>;
}) {
  const query = await searchParams;
  const content = await getSiteContent();
  const gatewayOptions = await getSupportPageGatewayOptions();
  const presetAmounts = Array.isArray(content.presetAmounts)
    ? (content.presetAmounts as number[])
    : [1000, 2500, 5000, 10000];
  const initialGateway =
    query.gateway === PaymentGatewayName.MONERIS &&
    gatewayOptions.enabledGateways.includes(PaymentGatewayName.MONERIS)
      ? PaymentGatewayName.MONERIS
      : gatewayOptions.defaultGateway;

  const stripeLive = Boolean(env.STRIPE_PUBLISHABLE_KEY);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">
              Support
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">
              Support Umox Beauty
            </h1>
            <p className="mt-4 text-base leading-8 text-zinc-600">
              Help us continue building and improving Umox Beauty.
            </p>
          </div>

          <div className="grid gap-3">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-2xl border border-black/5 bg-zinc-50/60 px-5 py-4"
              >
                <item.icon className="h-4 w-4 text-brand" />
                <span className="text-sm font-medium text-zinc-700">{item.label}</span>
              </div>
            ))}
          </div>

          <Card>
            <p className="text-sm font-semibold text-ink">Where your support goes</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-zinc-600">
              <li>App development</li>
              <li>AI &amp; recommendation technology</li>
              <li>Testing, infrastructure, and operations</li>
            </ul>
            <p className="mt-4 text-xs leading-6 text-zinc-500">
              Voluntary one-time project support. Not an investment, equity, or charitable tax
              receipt.
            </p>
          </Card>
        </div>

        {stripeLive ? (
          <SupportCheckoutForm
            presetAmounts={presetAmounts}
            stripeEnabled={Boolean(env.STRIPE_PUBLISHABLE_KEY)}
            stripePublishableKey={env.STRIPE_PUBLISHABLE_KEY ?? ""}
            enabledGateways={gatewayOptions.enabledGateways}
            initialGateway={initialGateway}
          />
        ) : (
          <Card className="flex flex-col items-center justify-center p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
              <CreditCard className="h-5 w-5 text-zinc-500" />
            </div>
            <p className="mt-6 text-base font-semibold text-ink">
              Online support is currently being prepared.
            </p>
            <p className="mt-2 text-sm leading-7 text-zinc-500">
              Please check back soon.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
