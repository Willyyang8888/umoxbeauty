import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetSiteContent = vi.fn();
const mockFindMany = vi.fn();

vi.mock("@/lib/content", () => ({
  defaultLegalPlaceholders: {
    LEGAL_COMPANY_NAME: "[LEGAL_COMPANY_NAME]",
    BUSINESS_NUMBER: "[BUSINESS_NUMBER]",
    REGISTERED_ADDRESS: "[REGISTERED_ADDRESS]",
    SUPPORT_EMAIL: "[SUPPORT_EMAIL]",
    CONTACT_PHONE: "[CONTACT_PHONE]",
    PROJECT_PURPOSE: "[PROJECT_PURPOSE]",
    FUND_USAGE_DESCRIPTION: "[FUND_USAGE_DESCRIPTION]"
  },
  getSiteContent: mockGetSiteContent,
  hasMissingLegalPlaceholders: (placeholders: Record<string, string>) =>
    Object.values(placeholders).some((value) => value.startsWith("["))
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    gatewayConfiguration: {
      findMany: mockFindMany
    }
  }
}));

vi.mock("@/lib/env", () => ({
  env: {
    NEXTAUTH_SECRET: "secret",
    APP_URL: "https://example.com",
    NEXTAUTH_URL: "https://example.com",
    STRIPE_PUBLISHABLE_KEY: "pk_test",
    STRIPE_SECRET_KEY: "sk_test",
    STRIPE_WEBHOOK_SECRET: "whsec_test",
    EMAIL_FROM: "support@example.com",
    EMAIL_PROVIDER_API_KEY: "mail_key",
    SUPPORT_EMAIL: "support@example.com",
    DATABASE_URL: "postgres://db",
    MONERIS_ENVIRONMENT: "test",
    MONERIS_STORE_ID: undefined,
    MONERIS_API_TOKEN: undefined
  }
}));

describe("release readiness", () => {
  beforeEach(() => {
    mockGetSiteContent.mockReset();
    mockFindMany.mockReset();
  });

  it("blocks production readiness when legal placeholders are incomplete", async () => {
    mockGetSiteContent.mockResolvedValue({
      legalPlaceholders: {
        LEGAL_COMPANY_NAME: "[LEGAL_COMPANY_NAME]",
        BUSINESS_NUMBER: "BN",
        REGISTERED_ADDRESS: "Address",
        SUPPORT_EMAIL: "support@example.com",
        CONTACT_PHONE: "123456",
        PROJECT_PURPOSE: "Purpose",
        FUND_USAGE_DESCRIPTION: "Use"
      }
    });
    mockFindMany.mockResolvedValue([{ gateway: "STRIPE", enabled: true }]);

    const { getReleaseReadiness } = await import("@/lib/release-readiness");
    const readiness = await getReleaseReadiness();

    expect(readiness.canPublishToProduction).toBe(false);
    expect(readiness.blockers.some((item) => item.includes("法律"))).toBe(true);
  });

  it("passes when required checks are satisfied", async () => {
    mockGetSiteContent.mockResolvedValue({
      legalPlaceholders: {
        LEGAL_COMPANY_NAME: "Company",
        BUSINESS_NUMBER: "BN",
        REGISTERED_ADDRESS: "Address",
        SUPPORT_EMAIL: "support@example.com",
        CONTACT_PHONE: "123456",
        PROJECT_PURPOSE: "Purpose",
        FUND_USAGE_DESCRIPTION: "Use"
      }
    });
    mockFindMany.mockResolvedValue([{ gateway: "STRIPE", enabled: true }]);

    const { getReleaseReadiness } = await import("@/lib/release-readiness");
    const readiness = await getReleaseReadiness();

    expect(readiness.canPublishToProduction).toBe(true);
  });
});
