import Link from "next/link";

import { auth } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/transactions", label: "Transactions" },
  { href: "/admin/refunds", label: "Refunds" },
  { href: "/admin/settings/gateways", label: "Gateway Settings" },
  { href: "/admin/settings/content", label: "Content Settings" },
  { href: "/admin/audit-logs", label: "Audit Logs" },
  { href: "/admin/deployment-readiness", label: "Release Readiness" }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[240px_1fr]">
      <aside className="rounded-panel border border-black/5 bg-white p-5 shadow-panel">
        <p className="text-xs font-semibold tracking-[0.2em] text-brand uppercase">Admin</p>
        <p className="mt-3 text-sm font-semibold text-ink">
          {session?.user?.name ?? session?.user?.email ?? "Administrator"}
        </p>
        <div className="mt-6 space-y-2 text-sm text-zinc-600">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-2xl px-4 py-3 transition hover:bg-zinc-50 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </aside>
      <div>{children}</div>
    </div>
  );
}
