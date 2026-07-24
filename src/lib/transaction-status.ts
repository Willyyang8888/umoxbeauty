import { SupportTransactionStatus } from "@prisma/client";

const precedence: Record<SupportTransactionStatus, number> = {
  CREATED: 0,
  REQUIRES_PAYMENT: 1,
  PROCESSING: 2,
  FAILED: 3,
  CANCELED: 3,
  SUCCEEDED: 4,
  PARTIALLY_REFUNDED: 5,
  REFUNDED: 6,
  DISPUTED: 7
};

export function canTransitionStatus(
  current: SupportTransactionStatus,
  incoming: SupportTransactionStatus
) {
  if (current === incoming) {
    return true;
  }

  if (current === "REFUNDED") {
    return incoming === "DISPUTED";
  }

  return precedence[incoming] >= precedence[current];
}

export function resolveStripeStatus(status: string): SupportTransactionStatus {
  switch (status) {
    case "succeeded":
      return "SUCCEEDED";
    case "processing":
      return "PROCESSING";
    case "requires_payment_method":
    case "requires_confirmation":
    case "requires_action":
      return "REQUIRES_PAYMENT";
    case "canceled":
      return "CANCELED";
    default:
      return "FAILED";
  }
}
