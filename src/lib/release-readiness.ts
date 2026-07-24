import { PaymentGatewayName } from "@prisma/client";

import { defaultLegalPlaceholders, getSiteContent, hasMissingLegalPlaceholders } from "@/lib/content";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export type ReadinessCheck = {
  key: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
};

export type ReleaseReadiness = {
  canPublishToProduction: boolean;
  checks: ReadinessCheck[];
  blockers: string[];
  warnings: string[];
};

export async function getReleaseReadiness(): Promise<ReleaseReadiness> {
  const checks: ReadinessCheck[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];

  const content = await getSiteContent();
  const placeholders = (content.legalPlaceholders ?? defaultLegalPlaceholders) as Record<string, string>;
  const legalComplete = !hasMissingLegalPlaceholders(placeholders);

  pushCheck(
    checks,
    blockers,
    legalComplete,
    "legal-placeholders",
    "Legal information completeness",
    legalComplete
      ? "Required legal placeholders have been completed."
      : "Some legal placeholders are still unresolved. Public legal pages must not be published to production yet."
  );

  const authConfigured = Boolean(env.NEXTAUTH_SECRET);
  pushCheck(
    checks,
    blockers,
    authConfigured,
    "nextauth-secret",
    "Admin authentication secret",
    authConfigured ? "NEXTAUTH_SECRET is configured." : "NEXTAUTH_SECRET is missing."
  );

  const appUrlConfigured = Boolean(env.APP_URL && env.NEXTAUTH_URL);
  pushCheck(
    checks,
    blockers,
    appUrlConfigured,
    "app-url",
    "Application URL configuration",
    appUrlConfigured
      ? "APP_URL and NEXTAUTH_URL are configured."
      : "APP_URL or NEXTAUTH_URL is missing."
  );

  const stripeConfigured = Boolean(
    env.STRIPE_PUBLISHABLE_KEY && env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET
  );
  pushCheck(
    checks,
    blockers,
    stripeConfigured,
    "stripe-config",
    "Stripe production configuration",
    stripeConfigured
      ? "Stripe publishable key, secret key, and webhook secret are configured."
      : "Stripe publishable key, secret key, or webhook secret is missing."
  );

  const emailConfigured = Boolean(env.EMAIL_FROM && env.EMAIL_PROVIDER_API_KEY && env.SUPPORT_EMAIL);
  pushCheck(
    checks,
    blockers,
    emailConfigured,
    "email-config",
    "Email and support inbox",
    emailConfigured
      ? "Email delivery settings and support inbox are configured."
      : "Email delivery settings or the support inbox are incomplete."
  );

  const dbConfigured = Boolean(env.DATABASE_URL);
  pushCheck(
    checks,
    blockers,
    dbConfigured,
    "database-config",
    "Database connection",
    dbConfigured ? "DATABASE_URL is configured." : "DATABASE_URL is missing."
  );

  let gatewayConfigs: Array<{ gateway: PaymentGatewayName; enabled: boolean }> = [];

  if (env.DATABASE_URL) {
    try {
      gatewayConfigs = await prisma.gatewayConfiguration.findMany({
        select: {
          gateway: true,
          enabled: true
        }
      });
    } catch {
      blockers.push("Gateway configuration could not be read, so production readiness cannot be confirmed.");
      checks.push({
        key: "gateway-config-read",
        label: "Gateway configuration read",
        status: "fail",
        detail: "The database is unavailable or gateway configuration could not be loaded."
      });
    }
  } else {
    blockers.push("Gateway configuration could not be read, so production readiness cannot be confirmed.");
    checks.push({
      key: "gateway-config-read",
      label: "Gateway configuration read",
      status: "fail",
      detail: "DATABASE_URL is missing, so gateway configuration cannot be read."
    });
  }

  const stripeEnabled = gatewayConfigs.some(
    (item) => item.gateway === PaymentGatewayName.STRIPE && item.enabled
  );
  const monerisEnabled = gatewayConfigs.some(
    (item) => item.gateway === PaymentGatewayName.MONERIS && item.enabled
  );

  if (!stripeEnabled && !monerisEnabled) {
    blockers.push("At least one payment gateway must be enabled.");
    checks.push({
      key: "gateway-enabled",
      label: "Payment gateway enablement",
      status: "fail",
      detail: "No payment gateway is currently enabled."
    });
  } else {
    checks.push({
      key: "gateway-enabled",
      label: "Payment gateway enablement",
      status: "pass",
      detail: `Enabled gateways: ${[stripeEnabled ? "STRIPE" : null, monerisEnabled ? "MONERIS" : null]
        .filter(Boolean)
        .join(", ")}`
    });
  }

  if (monerisEnabled) {
    const monerisReadyForProduction = Boolean(env.MONERIS_STORE_ID && env.MONERIS_API_TOKEN);
    const monerisStatus = env.MONERIS_ENVIRONMENT === "test" ? "warn" : monerisReadyForProduction ? "pass" : "fail";
    const detail =
      env.MONERIS_ENVIRONMENT === "test"
        ? "Moneris is still in test mode or using the internal simulation flow."
        : monerisReadyForProduction
          ? "Moneris production credentials are configured."
          : "Moneris is enabled but production credentials are missing.";

    checks.push({
      key: "moneris-production",
      label: "Moneris production readiness",
      status: monerisStatus,
      detail
    });

    if (monerisStatus === "fail") {
      blockers.push(detail);
    }

    if (monerisStatus === "warn") {
      warnings.push("Moneris is still running in test mode or internal simulation and cannot be treated as a live production gateway.");
    }
  }

  checks.push({
    key: "backup-doc",
    label: "Database backup documentation",
    status: "pass",
    detail: "The repository includes database backup and recovery guidance."
  });

  checks.push({
    key: "monitoring-doc",
    label: "Logging and monitoring documentation",
    status: "pass",
    detail: "The repository includes logging redaction and monitoring guidance."
  });

  return {
    canPublishToProduction: blockers.length === 0,
    checks,
    blockers,
    warnings
  };
}

export function isProductionLikeEnvironment() {
  return process.env.NODE_ENV === "production";
}

function pushCheck(
  checks: ReadinessCheck[],
  blockers: string[],
  passed: boolean,
  key: string,
  label: string,
  detail: string
) {
  checks.push({
    key,
    label,
    status: passed ? "pass" : "fail",
    detail
  });

  if (!passed) {
    blockers.push(detail);
  }
}
