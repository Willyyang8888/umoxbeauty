import { ContentSettingsForm } from "@/components/admin/content-settings-form";
import { Card } from "@/components/ui/card";
import { getReleaseReadiness } from "@/lib/release-readiness";
import { getContentSettings } from "@/server/services/admin-service";

export default async function ContentSettingsPage() {
  const content = await getContentSettings();
  const readiness = await getReleaseReadiness();
  const homepage = (content?.homepageContent ?? {}) as { title?: string; subtitle?: string };
  const legal = (content?.legalPlaceholders ?? {}) as Record<string, string>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">Content settings</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Editable content settings</h1>
      </div>
      <ContentSettingsForm
        initialValues={{
          siteName: content?.siteName ?? "Project Support Site",
          supportLabel:
            (content?.supportLabel as "Support" | "Contribution" | "Project Funding" | "Donation") ??
            "Support",
          homepageTitle: homepage.title ?? "Support a company-operated project with clarity and trust",
          homepageSubtitle:
            homepage.subtitle ??
            "This site is run directly by its Canadian operating company and accepts direct project support by credit card.",
          projectPurpose: legal.PROJECT_PURPOSE ?? "[PROJECT_PURPOSE]",
          fundUsageDescription: legal.FUND_USAGE_DESCRIPTION ?? "[FUND_USAGE_DESCRIPTION]",
          supportEmail: legal.SUPPORT_EMAIL ?? "support@example.com",
          registeredAddress: legal.REGISTERED_ADDRESS ?? "[REGISTERED_ADDRESS]",
          businessNumber: legal.BUSINESS_NUMBER ?? "[BUSINESS_NUMBER]",
          contactPhone: legal.CONTACT_PHONE ?? "[CONTACT_PHONE]"
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
              .filter((item) => item.includes("法律") || item.includes("支持邮箱") || item.includes("APP_URL") || item.includes("NEXTAUTH"))
              .map((blocker) => (
                <li key={blocker}>- {blocker}</li>
              ))}
          </ul>
        ) : null}
      </Card>
    </div>
  );
}
