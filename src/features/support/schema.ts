import { z } from "zod";

export const minAmountCents = 1_000;
export const maxAmountCents = 200_000;
export const presetAmounts = [1_000, 2_500, 5_000, 10_000];

export const checkoutSchema = z.object({
  amount: z.number().int().min(minAmountCents).max(maxAmountCents),
  currency: z.literal("CAD"),
  donorName: z.string().trim().min(2).max(120),
  donorEmail: z.string().trim().email().max(160),
  isAnonymous: z.boolean().default(false),
  message: z.string().trim().max(500).optional().or(z.literal("")),
  termsAccepted: z.literal(true),
  preferredGateway: z.enum(["STRIPE", "MONERIS"]).optional()
});

export const refundSchema = z.object({
  transactionId: z.string().min(1),
  amount: z.number().int().positive(),
  reason: z.string().trim().min(3).max(240),
  confirm: z.literal(true)
});

export const gatewaySettingsSchema = z.object({
  defaultGateway: z.enum(["STRIPE", "MONERIS"]),
  stripeEnabled: z.boolean(),
  monerisEnabled: z.boolean(),
  environment: z.enum(["test", "live"]),
  minAmount: z.number().int().min(100),
  maxAmount: z.number().int().max(1_000_000),
  defaultCurrency: z.literal("CAD"),
  presetAmounts: z.array(z.number().int().positive()).min(1).max(6)
});

export const contentSettingsSchema = z.object({
  siteName: z.string().trim().min(2).max(120),
  legalCompanyName: z.string().trim().min(2).max(160),
  supportLabel: z.enum(["Support", "Contribution", "Project Funding", "Donation"]),
  homepageTitle: z.string().trim().min(10).max(200),
  homepageSubtitle: z.string().trim().min(20).max(400),
  projectPurpose: z.string().trim().min(10).max(500),
  fundUsageDescription: z.string().trim().min(10).max(800),
  supportEmail: z.string().trim().email(),
  registeredAddress: z.string().trim().min(5).max(300),
  businessNumber: z.string().trim().min(2).max(60),
  contactPhone: z.string().trim().min(0).max(40)
});

export function validateAmount(amount: number) {
  return amount >= minAmountCents && amount <= maxAmountCents;
}

export function canRefund(refundableAmount: number, requestedAmount: number) {
  return requestedAmount > 0 && requestedAmount <= refundableAmount;
}
