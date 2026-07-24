import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  APP_URL: z.string().url().optional(),
  DEFAULT_CURRENCY: z.string().default("CAD"),
  SUPPORT_EMAIL: z.string().email().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  MONERIS_STORE_ID: z.string().optional(),
  MONERIS_API_TOKEN: z.string().optional(),
  MONERIS_ENVIRONMENT: z.string().optional(),
  EMAIL_PROVIDER_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  RECEIPT_SENDER_NAME: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_NAME: z.string().optional()
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  APP_URL: process.env.APP_URL,
  DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY,
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  MONERIS_STORE_ID: process.env.MONERIS_STORE_ID,
  MONERIS_API_TOKEN: process.env.MONERIS_API_TOKEN,
  MONERIS_ENVIRONMENT: process.env.MONERIS_ENVIRONMENT,
  EMAIL_PROVIDER_API_KEY: process.env.EMAIL_PROVIDER_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  RECEIPT_SENDER_NAME: process.env.RECEIPT_SENDER_NAME,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_NAME: process.env.ADMIN_NAME
});
