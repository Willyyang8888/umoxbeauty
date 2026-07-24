import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">Admin access</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Secure administrator login</h1>
        <p className="mt-4 text-base leading-8 text-zinc-600">
          Use seeded administrator credentials. The session is stored in secure cookies through
          Auth.js credentials authentication.
        </p>
      </div>
      <div className="mt-10">
        <AdminLoginForm />
      </div>
    </div>
  );
}
