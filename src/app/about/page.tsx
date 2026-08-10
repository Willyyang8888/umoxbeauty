import { Card } from "@/components/ui/card";
import { defaultLegalPlaceholders, getSiteContent } from "@/lib/content";

export default async function AboutPage() {
  const content = await getSiteContent();
  const placeholders = (content.legalPlaceholders ?? defaultLegalPlaceholders) as Record<string, string>;
  const companyName = placeholders.LEGAL_COMPANY_NAME ?? defaultLegalPlaceholders.LEGAL_COMPANY_NAME;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">About</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">
          About the Project
        </h1>
        <p className="mt-4 text-base leading-8 text-zinc-600">
          Umox Beauty is an independently developed beauty recommendation application designed to
          help users make everyday makeup and beauty decisions more easily and confidently.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Card>
          <p className="text-sm font-semibold text-ink">What Umox Beauty does</p>
          <p className="mt-3 text-sm leading-7 text-zinc-600">
            The application is being developed to provide personalized beauty suggestions based on
            factors such as skin tone, undertone, facial features, personal style, occasion,
            climate, budget, preferred products, and user feedback.
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-ink">What users may receive</p>
          <p className="mt-3 text-sm leading-7 text-zinc-600">
            Users may receive suggestions for complete makeup looks, colour combinations, product
            categories, and alternative options based on their individual preferences and the
            products they already own.
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-ink">Who operates the project</p>
          <p className="mt-3 text-sm leading-7 text-zinc-600">
            The project is operated and developed by the Canadian company {companyName}, and
            visitors may voluntarily support the continued development and operation of the
            application through this official project website.
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-ink">Important disclosure</p>
          <p className="mt-3 text-sm leading-7 text-zinc-600">
            Support payments are not investments, do not provide ownership or profit-sharing rights,
            and are not eligible for Canadian charitable donation tax receipts. Umox Beauty provides
            general beauty, cosmetic, and styling information, not medical or dermatological advice.
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-ink">Operator details</p>
          <div className="mt-3 space-y-2 text-sm leading-7 text-zinc-600">
            <p>Legal company name: {placeholders.LEGAL_COMPANY_NAME}</p>
            <p>Business number: {placeholders.BUSINESS_NUMBER}</p>
            <p>Business address: {placeholders.REGISTERED_ADDRESS}</p>
            <p>Support email: {placeholders.SUPPORT_EMAIL}</p>
            <p>Phone: {placeholders.CONTACT_PHONE}</p>
          </div>
        </Card>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-semibold text-ink">Why We Accept Support</p>
          <div className="mt-3 space-y-3 text-sm leading-7 text-zinc-600">
            <p>
              Umox Beauty is being developed as an independent beauty technology project without the
              resources of a large cosmetics company or established technology platform.
            </p>
            <p>
              Voluntary support helps fund the design, development, testing, infrastructure, and
              continued improvement of the application.
            </p>
            <p>
              Support allows the project to build useful beauty recommendation tools, improve
              personalization, expand the product and colour database, and test the application with
              real users.
            </p>
            <p>
              A contribution is voluntary and does not represent an investment, loan, purchase of
              company ownership, advance purchase of a product, or promise of financial return.
            </p>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-ink">How Support Is Used</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-zinc-600">
            <li>Product and app development</li>
            <li>AI and recommendation technology</li>
            <li>Cloud infrastructure and databases</li>
            <li>Testing, security and localization</li>
            <li>Project operating and administrative costs</li>
          </ul>
          <p className="mt-4 text-sm leading-7 text-zinc-600">
            Funds are received and managed by the operator, {companyName}, and are not collected on
            behalf of third parties or distributed through a public fundraising platform.
          </p>
        </Card>
      </div>
    </div>
  );
}
