import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    supportTransaction: {
      findMany
    }
  }
}));

describe("transaction CSV export", () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it("renders CSV rows with escaped values", async () => {
    findMany.mockResolvedValue([
      {
        publicReference: "TRX-1",
        gateway: "STRIPE",
        gatewayTransactionId: "ch_1",
        amount: 2500,
        currency: "CAD",
        status: "SUCCEEDED",
        donorName: 'Doe, "Jane"',
        donorEmail: "jane@example.com",
        isAnonymous: false,
        cardBrand: "visa",
        cardLast4: "4242",
        paidAt: new Date("2026-07-22T12:00:00.000Z"),
        createdAt: new Date("2026-07-22T11:00:00.000Z"),
        refunds: [],
        receiptDispatches: [{ status: "SENT" }]
      }
    ]);

    const { exportTransactionsCsv } = await import("@/server/services/admin-service");
    const csv = await exportTransactionsCsv();

    expect(csv).toContain('"TRX-1"');
    expect(csv).toContain('"Doe, ""Jane"""');
    expect(csv).toContain('"SENT"');
  });
});
