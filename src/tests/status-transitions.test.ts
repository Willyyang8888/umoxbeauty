import { canTransitionStatus, resolveStripeStatus } from "@/lib/transaction-status";

describe("transaction status transitions", () => {
  it("allows forward transitions", () => {
    expect(canTransitionStatus("CREATED", "PROCESSING")).toBe(true);
    expect(canTransitionStatus("SUCCEEDED", "PARTIALLY_REFUNDED")).toBe(true);
  });

  it("blocks regressive transitions", () => {
    expect(canTransitionStatus("SUCCEEDED", "FAILED")).toBe(false);
    expect(canTransitionStatus("REFUNDED", "SUCCEEDED")).toBe(false);
  });

  it("maps Stripe intent states", () => {
    expect(resolveStripeStatus("succeeded")).toBe("SUCCEEDED");
    expect(resolveStripeStatus("processing")).toBe("PROCESSING");
    expect(resolveStripeStatus("requires_payment_method")).toBe("REQUIRES_PAYMENT");
  });
});
