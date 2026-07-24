import type { PaymentGatewayName, SupportTransactionStatus } from "@prisma/client";

export type SupportedCurrency = "CAD" | "USD";

export type CreatePaymentInput = {
  transactionId: string;
  publicReference: string;
  amount: number;
  currency: SupportedCurrency;
  donorEmail: string;
  donorName: string;
  metadata?: Record<string, string>;
  returnUrl: string;
};

export type CreatePaymentResult = {
  gateway: PaymentGatewayName;
  transactionId: string;
  gatewayTransactionId?: string;
  gatewayPaymentIntentId?: string;
  clientSecret?: string;
  checkoutUrl?: string;
  status: SupportTransactionStatus;
};

export type PaymentStatusResult = {
  status: SupportTransactionStatus;
  gatewayTransactionId?: string;
  raw?: unknown;
};

export type RefundPaymentInput = {
  transactionId: string;
  gatewayTransactionId?: string;
  gatewayPaymentIntentId?: string;
  amount: number;
  reason: string;
};

export type RefundResult = {
  gatewayRefundId: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED";
  amount: number;
  currency: string;
};

export type GatewayWebhookEvent = {
  gateway: PaymentGatewayName;
  eventId: string;
  eventType: string;
  payload: unknown;
  occurredAt?: Date;
};

export interface PaymentGateway {
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  getPaymentStatus(transactionId: string): Promise<PaymentStatusResult>;
  refundPayment(input: RefundPaymentInput): Promise<RefundResult>;
  verifyWebhook(payload: string, signature: string): Promise<GatewayWebhookEvent>;
}
