import { Card } from "@/components/ui/card";
import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">Contact</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Reach the operating team</h1>
        <p className="mt-4 text-base leading-8 text-zinc-600">
          Use the contact form for support questions, privacy requests, or business inquiries. The
          form includes a simple anti-spam field and server-side validation.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <ContactForm />
        <Card>
          <p className="text-sm font-semibold text-ink">Public contact details</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-600">
            <p>Email: [SUPPORT_EMAIL]</p>
            <p>Registered address: [REGISTERED_ADDRESS]</p>
            <p>Business number: [BUSINESS_NUMBER]</p>
            <p>Phone: [CONTACT_PHONE]</p>
            <p>
              Privacy inquiries should be directed to the same contact channel until a dedicated
              privacy email is configured.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
