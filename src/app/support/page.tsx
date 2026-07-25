import { PaymentGatewayName } from "@prisma/client";

import { Card } from "@/components/ui/card";
import { SupportCheckoutForm } from "@/components/support/support-checkout-form";
import { env } from "@/lib/env";
import { getSiteContent } from "@/lib/content";
import { getSupportPageGatewayOptions } from "@/server/services/support-service";

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

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">Support</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">
              Support the official project
            </h1>
            <p className="mt-4 text-base leading-8 text-zinc-600">
              Choose a supported amount, provide only the information needed to process your
              contribution, and complete payment through a PCI-compliant hosted card component.
            </p>
          </div>
          <Card>
            <p className="text-sm font-semibold text-ink">Payment details</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-zinc-600">
              <li>Default settlement currency: CAD</li>
              <li>Default gateway: {gatewayOptions.defaultGateway}</li>
              <li>Enabled gateways: {gatewayOptions.enabledGateways.join(", ")}</li>
              {gatewayOptions.enabledGateways.includes(PaymentGatewayName.MONERIS) ? (
                <li>Moneris test mode uses an internal simulated hosted checkout flow</li>
              ) : null}
              <li>No tax receipt language by default</li>
            </ul>
          </Card>
          {!env.STRIPE_PUBLISHABLE_KEY ? (
            <Card className="border-amber-200 bg-amber-50">
              <p className="text-sm font-semibold text-amber-900">Stripe test key not configured yet</p>
              <p className="mt-2 text-sm leading-7 text-amber-800">
                Add `STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` to enable live test-mode card
                entry. The page still validates all non-card inputs and preserves the payment flow.
              </p>
            </Card>
          ) : null}
        </div>
        <SupportCheckoutForm
          presetAmounts={presetAmounts}
          stripeEnabled={Boolean(env.STRIPE_PUBLISHABLE_KEY)}
          stripePublishableKey={env.STRIPE_PUBLISHABLE_KEY ?? ""}
          enabledGateways={gatewayOptions.enabledGateways}
          initialGateway={initialGateway}
        />
      </div>
    </div>
  );
}
