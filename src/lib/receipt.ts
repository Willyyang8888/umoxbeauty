import { ReceiptDispatchStatus, SupportTransactionStatus } from "@prisma/client";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function dispatchReceipt(transactionId: string) {
  const existing = await prisma.receiptDispatch.findUnique({
    where: {
      transactionId_templateKey: {
        transactionId,
        templateKey: "support-receipt"
      }
    }
  });

  if (existing?.status === ReceiptDispatchStatus.SENT) {
    return existing;
  }

  const transaction = await prisma.supportTransaction.findUnique({
    where: { id: transactionId }
  });

  if (!transaction || transaction.status !== SupportTransactionStatus.SUCCEEDED) {
    return null;
  }

  const upserted = await prisma.receiptDispatch.upsert({
    where: {
      transactionId_templateKey: {
        transactionId,
        templateKey: "support-receipt"
      }
    },
    update: {},
    create: {
      transactionId,
      email: transaction.donorEmail,
      templateKey: "support-receipt",
      status: env.EMAIL_PROVIDER_API_KEY && env.EMAIL_FROM ? "SENT" : "SKIPPED_NOT_CONFIGURED",
      sentAt: env.EMAIL_PROVIDER_API_KEY && env.EMAIL_FROM ? new Date() : null
    }
  });

  return upserted;
}
