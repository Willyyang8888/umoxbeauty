import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();
const upsert = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    receiptDispatch: {
      findUnique,
      upsert
    },
    supportTransaction: {
      findUnique: vi.fn()
    }
  }
}));

describe("receipt idempotency", () => {
  beforeEach(() => {
    findUnique.mockReset();
    upsert.mockReset();
  });

  it("returns existing sent receipt without re-sending", async () => {
    findUnique.mockResolvedValue({ id: "receipt-1", status: "SENT" });

    const { dispatchReceipt } = await import("@/lib/receipt");
    const result = await dispatchReceipt("txn-1");

    expect(result).toEqual({ id: "receipt-1", status: "SENT" });
    expect(upsert).not.toHaveBeenCalled();
  });
});
