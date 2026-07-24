import { PaymentGatewayName, SupportTransactionStatus, WebhookProcessingStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  webhookEvent: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  },
  supportTransaction: {
    findFirst: vi.fn(),
    update: vi.fn()
  },
  supportSession: {
    update: vi.fn()
  }
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock
}));

vi.mock("@/lib/receipt", () => ({
  dispatchReceipt: vi.fn()
}));

describe("Stripe webhook handling", () => {
  beforeEach(() => {
    prismaMock.webhookEvent.findUnique.mockReset();
    prismaMock.webhookEvent.create.mockReset();
    prismaMock.webhookEvent.update.mockReset();
    prismaMock.supportTransaction.findFirst.mockReset();
    prismaMock.supportTransaction.update.mockReset();
    prismaMock.supportSession.update.mockReset();
  });

  it("skips duplicated events", async () => {
    prismaMock.webhookEvent.findUnique.mockResolvedValue({ id: "evt-1" });
    const { handleStripeWebhookEvent } = await import("@/server/services/support-service");

    await expect(
      handleStripeWebhookEvent({
        eventId: "evt-1",
        eventType: "payment_intent.succeeded",
        payload: { id: "pi_1", status: "succeeded" }
      })
    ).resolves.toEqual({ duplicated: true });
  });

  it("updates transaction status on success", async () => {
    prismaMock.webhookEvent.findUnique.mockResolvedValue(null);
    prismaMock.supportTransaction.findFirst.mockResolvedValue({
      id: "txn-1",
      sessionId: "session-1",
      status: SupportTransactionStatus.PROCESSING
    });

    const { handleStripeWebhookEvent } = await import("@/server/services/support-service");

    await handleStripeWebhookEvent({
      eventId: "evt-2",
      eventType: "payment_intent.succeeded",
      payload: { id: "pi_2", status: "succeeded" }
    });

    expect(prismaMock.webhookEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          gateway: PaymentGatewayName.STRIPE,
          processingStatus: WebhookProcessingStatus.RECEIVED
        })
      })
    );
    expect(prismaMock.supportTransaction.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: SupportTransactionStatus.SUCCEEDED
        })
      })
    );
  });
});
