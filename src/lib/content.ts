import { prisma } from "@/lib/prisma";

export const defaultLegalPlaceholders = {
  LEGAL_COMPANY_NAME: "[LEGAL_COMPANY_NAME]",
  BUSINESS_NUMBER: "[BUSINESS_NUMBER]",
  REGISTERED_ADDRESS: "[REGISTERED_ADDRESS]",
  SUPPORT_EMAIL: "[SUPPORT_EMAIL]",
  CONTACT_PHONE: "[CONTACT_PHONE]",
  PROJECT_PURPOSE: "[PROJECT_PURPOSE]",
  FUND_USAGE_DESCRIPTION: "[FUND_USAGE_DESCRIPTION]"
};

const defaultSiteContent = {
  id: "default-site-content",
  siteName: "Umox Beauty",
  supportLabel: "Support",
  defaultCurrency: "CAD",
  presetAmounts: [1000, 2500, 5000, 10000],
  legalPlaceholders: defaultLegalPlaceholders,
  homepageContent: {
    title: "Support the development of Umox Beauty",
    subtitle:
      "Umox Beauty is an independently developed beauty recommendation application created to help users make everyday makeup and beauty decisions more easily and confidently."
  },
  emailTemplates: {
    receiptSubject: "Your Umox Beauty support confirmation"
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

export async function getSiteContent() {
  if (!process.env.DATABASE_URL) {
    return defaultSiteContent;
  }

  try {
    const settings = await prisma.siteContentSettings.findFirst();

    if (settings) {
      return settings;
    }
  } catch {
    // Database may not be configured during initial local setup.
  }

  return defaultSiteContent;
}

export function hasMissingLegalPlaceholders(placeholders: Record<string, string>) {
  return Object.values(placeholders).some((value) => value.startsWith("["));
}
