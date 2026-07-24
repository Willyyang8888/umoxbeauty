import {
  PaymentGatewayName,
  Prisma,
  ReceiptDispatchStatus,
  RefundStatus,
  SupportTransactionStatus
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createPaymentGateway } from "@/features/payments/payment-gateway-factory";
import { canRefund, contentSettingsSchema, gatewaySettingsSchema } from "@/features/support/schema";
import { createAuditLog } from "@/server/services/audit-service";

export async function getDashboardMetrics() {
  try {
    const transactions = await prisma.supportTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 8
    });

    const totals = transactions.reduce(
      (accumulator, transaction) => {
        if (transaction.status === SupportTransactionStatus.SUCCEEDED) {
          accumulator.totalCollected += transaction.amount;
          accumulator.successCount += 1;
        }

        if (transaction.status === SupportTransactionStatus.FAILED) {
          accumulator.failedCount += 1;
        }

        if (transaction.status === SupportTransactionStatus.PROCESSING) {
          accumulator.processingCount += 1;
        }

        if (transaction.gateway === PaymentGatewayName.STRIPE) {
          accumulator.stripeCount += 1;
        }

        if (transaction.gateway === PaymentGatewayName.MONERIS) {
          accumulator.monerisCount += 1;
        }

        return accumulator;
      },
      {
        totalCollected: 0,
        successCount: 0,
        failedCount: 0,
        processingCount: 0,
        stripeCount: 0,
        monerisCount: 0
      }
    );

    const refundAggregate = await prisma.refund.aggregate({
      _sum: { amount: true }
    });
    const webhookFailures = await prisma.webhookEvent.count({
      where: { processingStatus: "FAILED" }
    });

    return {
      ...totals,
      refundTotal: refundAggregate._sum.amount ?? 0,
      recentTransactions: transactions,
      webhookFailures
    };
  } catch {
    return {
      totalCollected: 0,
      successCount: 0,
      failedCount: 0,
      processingCount: 0,
      stripeCount: 0,
      monerisCount: 0,
      refundTotal: 0,
      recentTransactions: [],
      webhookFailures: 0
    };
  }
}

type TransactionFilters = {
  status?: SupportTransactionStatus | "ALL";
  gateway?: PaymentGatewayName | "ALL";
  email?: string;
  minAmount?: number;
  maxAmount?: number;
  from?: string;
  to?: string;
};

export async function getTransactions(filters: TransactionFilters = {}) {
  try {
    return await prisma.supportTransaction.findMany({
      where: buildTransactionWhere(filters),
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        refunds: true
      }
    });
  } catch {
    return [];
  }
}

export async function getTransactionDetails(reference: string) {
  try {
    return await prisma.supportTransaction.findUnique({
      where: { publicReference: reference },
      include: {
        refunds: {
          orderBy: { createdAt: "desc" }
        },
        webhookEvents: {
          orderBy: { receivedAt: "desc" }
        },
        attempts: {
          orderBy: { createdAt: "desc" }
        },
        receiptDispatches: {
          orderBy: { createdAt: "desc" }
        }
      }
    });
  } catch {
    return null;
  }
}

export async function getRefundCandidates() {
  try {
    return await prisma.supportTransaction.findMany({
      where: {
        status: {
          in: [
            SupportTransactionStatus.SUCCEEDED,
            SupportTransactionStatus.PARTIALLY_REFUNDED
          ]
        }
      },
      include: {
        refunds: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 20
    });
  } catch {
    return [];
  }
}

export async function createRefund(input: {
  adminUserId: string;
  transactionId: string;
  amount: number;
  reason: string;
}) {
  const transaction = await prisma.supportTransaction.findUnique({
    where: { id: input.transactionId },
    include: { refunds: true }
  });

  if (!transaction) {
    throw new Error("Transaction not found.");
  }

  const refundedAmount = transaction.refunds
    .filter((refund) => refund.status !== RefundStatus.FAILED)
    .reduce((sum, refund) => sum + refund.amount, 0);
  const refundableAmount = Math.max(transaction.amount - refundedAmount, 0);

  if (!canRefund(refundableAmount, input.amount)) {
    throw new Error("Requested refund exceeds the refundable amount.");
  }

  if (!transaction.gatewayPaymentIntentId) {
    throw new Error("Refund requires a gateway payment identifier.");
  }

  const gateway = await createPaymentGateway(transaction.gateway);
  const gatewayRefund = await gateway.refundPayment({
    transactionId: transaction.id,
    gatewayTransactionId: transaction.gatewayTransactionId ?? undefined,
    gatewayPaymentIntentId: transaction.gatewayPaymentIntentId ?? undefined,
    amount: input.amount,
    reason: input.reason
  });

  const refund = await prisma.refund.create({
    data: {
      transactionId: transaction.id,
      gatewayRefundId: gatewayRefund.gatewayRefundId,
      amount: input.amount,
      currency: transaction.currency,
      reason: input.reason,
      status: gatewayRefund.status,
      createdByAdminId: input.adminUserId
    }
  });

  const nextRefundedAmount = refundedAmount + input.amount;
  const nextStatus =
    nextRefundedAmount >= transaction.amount
      ? SupportTransactionStatus.REFUNDED
      : SupportTransactionStatus.PARTIALLY_REFUNDED;

  await prisma.supportTransaction.update({
    where: { id: transaction.id },
    data: {
      status: nextStatus
    }
  });

  await createAuditLog({
    adminUserId: input.adminUserId,
    action: "REFUND_CREATED",
    entityType: "Refund",
    entityId: refund.id,
    metadata: {
      transactionId: transaction.id,
      amount: input.amount,
      currency: transaction.currency,
      reason: input.reason
    }
  });

  return refund;
}

export async function getGatewayConfigurations() {
  try {
    return await prisma.gatewayConfiguration.findMany({
      orderBy: { gateway: "asc" }
    });
  } catch {
    return [];
  }
}

export async function saveGatewaySettings(
  adminUserId: string,
  rawInput: unknown
) {
  const input = gatewaySettingsSchema.parse(rawInput);

  const stripeSettings = {
    minAmount: input.minAmount,
    maxAmount: input.maxAmount,
    defaultCurrency: input.defaultCurrency,
    presetAmounts: input.presetAmounts
  };
  const monerisSettings = {
    blocker: "BLOCKED_BY_MONERIS_ACCOUNT_CONFIGURATION"
  };

  await prisma.$transaction([
    prisma.gatewayConfiguration.upsert({
      where: { gateway: PaymentGatewayName.STRIPE },
      update: {
        enabled: input.stripeEnabled,
        isDefault: input.defaultGateway === "STRIPE",
        environment: input.environment,
        nonSensitiveSettings: stripeSettings
      },
      create: {
        gateway: PaymentGatewayName.STRIPE,
        enabled: input.stripeEnabled,
        isDefault: input.defaultGateway === "STRIPE",
        environment: input.environment,
        nonSensitiveSettings: stripeSettings
      }
    }),
    prisma.gatewayConfiguration.upsert({
      where: { gateway: PaymentGatewayName.MONERIS },
      update: {
        enabled: input.monerisEnabled,
        isDefault: input.defaultGateway === "MONERIS",
        environment: input.environment,
        nonSensitiveSettings: monerisSettings
      },
      create: {
        gateway: PaymentGatewayName.MONERIS,
        enabled: input.monerisEnabled,
        isDefault: input.defaultGateway === "MONERIS",
        environment: input.environment,
        nonSensitiveSettings: monerisSettings
      }
    })
  ]);

  await createAuditLog({
    adminUserId,
    action: "GATEWAY_SETTINGS_UPDATED",
    entityType: "GatewayConfiguration",
    metadata: input
  });
}

export async function getContentSettings() {
  try {
    return await prisma.siteContentSettings.findFirst();
  } catch {
    return null;
  }
}

export async function saveContentSettings(adminUserId: string, rawInput: unknown) {
  const input = contentSettingsSchema.parse(rawInput);

  const data = {
    siteName: input.siteName,
    supportLabel: input.supportLabel,
    defaultCurrency: "CAD",
    presetAmounts: [1000, 2500, 5000, 10000],
    legalPlaceholders: {
      LEGAL_COMPANY_NAME: input.siteName,
      BUSINESS_NUMBER: input.businessNumber,
      REGISTERED_ADDRESS: input.registeredAddress,
      SUPPORT_EMAIL: input.supportEmail,
      CONTACT_PHONE: input.contactPhone,
      PROJECT_PURPOSE: input.projectPurpose,
      FUND_USAGE_DESCRIPTION: input.fundUsageDescription
    },
    homepageContent: {
      title: input.homepageTitle,
      subtitle: input.homepageSubtitle
    },
    emailTemplates: {
      receiptSubject: `${input.supportLabel} confirmation`
    }
  };

  const existing = await prisma.siteContentSettings.findFirst();

  if (existing) {
    await prisma.siteContentSettings.update({
      where: { id: existing.id },
      data
    });
  } else {
    await prisma.siteContentSettings.create({
      data
    });
  }

  await createAuditLog({
    adminUserId,
    action: "CONTENT_SETTINGS_UPDATED",
    entityType: "SiteContentSettings",
    entityId: existing?.id,
    metadata: {
      siteName: input.siteName,
      supportLabel: input.supportLabel
    }
  });
}

export async function getAuditLogs() {
  try {
    return await prisma.auditLog.findMany({
      include: {
        adminUser: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  } catch {
    return [];
  }
}

export async function exportTransactionsCsv(filters: TransactionFilters = {}) {
  const transactions = await prisma.supportTransaction.findMany({
    where: buildTransactionWhere(filters),
    include: {
      refunds: true,
      receiptDispatches: true
    },
    orderBy: { createdAt: "desc" }
  });

  const header = [
    "publicReference",
    "gateway",
    "gatewayTransactionId",
    "amount",
    "currency",
    "status",
    "donorName",
    "donorEmail",
    "isAnonymous",
    "cardBrand",
    "cardLast4",
    "paidAt",
    "createdAt",
    "refundCount",
    "receiptStatus"
  ];

  const rows = transactions.map((transaction) => [
    transaction.publicReference,
    transaction.gateway,
    transaction.gatewayTransactionId ?? "",
    String(transaction.amount),
    transaction.currency,
    transaction.status,
    csvEscape(transaction.donorName),
    csvEscape(transaction.donorEmail),
    String(transaction.isAnonymous),
    transaction.cardBrand ?? "",
    transaction.cardLast4 ?? "",
    transaction.paidAt?.toISOString() ?? "",
    transaction.createdAt.toISOString(),
    String(transaction.refunds.length),
    transaction.receiptDispatches[0]?.status ?? ReceiptDispatchStatus.PENDING
  ]);

  return [header, ...rows]
    .map((row) => row.map((value) => csvEscape(String(value))).join(","))
    .join("\n");
}

function buildTransactionWhere(filters: TransactionFilters): Prisma.SupportTransactionWhereInput {
  const where: Prisma.SupportTransactionWhereInput = {};

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters.gateway && filters.gateway !== "ALL") {
    where.gateway = filters.gateway;
  }

  if (filters.email) {
    where.donorEmail = {
      contains: filters.email,
      mode: "insensitive"
    };
  }

  if (filters.minAmount || filters.maxAmount) {
    where.amount = {};
    if (typeof filters.minAmount === "number") {
      where.amount.gte = filters.minAmount;
    }
    if (typeof filters.maxAmount === "number") {
      where.amount.lte = filters.maxAmount;
    }
  }

  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) {
      where.createdAt.gte = new Date(filters.from);
    }
    if (filters.to) {
      const inclusiveEnd = new Date(filters.to);
      inclusiveEnd.setHours(23, 59, 59, 999);
      where.createdAt.lte = inclusiveEnd;
    }
  }

  return where;
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
