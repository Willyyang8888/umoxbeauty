import { Card } from "@/components/ui/card";
import { ContactForm } from "@/components/contact-form";
import { defaultLegalPlaceholders, getSiteContent } from "@/lib/content";

export default async function ContactPage() {
  const content = await getSiteContent();
  const placeholders = (content.legalPlaceholders ?? defaultLegalPlaceholders) as Record<string, string>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">Contact</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Contact us</h1>
        <p className="mt-4 text-base leading-8 text-zinc-600">
          For support questions, privacy requests, refund requests, or business inquiries, send us
          a message below.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <ContactForm />
        <Card>
          <p className="text-sm font-semibold text-ink">Public contact details</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-600">
            <p>Operator: {placeholders.LEGAL_COMPANY_NAME}</p>
            <p>Email: {placeholders.SUPPORT_EMAIL}</p>
            <p>
              Privacy requests, support questions, refund requests, and business inquiries may be
              sent through the contact form or email above.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
