import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { defaultLegalPlaceholders, getSiteContent, hasMissingLegalPlaceholders } from "@/lib/content";
import { isProductionLikeEnvironment } from "@/lib/release-readiness";

const legalContent: Record<string, { title: string; body: string[] }> = {
  "terms-of-use": {
    title: "Terms of Use",
    body: [
      "This website is operated by [LEGAL_COMPANY_NAME]. It presents the operator's own project and is not a public fundraising marketplace.",
      "Users must provide accurate information when submitting support and must not attempt fraudulent or unauthorized payment activity.",
      "The operator may suspend access or cancel transactions where fraud, abuse, legal non-compliance, or payment processor restrictions apply."
    ]
  },
  "privacy-policy": {
    title: "Privacy Policy",
    body: [
      "The site collects only the information needed to process support, communicate with contributors, and maintain compliance, including name, email, amount, and permitted payment summaries.",
      "The site does not collect SIN, government identity documents, full card numbers, CVV, or unnecessary birth dates.",
      "Privacy requests may be sent to [SUPPORT_EMAIL]."
    ]
  },
  "payment-policy": {
    title: "Payment Policy",
    body: [
      "Credit card payments are processed through approved third-party processors such as Stripe and, when configured, Moneris.",
      "Support status is determined by server-side records and verified webhooks rather than front-end redirects alone.",
      "Minimum and maximum amounts are enforced server-side."
    ]
  },
  "refund-policy": {
    title: "Refund Policy",
    body: [
      "Refund requests are reviewed according to the operator's policy and payment processor rules.",
      "Approved refunds may be full or partial and are logged with administrative audit details.",
      "Questions about refunds should be directed to [SUPPORT_EMAIL]."
    ]
  },
  "cookie-policy": {
    title: "Cookie Policy",
    body: [
      "The site uses essential cookies for security and administrator authentication.",
      "Non-essential analytics or marketing cookies should not be enabled without user consent and proper disclosure.",
      "This first version aims to minimize optional tracking."
    ]
  },
  "funding-disclosure": {
    title: "Funding / Contribution Disclosure",
    body: [
      "Payments on this site support the operator's own project and are not held on behalf of third-party campaign creators.",
      "The site should not describe ordinary commercial support as a charitable tax-deductible donation unless valid charitable registration and receipt rules are configured.",
      "Current project purpose: [PROJECT_PURPOSE]. Current funding use: [FUND_USAGE_DESCRIPTION]."
    ]
  }
};

export default async function LegalPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = legalContent[slug];

  if (!page) {
    notFound();
  }

  const content = await getSiteContent();
  const placeholders = (content.legalPlaceholders ?? defaultLegalPlaceholders) as Record<string, string>;
  const blockedInProduction = isProductionLikeEnvironment() && hasMissingLegalPlaceholders(placeholders);

  if (blockedInProduction) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Card className="space-y-4 border-amber-200 bg-amber-50">
          <p className="text-xs font-semibold tracking-[0.22em] text-amber-800 uppercase">Legal</p>
          <h1 className="text-3xl font-semibold tracking-tight text-amber-950">Legal page temporarily unavailable</h1>
          <p className="text-sm leading-7 text-amber-900">
            This legal page is blocked in production because required company or contact information has
            not been fully configured. Update the legal placeholders in admin content settings before
            publishing.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Card className="space-y-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">Legal</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">{page.title}</h1>
        </div>
        {page.body.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-7 text-zinc-600">
            {replacePlaceholders(paragraph, placeholders)}
          </p>
        ))}
      </Card>
    </div>
  );
}

function replacePlaceholders(text: string, placeholders: Record<string, string>) {
  return Object.entries(placeholders).reduce((result, [key, value]) => {
    return result.split(`[${key}]`).join(value);
  }, text);
}
