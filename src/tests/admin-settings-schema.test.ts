import { contentSettingsSchema, gatewaySettingsSchema } from "@/features/support/schema";

describe("admin settings validation", () => {
  it("accepts valid gateway settings", () => {
    const parsed = gatewaySettingsSchema.parse({
      defaultGateway: "STRIPE",
      stripeEnabled: true,
      monerisEnabled: false,
      environment: "test",
      minAmount: 1000,
      maxAmount: 200000,
      defaultCurrency: "CAD",
      presetAmounts: [1000, 2500, 5000]
    });

    expect(parsed.defaultGateway).toBe("STRIPE");
  });

  it("accepts valid content settings", () => {
    const parsed = contentSettingsSchema.parse({
      siteName: "Project Support Site",
      supportLabel: "Support",
      homepageTitle: "Support a company-operated project with clarity and trust",
      homepageSubtitle:
        "This site is run directly by its Canadian operating company and accepts direct project support by credit card.",
      projectPurpose: "Support a single company-operated project.",
      fundUsageDescription: "Funds are used for product development and operations.",
      supportEmail: "support@example.com",
      registeredAddress: "123 Main Street",
      businessNumber: "BN-12345",
      contactPhone: "+1 111 111 1111"
    });

    expect(parsed.supportLabel).toBe("Support");
  });
});
