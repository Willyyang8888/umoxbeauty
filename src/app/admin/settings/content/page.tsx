import { ContentSettingsForm } from "@/components/admin/content-settings-form";
import { Card } from "@/components/ui/card";
import { defaultLegalPlaceholders } from "@/lib/content";
import { getReleaseReadiness } from "@/lib/release-readiness";
import { getContentSettings } from "@/server/services/admin-service";

export default async function ContentSettingsPage() {
  const content = await getContentSettings();
  const readiness = await getReleaseReadiness();
  const homepage = (content?.homepageContent ?? {}) as { title?: string; subtitle?: string };
  const legal = (content?.legalPlaceholders ?? defaultLegalPlaceholders) as Record<string, string>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">Content settings</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Editable content settings</h1>
      </div>
      <ContentSettingsForm
        initialValues={{
          siteName: content?.siteName ?? "Umox Beauty",
          legalCompanyName: legal.LEGAL_COMPANY_NAME ?? defaultLegalPlaceholders.LEGAL_COMPANY_NAME,
          supportLabel:
            (content?.supportLabel as "Support" | "Contribution" | "Project Funding" | "Donation") ??
            "Support",
          homepageTitle: homepage.title ?? "Support the development of Umox Beauty",
          homepageSubtitle:
            homepage.subtitle ??
            "Umox Beauty is an independently developed beauty recommendation application created to help users make everyday makeup and beauty decisions more easily and confidently.",
          projectPurpose: legal.PROJECT_PURPOSE ?? defaultLegalPlaceholders.PROJECT_PURPOSE,
          fundUsageDescription:
            legal.FUND_USAGE_DESCRIPTION ?? defaultLegalPlaceholders.FUND_USAGE_DESCRIPTION,
          supportEmail: legal.SUPPORT_EMAIL ?? defaultLegalPlaceholders.SUPPORT_EMAIL,
          registeredAddress: legal.REGISTERED_ADDRESS ?? defaultLegalPlaceholders.REGISTERED_ADDRESS,
          businessNumber: legal.BUSINESS_NUMBER ?? defaultLegalPlaceholders.BUSINESS_NUMBER,
          contactPhone: legal.CONTACT_PHONE ?? defaultLegalPlaceholders.CONTACT_PHONE
        }}
      />

      <Card>
        <p className="text-sm font-semibold text-ink">Publishing guardrail</p>
        <p className="mt-3 text-sm leading-7 text-zinc-600">
          Replace placeholder company and legal information before production launch. This form saves
          the values that feed public content and legal templates.
        </p>
        {!readiness.canPublishToProduction ? (
          <ul className="mt-4 space-y-1 text-sm leading-7 text-amber-800">
            {readiness.blockers
              .filter(
                (item) =>
                  item.toLowerCase().includes("legal") ||
                  item.toLowerCase().includes("support") ||
                  item.includes("APP_URL") ||
                  item.includes("NEXTAUTH")
              )
              .map((blocker) => (
                <li key={blocker}>- {blocker}</li>
              ))}
          </ul>
        ) : null}
      </Card>
    </div>
  );
}
