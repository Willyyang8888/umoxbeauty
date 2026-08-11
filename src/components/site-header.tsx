import Link from "next/link";

import { getSiteContent } from "@/lib/content";

export async function SiteHeader() {
  const content = await getSiteContent();

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-[0.18em] text-ink uppercase">
          {content.siteName}
        </Link>
        <nav className="flex items-center gap-6 text-sm text-zinc-600">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/support" className="rounded-full bg-brand px-4 py-2 font-medium text-white">
            Support Umox Beauty
          </Link>
        </nav>
      </div>
    </header>
  );
}
