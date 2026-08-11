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
      siteName: "Umox Beauty",
      legalCompanyName: "1498780 B.C. LTD.",
      supportLabel: "Support",
      homepageTitle: "Support the development of Umox Beauty",
      homepageSubtitle:
        "Umox Beauty is an independently developed beauty recommendation application created to help users make everyday makeup and beauty decisions more easily and confidently.",
      projectPurpose: "To develop and operate Umox Beauty as an independent beauty recommendation application.",
      fundUsageDescription: "Funds are used for development, infrastructure, testing, hosting, and operations.",
      supportEmail: "yzyzoey19960105@outlook.com",
      registeredAddress: "4837 Gilpin Ct, Burnaby, BC V5G 3A2, Canada",
      businessNumber: "752706424BC0001",
      contactPhone: "+1 778-874-1182"
    });

    expect(parsed.supportLabel).toBe("Support");
  });
});
