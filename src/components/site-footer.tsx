import Link from "next/link";

import { defaultLegalPlaceholders, getSiteContent, hasMissingLegalPlaceholders } from "@/lib/content";

const legalLinks = [
  { slug: "contact", label: "Contact", external: true },
  { slug: "terms-of-use", label: "Terms of Use" },
  { slug: "privacy-policy", label: "Privacy Policy" },
  { slug: "payment-policy", label: "Payment Policy" },
  { slug: "refund-policy", label: "Refund Policy" },
  { slug: "cookie-policy", label: "Cookie Policy" },
  { slug: "funding-disclosure", label: "Funding Disclosure" }
];

export async function SiteFooter() {
  const content = await getSiteContent();
  const placeholders = (content.legalPlaceholders ?? defaultLegalPlaceholders) as Record<string, string>;
  const hasMissing = hasMissingLegalPlaceholders(placeholders);

  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-ink">{content.siteName}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Umox Beauty is operated by {placeholders.LEGAL_COMPANY_NAME} Support payments are
              voluntary and are not charitable or tax-deductible donations.
            </p>
          </div>
          {hasMissing ? (
            <p className="rounded-full bg-amber-100 px-4 py-2 text-xs font-medium text-amber-800">
              Legal placeholders remain incomplete for production release.
            </p>
          ) : null}
        </div>
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-zinc-600">
          {legalLinks.map((item) =>
            item.external ? (
              <Link key={item.slug} href={`/${item.slug}`}>
                {item.label}
              </Link>
            ) : (
              <Link key={item.slug} href={`/legal/${item.slug}`}>
                {item.label}
              </Link>
            )
          )}
        </div>
      </div>
    </footer>
  );
}
