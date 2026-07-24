-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PaymentGatewayName" AS ENUM ('STRIPE', 'MONERIS');

-- CreateEnum
CREATE TYPE "SupportTransactionStatus" AS ENUM ('CREATED', 'REQUIRES_PAYMENT', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELED', 'PARTIALLY_REFUNDED', 'REFUNDED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "WebhookProcessingStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'SKIPPED_DUPLICATE', 'FAILED');

-- CreateEnum
CREATE TYPE "ReceiptDispatchStatus" AS ENUM ('PENDING', 'SENT', 'SKIPPED_NOT_CONFIGURED', 'FAILED');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportSession" (
    "id" TEXT NOT NULL,
    "publicReference" TEXT NOT NULL,
    "paymentLabel" TEXT NOT NULL DEFAULT 'SUPPORT',
    "requestedAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "donorName" TEXT NOT NULL,
    "donorEmail" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "status" "SupportTransactionStatus" NOT NULL DEFAULT 'CREATED',
    "successfulTransaction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTransaction" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "publicReference" TEXT NOT NULL,
    "gateway" "PaymentGatewayName" NOT NULL,
    "gatewayTransactionId" TEXT,
    "gatewayPaymentIntentId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "status" "SupportTransactionStatus" NOT NULL DEFAULT 'CREATED',
    "paymentType" TEXT NOT NULL DEFAULT 'SUPPORT',
    "donorName" TEXT NOT NULL,
    "donorEmail" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "cardBrand" TEXT,
    "cardLast4" TEXT,
    "cardCountry" TEXT,
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "gateway" "PaymentGatewayName" NOT NULL,
    "status" "SupportTransactionStatus" NOT NULL DEFAULT 'CREATED',
    "idempotencyKey" TEXT NOT NULL,
    "clientToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "gatewayRefundId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "reason" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "createdByAdminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT,
    "gateway" "PaymentGatewayName" NOT NULL,
    "gatewayEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "processingStatus" "WebhookProcessingStatus" NOT NULL DEFAULT 'RECEIVED',
    "errorMessage" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiptDispatch" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "status" "ReceiptDispatchStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceiptDispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GatewayConfiguration" (
    "id" TEXT NOT NULL,
    "gateway" "PaymentGatewayName" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "environment" TEXT NOT NULL DEFAULT 'test',
    "nonSensitiveSettings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GatewayConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteContentSettings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "supportLabel" TEXT NOT NULL DEFAULT 'Support',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'CAD',
    "presetAmounts" JSONB NOT NULL,
    "legalPlaceholders" JSONB NOT NULL,
    "homepageContent" JSONB NOT NULL,
    "emailTemplates" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContentSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SupportSession_publicReference_key" ON "SupportSession"("publicReference");

-- CreateIndex
CREATE UNIQUE INDEX "SupportTransaction_publicReference_key" ON "SupportTransaction"("publicReference");

-- CreateIndex
CREATE INDEX "SupportTransaction_gateway_status_idx" ON "SupportTransaction"("gateway", "status");

-- CreateIndex
CREATE INDEX "SupportTransaction_donorEmail_idx" ON "SupportTransaction"("donorEmail");

-- CreateIndex
CREATE INDEX "SupportTransaction_createdAt_idx" ON "SupportTransaction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_idempotencyKey_key" ON "PaymentAttempt"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_gatewayEventId_key" ON "WebhookEvent"("gatewayEventId");

-- CreateIndex
CREATE INDEX "WebhookEvent_gateway_receivedAt_idx" ON "WebhookEvent"("gateway", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReceiptDispatch_transactionId_templateKey_key" ON "ReceiptDispatch"("transactionId", "templateKey");

-- CreateIndex
CREATE UNIQUE INDEX "GatewayConfiguration_gateway_key" ON "GatewayConfiguration"("gateway");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "SupportTransaction" ADD CONSTRAINT "SupportTransaction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SupportSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "SupportTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "SupportTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "SupportTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptDispatch" ADD CONSTRAINT "ReceiptDispatch_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "SupportTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

