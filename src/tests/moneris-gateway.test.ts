import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    MONERIS_ENVIRONMENT: "test"
  }
}));

describe("Moneris gateway test mode", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns an internal hosted checkout URL in test mode", async () => {
    const { MonerisGateway } = await import("@/features/payments/gateways/moneris-gateway");
    const gateway = new MonerisGateway();

    const result = await gateway.createPayment({
      transactionId: "txn_1",
      publicReference: "TRX-TEST-1",
      amount: 5000,
      currency: "CAD",
      donorEmail: "donor@example.com",
      donorName: "Donor",
      returnUrl: ""
    });

    expect(result.gateway).toBe("MONERIS");
    expect(result.status).toBe("REQUIRES_PAYMENT");
    expect(result.checkoutUrl).toBe("/support/TRX-TEST-1/moneris-test");
  });

  it("returns a successful mock refund in test mode", async () => {
    const { MonerisGateway } = await import("@/features/payments/gateways/moneris-gateway");
    const gateway = new MonerisGateway();

    const result = await gateway.refundPayment({
      transactionId: "txn_1",
      amount: 2500,
      reason: "Requested by donor"
    });

    expect(result.status).toBe("SUCCEEDED");
  });
});
