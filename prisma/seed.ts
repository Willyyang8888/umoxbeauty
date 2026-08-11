import bcrypt from "bcryptjs";
import { PrismaClient, PaymentGatewayName } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME ?? "Site Admin";

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: { passwordHash, name: adminName },
      create: { email: adminEmail, passwordHash, name: adminName }
    });
  }

  await prisma.gatewayConfiguration.upsert({
    where: { gateway: PaymentGatewayName.STRIPE },
    update: {
      enabled: true,
      isDefault: true,
      environment: "test",
      nonSensitiveSettings: {
        publishableKeyConfigured: false,
        webhookConfigured: false,
        minAmount: 1000,
        maxAmount: 200000,
        defaultCurrency: "CAD",
        presetAmounts: [1000, 2500, 5000, 10000]
      }
    },
    create: {
      gateway: PaymentGatewayName.STRIPE,
      enabled: true,
      isDefault: true,
      environment: "test",
      nonSensitiveSettings: {
        publishableKeyConfigured: false,
        webhookConfigured: false,
        minAmount: 1000,
        maxAmount: 200000,
        defaultCurrency: "CAD",
        presetAmounts: [1000, 2500, 5000, 10000]
      }
    }
  });

  await prisma.gatewayConfiguration.upsert({
    where: { gateway: PaymentGatewayName.MONERIS },
    update: {
      enabled: false,
      isDefault: false,
      environment: "test",
      nonSensitiveSettings: {
        blocker: "BLOCKED_BY_MONERIS_ACCOUNT_CONFIGURATION"
      }
    },
    create: {
      gateway: PaymentGatewayName.MONERIS,
      enabled: false,
      isDefault: false,
      environment: "test",
      nonSensitiveSettings: {
        blocker: "BLOCKED_BY_MONERIS_ACCOUNT_CONFIGURATION"
      }
    }
  });

  await prisma.siteContentSettings.upsert({
    where: { id: "default-site-content" },
    update: {
      siteName: "Umox Beauty",
      supportLabel: "Support",
      defaultCurrency: "CAD",
      presetAmounts: [1000, 2500, 5000, 10000],
      legalPlaceholders: {
        LEGAL_COMPANY_NAME: "1498780 B.C. LTD.",
        BUSINESS_NUMBER: "752706424BC0001",
        REGISTERED_ADDRESS: "4837 Gilpin Ct, Burnaby, BC V5G 3A2, Canada",
        SUPPORT_EMAIL: "yzyzoey19960105@outlook.com",
        CONTACT_PHONE: "+1 778-874-1182",
        PROJECT_PURPOSE:
          "To develop and operate Umox Beauty, an independent beauty recommendation application that helps users make everyday makeup and beauty decisions more easily and confidently.",
        FUND_USAGE_DESCRIPTION:
          "Funds may be used for user experience design, application development, AI recommendation services, cloud infrastructure, database services, security, testing, hosting, localization, and related legal, accounting, and administrative costs."
      },
      homepageContent: {
        title: "Support the development of Umox Beauty",
        subtitle:
          "Umox Beauty is an independently developed beauty recommendation application created to help users make everyday makeup and beauty decisions more easily and confidently."
      },
      emailTemplates: {
        receiptSubject: "Your Umox Beauty support confirmation"
      }
    },
    create: {
      id: "default-site-content",
      siteName: "Umox Beauty",
      supportLabel: "Support",
      defaultCurrency: "CAD",
      presetAmounts: [1000, 2500, 5000, 10000],
      legalPlaceholders: {
        LEGAL_COMPANY_NAME: "1498780 B.C. LTD.",
        BUSINESS_NUMBER: "752706424BC0001",
        REGISTERED_ADDRESS: "4837 Gilpin Ct, Burnaby, BC V5G 3A2, Canada",
        SUPPORT_EMAIL: "yzyzoey19960105@outlook.com",
        CONTACT_PHONE: "+1 778-874-1182",
        PROJECT_PURPOSE:
          "To develop and operate Umox Beauty, an independent beauty recommendation application that helps users make everyday makeup and beauty decisions more easily and confidently.",
        FUND_USAGE_DESCRIPTION:
          "Funds may be used for user experience design, application development, AI recommendation services, cloud infrastructure, database services, security, testing, hosting, localization, and related legal, accounting, and administrative costs."
      },
      homepageContent: {
        title: "Support the development of Umox Beauty",
        subtitle:
          "Umox Beauty is an independently developed beauty recommendation application created to help users make everyday makeup and beauty decisions more easily and confidently."
      },
      emailTemplates: {
        receiptSubject: "Your Umox Beauty support confirmation"
      }
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
