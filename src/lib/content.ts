import { prisma } from "@/lib/prisma";

export const defaultLegalPlaceholders = {
  LEGAL_COMPANY_NAME: "1498780 B.C. LTD.",
  BUSINESS_NUMBER: "752706424BC0001",
  REGISTERED_ADDRESS: "4837 Gilpin Ct, Burnaby, BC V5G 3A2, Canada",
  SUPPORT_EMAIL: "yzyzoey0105@gmail.com",
  CONTACT_PHONE: "+1 778-874-1182",
  PROJECT_PURPOSE:
    "To develop and operate Umox Beauty, an independent beauty recommendation application that helps users make everyday makeup and beauty decisions more easily and confidently.",
  FUND_USAGE_DESCRIPTION:
    "Funds may be used for user experience design, application development, AI recommendation services, cloud infrastructure, database services, security, testing, hosting, localization, and related legal, accounting, and administrative costs."
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
