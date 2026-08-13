import Stripe from "stripe";

import { env } from "@/lib/env";
import { resolveStripeStatus } from "@/lib/transaction-status";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  GatewayWebhookEvent,
  PaymentGateway,
  PaymentStatusResult,
  RefundPaymentInput,
  RefundResult
} from "@/features/payments/types";

function getStripeClient() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not configured.");
  }

  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia"
  });
}

export class StripeGateway implements PaymentGateway {
  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const stripe = getStripeClient();
    const intent = await stripe.paymentIntents.create({
      amount: input.amount,
      currency: input.currency.toLowerCase(),
      receipt_email: input.donorEmail,
      payment_method_types: ["card"],
      metadata: {
        transactionId: input.transactionId,
        donorEmail: input.donorEmail,
        donorName: input.donorName,
        ...input.metadata
      }
    });

    return {
      gateway: "STRIPE",
      transactionId: input.transactionId,
      gatewayPaymentIntentId: intent.id,
      clientSecret: intent.client_secret ?? undefined,
      status: resolveStripeStatus(intent.status)
    };
  }

  async getPaymentStatus(paymentIntentId: string): Promise<PaymentStatusResult> {
    const stripe = getStripeClient();
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      status: resolveStripeStatus(intent.status),
      gatewayTransactionId: intent.latest_charge ? String(intent.latest_charge) : undefined,
      raw: intent
    };
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundResult> {
    const stripe = getStripeClient();
    const refund = await stripe.refunds.create({
      payment_intent: input.gatewayPaymentIntentId,
      amount: input.amount,
      metadata: {
        transactionId: input.transactionId,
        reason: input.reason
      }
    });

    return {
      gatewayRefundId: refund.id,
      status: refund.status === "failed" ? "FAILED" : refund.status === "pending" ? "PENDING" : "SUCCEEDED",
      amount: refund.amount,
      currency: refund.currency.toUpperCase()
    };
  }

  async verifyWebhook(payload: string, signature: string): Promise<GatewayWebhookEvent> {
    const stripe = getStripeClient();

    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("Stripe webhook secret is not configured.");
    }

    const event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);

    return {
      gateway: "STRIPE",
      eventId: event.id,
      eventType: event.type,
      payload: event.data.object,
      occurredAt: new Date(event.created * 1000)
    };
  }
}
