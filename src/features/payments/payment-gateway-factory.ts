import { PaymentGatewayName } from "@prisma/client";

import { MonerisGateway } from "@/features/payments/gateways/moneris-gateway";
import { StripeGateway } from "@/features/payments/gateways/stripe-gateway";
import type { PaymentGateway } from "@/features/payments/types";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

type GatewaySummary = {
  defaultGateway: PaymentGatewayName;
  enabledGateways: PaymentGatewayName[];
  stripeEnabled: boolean;
  monerisEnabled: boolean;
};

export async function getGatewaySummary(): Promise<GatewaySummary> {
  try {
    const configs = await prisma.gatewayConfiguration.findMany();

    const defaultConfig = configs.find((item) => item.isDefault && item.enabled);
    const stripeEnabled = configs.some((item) => item.gateway === PaymentGatewayName.STRIPE && item.enabled);
    const monerisEnabled = configs.some((item) => item.gateway === PaymentGatewayName.MONERIS && item.enabled);

    if (defaultConfig) {
      return {
        defaultGateway: defaultConfig.gateway,
        enabledGateways: configs.filter((item) => item.enabled).map((item) => item.gateway),
        stripeEnabled,
        monerisEnabled
      };
    }

    if (stripeEnabled) {
      return {
        defaultGateway: PaymentGatewayName.STRIPE,
        enabledGateways: configs.filter((item) => item.enabled).map((item) => item.gateway),
        stripeEnabled,
        monerisEnabled
      };
    }

    if (monerisEnabled) {
      return {
        defaultGateway: PaymentGatewayName.MONERIS,
        enabledGateways: configs.filter((item) => item.enabled).map((item) => item.gateway),
        stripeEnabled,
        monerisEnabled
      };
    }
  } catch {
    // Fallback to Stripe when the database is not ready yet.
  }

  return {
    defaultGateway: PaymentGatewayName.STRIPE,
    enabledGateways: [PaymentGatewayName.STRIPE],
    stripeEnabled: true,
    monerisEnabled: false
  };
}

export async function getDefaultGateway(): Promise<PaymentGatewayName> {
  const summary = await getGatewaySummary();
  return summary.defaultGateway;
}

export async function resolveCheckoutGateway(
  preferredGateway?: PaymentGatewayName
): Promise<PaymentGatewayName> {
  const summary = await getGatewaySummary();
  const requested = preferredGateway ?? summary.defaultGateway;

  if (!summary.enabledGateways.includes(requested)) {
    throw new Error("The selected payment gateway is currently unavailable.");
  }

  if (requested === PaymentGatewayName.STRIPE && !env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is enabled but not fully configured.");
  }

  if (requested === PaymentGatewayName.MONERIS && env.MONERIS_ENVIRONMENT !== "test" && !env.MONERIS_STORE_ID) {
    throw new Error("Moneris is enabled but not fully configured.");
  }

  return requested;
}

export async function createPaymentGateway(preferredGateway?: PaymentGatewayName): Promise<PaymentGateway> {
  const gateway = preferredGateway ?? (await getDefaultGateway());

  if (gateway === PaymentGatewayName.MONERIS) {
    return new MonerisGateway();
  }

  return new StripeGateway();
}
