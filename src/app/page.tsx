import Link from "next/link";
import { ArrowRight, Building2, HandHeart, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getSiteContent } from "@/lib/content";

const trustPoints = [
  "Independent beauty technology project with direct company-operated support",
  "Clear disclosure of project purpose, funding use, and legal policies",
  "Personalized beauty suggestions across tone, style, occasion, and product preferences"
];

export default async function HomePage() {
  const content = await getSiteContent();
  const homepage = content.homepageContent as { title?: string; subtitle?: string };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">
            Direct project support
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink md:text-6xl">
            {homepage.title}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-zinc-600 md:text-lg">
            {homepage.subtitle} Visitors can voluntarily support the continued development and
            operation of the application through a single official project page.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/support"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
            >
              Support This Project
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-ink"
            >
              Learn about the operator
            </Link>
          </div>
        </div>
        <Card className="bg-ink text-white">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand-soft">
            Trust information
          </p>
          <div className="mt-6 space-y-6">
            <div className="flex items-start gap-4">
              <Building2 className="mt-1 h-5 w-5 text-brand-soft" />
              <div>
                <p className="font-medium">Canadian company operation</p>
                <p className="mt-1 text-sm leading-6 text-zinc-300">
                  The project is operated by one Canadian company. Support payments are collected
                  directly by the operator and are not processed on behalf of third parties.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <HandHeart className="mt-1 h-5 w-5 text-brand-soft" />
              <div>
                <p className="font-medium">Configurable support language</p>
                <p className="mt-1 text-sm leading-6 text-zinc-300">
                  Support helps fund design, development, testing, infrastructure, and continued
                  improvement of the Umox Beauty application.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <ShieldCheck className="mt-1 h-5 w-5 text-brand-soft" />
              <div>
                <p className="font-medium">No tax receipt claims by default</p>
                <p className="mt-1 text-sm leading-6 text-zinc-300">
                  Support is voluntary, is not an investment, and does not provide ownership,
                  profit-sharing rights, or Canadian charitable tax receipts.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {trustPoints.map((point) => (
          <Card key={point}>
            <p className="text-sm font-medium text-ink">{point}</p>
          </Card>
        ))}
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-semibold text-ink">Why support is needed</p>
          <p className="mt-3 text-sm leading-7 text-zinc-600">
            Umox Beauty is being built without the resources of a large cosmetics company or
            established technology platform. Voluntary support helps the project keep shipping.
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-ink">How funds are used</p>
          <p className="mt-3 text-sm leading-7 text-zinc-600">
            Support may be used for application development, AI recommendation services, cloud
            infrastructure, database growth, testing, localization, hosting, and administrative
            costs tied to the project.
          </p>
        </Card>
      </section>
    </div>
  );
}
