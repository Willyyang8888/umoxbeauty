import { canRefund, maxAmountCents, minAmountCents, validateAmount } from "@/features/support/schema";

describe("amount validation", () => {
  it("accepts values within configured range", () => {
    expect(validateAmount(minAmountCents)).toBe(true);
    expect(validateAmount(maxAmountCents)).toBe(true);
  });

  it("rejects values outside configured range", () => {
    expect(validateAmount(minAmountCents - 1)).toBe(false);
    expect(validateAmount(maxAmountCents + 1)).toBe(false);
  });

  it("prevents refunds above available amount", () => {
    expect(canRefund(10_000, 5_000)).toBe(true);
    expect(canRefund(10_000, 10_001)).toBe(false);
  });
});
