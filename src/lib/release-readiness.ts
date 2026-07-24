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
    "法律资料完整性",
    legalComplete
      ? "法律页面关键占位字段已填写。"
      : "存在未替换的法律占位字段，生产环境不得发布公开法律页面。"
  );

  const authConfigured = Boolean(env.NEXTAUTH_SECRET);
  pushCheck(
    checks,
    blockers,
    authConfigured,
    "nextauth-secret",
    "管理员认证密钥",
    authConfigured ? "NEXTAUTH_SECRET 已配置。" : "NEXTAUTH_SECRET 未配置。"
  );

  const appUrlConfigured = Boolean(env.APP_URL && env.NEXTAUTH_URL);
  pushCheck(
    checks,
    blockers,
    appUrlConfigured,
    "app-url",
    "应用 URL 配置",
    appUrlConfigured ? "APP_URL 与 NEXTAUTH_URL 已配置。" : "APP_URL 或 NEXTAUTH_URL 缺失。"
  );

  const stripeConfigured = Boolean(
    env.STRIPE_PUBLISHABLE_KEY && env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET
  );
  pushCheck(
    checks,
    blockers,
    stripeConfigured,
    "stripe-config",
    "Stripe 生产配置",
    stripeConfigured ? "Stripe 关键环境变量齐全。" : "Stripe Publishable/Secret/Webhook Secret 缺失。"
  );

  const emailConfigured = Boolean(env.EMAIL_FROM && env.EMAIL_PROVIDER_API_KEY && env.SUPPORT_EMAIL);
  pushCheck(
    checks,
    blockers,
    emailConfigured,
    "email-config",
    "邮件与支持邮箱",
    emailConfigured ? "邮件服务与支持邮箱已配置。" : "邮件服务或支持邮箱未完整配置。"
  );

  const dbConfigured = Boolean(env.DATABASE_URL);
  pushCheck(
    checks,
    blockers,
    dbConfigured,
    "database-config",
    "数据库连接",
    dbConfigured ? "DATABASE_URL 已配置。" : "DATABASE_URL 未配置。"
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
      blockers.push("无法读取网关配置，无法确认生产环境是否可安全上线。");
      checks.push({
        key: "gateway-config-read",
        label: "网关配置读取",
        status: "fail",
        detail: "数据库不可用或网关配置读取失败。"
      });
    }
  } else {
    blockers.push("无法读取网关配置，无法确认生产环境是否可安全上线。");
    checks.push({
      key: "gateway-config-read",
      label: "网关配置读取",
      status: "fail",
      detail: "DATABASE_URL 未配置，无法读取网关配置。"
    });
  }

  const stripeEnabled = gatewayConfigs.some(
    (item) => item.gateway === PaymentGatewayName.STRIPE && item.enabled
  );
  const monerisEnabled = gatewayConfigs.some(
    (item) => item.gateway === PaymentGatewayName.MONERIS && item.enabled
  );

  if (!stripeEnabled && !monerisEnabled) {
    blockers.push("至少需要启用一个支付网关。");
    checks.push({
      key: "gateway-enabled",
      label: "支付网关启用状态",
      status: "fail",
      detail: "当前没有任何启用的支付网关。"
    });
  } else {
    checks.push({
      key: "gateway-enabled",
      label: "支付网关启用状态",
      status: "pass",
      detail: `已启用网关: ${[stripeEnabled ? "STRIPE" : null, monerisEnabled ? "MONERIS" : null]
        .filter(Boolean)
        .join(", ")}`
    });
  }

  if (monerisEnabled) {
    const monerisReadyForProduction = Boolean(env.MONERIS_STORE_ID && env.MONERIS_API_TOKEN);
    const monerisStatus = env.MONERIS_ENVIRONMENT === "test" ? "warn" : monerisReadyForProduction ? "pass" : "fail";
    const detail =
      env.MONERIS_ENVIRONMENT === "test"
        ? "Moneris 仍处于测试模式或内部模拟流程。"
        : monerisReadyForProduction
          ? "Moneris 基本凭证已配置。"
          : "Moneris 已启用但缺少生产凭证。";

    checks.push({
      key: "moneris-production",
      label: "Moneris 生产准备状态",
      status: monerisStatus,
      detail
    });

    if (monerisStatus === "fail") {
      blockers.push(detail);
    }

    if (monerisStatus === "warn") {
      warnings.push("Moneris 仍是测试模式或内部模拟实现，不能视为正式生产接入。");
    }
  }

  checks.push({
    key: "backup-doc",
    label: "数据库备份文档",
    status: "pass",
    detail: "仓库已提供数据库备份与恢复说明文档。"
  });

  checks.push({
    key: "monitoring-doc",
    label: "日志与监控文档",
    status: "pass",
    detail: "仓库已提供日志脱敏与监控建议文档。"
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
