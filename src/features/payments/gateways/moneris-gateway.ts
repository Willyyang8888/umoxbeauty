import { env } from "@/lib/env";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  GatewayWebhookEvent,
  PaymentGateway,
  PaymentStatusResult,
  RefundPaymentInput,
  RefundResult
} from "@/features/payments/types";

const BLOCKER = "BLOCKED_BY_MONERIS_ACCOUNT_CONFIGURATION";

export class MonerisGateway implements PaymentGateway {
  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    if (env.MONERIS_ENVIRONMENT === "test") {
      return {
        gateway: "MONERIS",
        transactionId: input.transactionId,
        gatewayTransactionId: `moneris_test_${input.transactionId}`,
        gatewayPaymentIntentId: `moneris_test_${input.transactionId}`,
        status: "REQUIRES_PAYMENT",
        checkoutUrl: `/support/${input.publicReference}/moneris-test`
      };
    }

    return {
      gateway: "MONERIS",
      transactionId: input.transactionId,
      status: "FAILED",
      checkoutUrl: undefined
    };
  }

  async getPaymentStatus(): Promise<PaymentStatusResult> {
    return {
      status: "FAILED",
      raw: { blocker: BLOCKER }
    };
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundResult> {
    if (env.MONERIS_ENVIRONMENT === "test") {
      return {
        gatewayRefundId: `mock-moneris-refund-${input.transactionId}`,
        status: "SUCCEEDED",
        amount: input.amount,
        currency: "CAD"
      };
    }

    return {
      gatewayRefundId: `mock-moneris-refund-${input.transactionId}`,
      status: "FAILED",
      amount: input.amount,
      currency: "CAD"
    };
  }

  async verifyWebhook(): Promise<GatewayWebhookEvent> {
    throw new Error(BLOCKER);
  }
}

export { BLOCKER as MONERIS_BLOCKER };
