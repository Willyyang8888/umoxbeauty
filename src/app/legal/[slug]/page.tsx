import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { defaultLegalPlaceholders, getSiteContent, hasMissingLegalPlaceholders } from "@/lib/content";
import { isProductionLikeEnvironment } from "@/lib/release-readiness";

const legalContent: Record<string, { title: string; body: string[] }> = {
  "terms-of-use": {
    title: "Terms of Use",
    body: [
      "This website is operated by [LEGAL_COMPANY_NAME], business number [BUSINESS_NUMBER], with a public business address at [REGISTERED_ADDRESS]. It presents the operator's own project and is not a public fundraising marketplace.",
      "By using this website, you agree to provide accurate information, use the service lawfully, and avoid fraudulent, abusive, or unauthorized payment activity.",
      "Support payments made through this website are voluntary project support payments. They do not create equity, profit-sharing rights, repayment rights, or any ownership interest in the operator or the Umox Beauty project.",
      "The operator may suspend access, cancel transactions, decline support submissions, or limit use of the website where fraud, abuse, legal non-compliance, security concerns, or payment processor restrictions apply.",
      "Questions about these terms may be directed to [SUPPORT_EMAIL] or [CONTACT_PHONE]."
    ]
  },
  "privacy-policy": {
    title: "Privacy Policy",
    body: [
      "The site collects only the information reasonably needed to process support, communicate with contributors, operate the project, maintain security, and meet legal or payment compliance requirements. This may include name, email, amount, message content, transaction references, and permitted payment summaries.",
      "Card details are handled by approved third-party payment providers such as Stripe and, when configured, Moneris. The operator does not store full card numbers or CVV values on its own servers.",
      "The site does not request SIN, government identity documents, or other unnecessary personal information for ordinary project support transactions.",
      "Submitted information may be used for support processing, receipts, customer service, fraud review, refund review, internal reporting, and legal compliance.",
      "Privacy requests, correction requests, or deletion requests may be sent to [SUPPORT_EMAIL] or by using the contact page."
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
      "Support payments are voluntary and are generally intended to help fund the development and operation of the Umox Beauty project. Refunds are therefore not automatically guaranteed in all cases.",
      "Refund requests are reviewed case by case according to the operator's policy, payment processor rules, transaction records, and the circumstances of the request.",
      "Where appropriate, the operator may issue a full or partial refund for reasons such as duplicate payments, technical processing errors, unauthorized transactions, or other exceptional cases.",
      "Approved refunds are sent back to the original payment method whenever the payment processor allows it, and refund timing may depend on the card issuer or payment provider.",
      "Questions about refunds should be directed to [SUPPORT_EMAIL] or [CONTACT_PHONE]."
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
      "Payments on this site support the operator's own project and are not held on behalf of third-party campaign creators, charities, or unrelated beneficiaries.",
      "The site should not describe ordinary project support as a charitable tax-deductible donation unless valid charitable registration and receipt rules are separately configured.",
      "Current project purpose: [PROJECT_PURPOSE]. Current funding use: [FUND_USAGE_DESCRIPTION].",
      "The operator for this site is [LEGAL_COMPANY_NAME], and public inquiries may be directed to [SUPPORT_EMAIL]."
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
