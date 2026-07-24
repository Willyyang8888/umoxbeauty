import { PaymentGatewayName } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    gatewayConfiguration: {
      findMany
    }
  }
}));

vi.mock("@/lib/env", () => ({
  env: {
    STRIPE_SECRET_KEY: "sk_test_123",
    MONERIS_ENVIRONMENT: "test",
    MONERIS_STORE_ID: undefined
  }
}));

describe("payment gateway factory", () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it("prefers configured default gateway", async () => {
    findMany.mockResolvedValue([
      { gateway: PaymentGatewayName.STRIPE, enabled: true, isDefault: true },
      { gateway: PaymentGatewayName.MONERIS, enabled: true, isDefault: false }
    ]);

    const { getDefaultGateway } = await import("@/features/payments/payment-gateway-factory");
    await expect(getDefaultGateway()).resolves.toBe(PaymentGatewayName.STRIPE);
  });

  it("falls back to Stripe when database access fails", async () => {
    findMany.mockRejectedValue(new Error("db unavailable"));

    const { getDefaultGateway } = await import("@/features/payments/payment-gateway-factory");
    await expect(getDefaultGateway()).resolves.toBe(PaymentGatewayName.STRIPE);
  });

  it("allows enabled Moneris selection in test mode", async () => {
    findMany.mockResolvedValue([
      { gateway: PaymentGatewayName.STRIPE, enabled: true, isDefault: false },
      { gateway: PaymentGatewayName.MONERIS, enabled: true, isDefault: true }
    ]);

    const { resolveCheckoutGateway } = await import("@/features/payments/payment-gateway-factory");
    await expect(resolveCheckoutGateway(PaymentGatewayName.MONERIS)).resolves.toBe(PaymentGatewayName.MONERIS);
  });
});
