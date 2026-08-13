import {
  PaymentGatewayName,
  SupportTransactionStatus,
  WebhookProcessingStatus
} from "@prisma/client";
import crypto from "node:crypto";

import {
  createPaymentGateway,
  getGatewaySummary,
  resolveCheckoutGateway
} from "@/features/payments/payment-gateway-factory";
import { buildIdempotencyKey, generatePublicReference } from "@/lib/ids";
import { prisma } from "@/lib/prisma";
import { dispatchReceipt } from "@/lib/receipt";
import { canTransitionStatus, resolveStripeStatus } from "@/lib/transaction-status";
import { minAmountCents, maxAmountCents, validateAmount } from "@/features/support/schema";

type CheckoutInput = {
  amount: number;
  currency: "CAD";
  donorName: string;
  donorEmail: string;
  isAnonymous: boolean;
  message?: string;
  preferredGateway?: PaymentGatewayName;
};

async function ensureGatewaySettingsDefaults(): Promise<void> {
  try {
    const stripeConfig = await prisma.gatewayConfiguration.findUnique({
      where: { gateway: PaymentGatewayName.STRIPE }
    });

    if (!stripeConfig) {
      return;
    }

    const settings = stripeConfig.nonSensitiveSettings as
      | { minAmount?: number; maxAmount?: number }
      | null
      | undefined;

    const needsRewrite =
      !settings ||
      typeof settings.minAmount !== "number" ||
      settings.minAmount > maxAmountCents ||
      settings.minAmount < minAmountCents ||
      typeof settings.maxAmount !== "number" ||
      settings.maxAmount > maxAmountCents ||
      settings.maxAmount < minAmountCents ||
      settings.minAmount === 1000;

    if (!needsRewrite) {
      return;
    }

    const normalized = {
      ...(settings ?? {}),
      minAmount:
        typeof settings?.minAmount === "number" &&
        settings.minAmount >= minAmountCents &&
        settings.minAmount <= maxAmountCents
          ? settings.minAmount
          : minAmountCents,
      maxAmount:
        typeof settings?.maxAmount === "number" &&
        settings.maxAmount >= minAmountCents &&
        settings.maxAmount <= maxAmountCents
          ? settings.maxAmount
          : maxAmountCents
    };

    await prisma.gatewayConfiguration.update({
      where: { id: stripeConfig.id },
      data: { nonSensitiveSettings: normalized }
    });
  } catch {
    // no-op: DB misshape never blocks public checkout
  }
}

async function getGatewayAmountBounds(): Promise<{ min: number; max: number }> {
  try {
    await ensureGatewaySettingsDefaults();
    const stripeConfig = await prisma.gatewayConfiguration.findUnique({
      where: { gateway: PaymentGatewayName.STRIPE }
    });
    const settings = stripeConfig?.nonSensitiveSettings as
      | { minAmount?: number; maxAmount?: number }
      | null
      | undefined;

    const configuredMin =
      typeof settings?.minAmount === "number"
        ? Math.max(minAmountCents, Math.min(maxAmountCents, settings.minAmount))
        : minAmountCents;
    const configuredMax =
      typeof settings?.maxAmount === "number"
        ? Math.min(maxAmountCents, Math.max(minAmountCents, settings.maxAmount))
        : maxAmountCents;
    return { min: configuredMin, max: configuredMax };
  } catch {
    return { min: minAmountCents, max: maxAmountCents };
  }
}

export async function createCheckoutSession(input: CheckoutInput) {
  const { min: minAllowed, max: maxAllowed } = await getGatewayAmountBounds();

  if (!validateAmount(input.amount) || input.amount < minAllowed || input.amount > maxAllowed) {
    const formatCad = (cents: number) =>
      new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(cents / 100);
    throw new Error(
      `Support amount must be between ${formatCad(minAllowed)} and ${formatCad(maxAllowed)}.`
    );
  }

  const sessionReference = generatePublicReference("SUP");
  const transactionReference = generatePublicReference("TRX");
  const selectedGateway = await resolveCheckoutGateway(input.preferredGateway);
  const gateway = await createPaymentGateway(selectedGateway);

  const normalizedName = input.donorName.trim() || "Anonymous Supporter";
  const normalizedEmail = input.donorEmail.trim();

  const session = await prisma.supportSession.create({
    data: {
      publicReference: sessionReference,
      paymentLabel: "SUPPORT",
      requestedAmount: input.amount,
      currency: input.currency,
      donorName: normalizedName,
      donorEmail: normalizedEmail,
      isAnonymous: input.isAnonymous || !normalizedEmail,
      message: input.message,
      status: SupportTransactionStatus.CREATED
    }
  });

  const transaction = await prisma.supportTransaction.create({
    data: {
      sessionId: session.id,
      publicReference: transactionReference,
      gateway: selectedGateway,
      amount: input.amount,
      currency: input.currency,
      status: SupportTransactionStatus.CREATED,
      donorName: normalizedName,
      donorEmail: normalizedEmail,
      isAnonymous: input.isAnonymous || !normalizedEmail,
      message: input.message
    }
  });

  const result = await gateway.createPayment({
    transactionId: transaction.id,
    publicReference: transaction.publicReference,
    amount: input.amount,
    currency: input.currency,
    donorEmail: normalizedEmail,
    donorName: normalizedName,
    returnUrl: ""
  });

  await prisma.paymentAttempt.create({
    data: {
      transactionId: transaction.id,
      gateway: selectedGateway,
      status: result.status,
      idempotencyKey: buildIdempotencyKey(sessionReference, selectedGateway),
      clientToken: result.clientSecret ?? result.checkoutUrl
    }
  });

  await prisma.supportTransaction.update({
    where: { id: transaction.id },
    data: {
      gatewayPaymentIntentId: result.gatewayPaymentIntentId,
      gatewayTransactionId: result.gatewayTransactionId,
      status: result.status
    }
  });

  await prisma.supportSession.update({
    where: { id: session.id },
    data: { status: result.status }
  });

  return {
    reference: transaction.publicReference,
    transactionId: transaction.id,
    gateway: result.gateway,
    clientSecret: result.clientSecret,
    checkoutUrl: result.checkoutUrl,
    status: result.status
  };
}

export async function getSupportPageGatewayOptions() {
  const [summary, bounds] = await Promise.all([
    getGatewaySummary(),
    getGatewayAmountBounds()
  ]);

  return {
    defaultGateway: summary.defaultGateway,
    enabledGateways: summary.enabledGateways,
    minAmountCents: bounds.min,
    maxAmountCents: bounds.max
  };
}

export async function getPublicTransaction(reference: string) {
  return prisma.supportTransaction.findUnique({
    where: { publicReference: reference },
    include: {
      receiptDispatches: true
    }
  });
}

export async function handleStripeWebhookEvent(event: {
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
}) {
  const payloadHash = crypto.createHash("sha256").update(JSON.stringify(event.payload)).digest("hex");
  const paymentIntentId = typeof event.payload.id === "string" ? event.payload.id : undefined;

  const existing = await prisma.webhookEvent.findUnique({
    where: { gatewayEventId: event.eventId }
  });

  if (existing) {
    return { duplicated: true };
  }

  const transaction = paymentIntentId
    ? await prisma.supportTransaction.findFirst({
        where: { gatewayPaymentIntentId: paymentIntentId }
      })
    : null;

  await prisma.webhookEvent.create({
    data: {
      transactionId: transaction?.id,
      gateway: PaymentGatewayName.STRIPE,
      gatewayEventId: event.eventId,
      eventType: event.eventType,
      payloadHash,
      processingStatus: WebhookProcessingStatus.RECEIVED
    }
  });

  if (!transaction) {
    await prisma.webhookEvent.update({
      where: { gatewayEventId: event.eventId },
      data: {
        processingStatus: WebhookProcessingStatus.FAILED,
        errorMessage: "Transaction not found",
        processedAt: new Date()
      }
    });

    return { duplicated: false, updated: false };
  }

  const objectStatus = typeof event.payload.status === "string" ? event.payload.status : "processing";
  const nextStatus =
    event.eventType === "charge.refunded"
      ? SupportTransactionStatus.REFUNDED
      : event.eventType === "charge.dispute.created"
        ? SupportTransactionStatus.DISPUTED
        : resolveStripeStatus(objectStatus);

  const updateAllowed = canTransitionStatus(transaction.status, nextStatus);

  if (updateAllowed) {
    await prisma.supportTransaction.update({
      where: { id: transaction.id },
      data: {
        status: nextStatus,
        paidAt: nextStatus === SupportTransactionStatus.SUCCEEDED ? new Date() : transaction.paidAt,
        failureMessage: nextStatus === SupportTransactionStatus.FAILED ? "Payment failed" : transaction.failureMessage
      }
    });

    await prisma.supportSession.update({
      where: { id: transaction.sessionId },
      data: {
        status: nextStatus,
        successfulTransaction:
          nextStatus === SupportTransactionStatus.SUCCEEDED ? transaction.id : undefined
      }
    });

    if (nextStatus === SupportTransactionStatus.SUCCEEDED) {
      await dispatchReceipt(transaction.id);
    }
  }

  await prisma.webhookEvent.update({
    where: { gatewayEventId: event.eventId },
    data: {
      processingStatus: updateAllowed ? WebhookProcessingStatus.PROCESSED : WebhookProcessingStatus.SKIPPED_DUPLICATE,
      processedAt: new Date()
    }
  });

  return { duplicated: false, updated: updateAllowed };
}

export async function completeMonerisTestPayment(
  reference: string,
  result: "SUCCEEDED" | "FAILED" | "CANCELED"
) {
  const transaction = await prisma.supportTransaction.findUnique({
    where: { publicReference: reference }
  });

  if (!transaction || transaction.gateway !== PaymentGatewayName.MONERIS) {
    throw new Error("Moneris test transaction not found.");
  }

  const gatewayEventId = `moneris-test:${reference}:${result}`;
  const existing = await prisma.webhookEvent.findUnique({
    where: { gatewayEventId }
  });

  if (!existing) {
    const payload = { reference, result, gateway: "MONERIS_TEST" };
    const payloadHash = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");

    await prisma.webhookEvent.create({
      data: {
        transactionId: transaction.id,
        gateway: PaymentGatewayName.MONERIS,
        gatewayEventId,
        eventType: `moneris.test.${result.toLowerCase()}`,
        payloadHash,
        processingStatus: WebhookProcessingStatus.RECEIVED
      }
    });
  }

  const nextStatus =
    result === "SUCCEEDED"
      ? SupportTransactionStatus.SUCCEEDED
      : result === "CANCELED"
        ? SupportTransactionStatus.CANCELED
        : SupportTransactionStatus.FAILED;

  if (canTransitionStatus(transaction.status, nextStatus)) {
    await prisma.supportTransaction.update({
      where: { id: transaction.id },
      data: {
        status: nextStatus,
        paidAt: nextStatus === SupportTransactionStatus.SUCCEEDED ? new Date() : transaction.paidAt,
        failureMessage:
          nextStatus === SupportTransactionStatus.FAILED ? "Moneris test payment failed." : transaction.failureMessage
      }
    });

    await prisma.supportSession.update({
      where: { id: transaction.sessionId },
      data: {
        status: nextStatus,
        successfulTransaction:
          nextStatus === SupportTransactionStatus.SUCCEEDED ? transaction.id : undefined
      }
    });

    if (nextStatus === SupportTransactionStatus.SUCCEEDED) {
      await dispatchReceipt(transaction.id);
    }
  }

  await prisma.webhookEvent.update({
    where: { gatewayEventId },
    data: {
      processingStatus: WebhookProcessingStatus.PROCESSED,
      processedAt: new Date()
    }
  });

  return nextStatus;
}
