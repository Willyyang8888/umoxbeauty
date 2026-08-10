import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Palette,
  Lightbulb,
  Shield,
  Lock,
  CreditCard,
  Heart
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { getSiteContent } from "@/lib/content";

const whatWereBuilding = [
  {
    icon: Sparkles,
    title: "Personalized recommendations",
    body: "Makeup ideas based on your tone, style, occasion, preferences, and budget."
  },
  {
    icon: Palette,
    title: "Use what you already own",
    body: "Build looks around products already in your collection."
  },
  {
    icon: Lightbulb,
    title: "Smarter beauty decisions",
    body: "Get practical suggestions without spending hours comparing products."
  }
];

const supportAreas = [
  "App development",
  "AI & recommendation technology",
  "Testing & infrastructure"
];

const trustStrip = [
  { icon: Shield, label: "Canadian company operated" },
  { icon: Lock, label: "Secure card processing" },
  { icon: CreditCard, label: "One-time payment only" },
  { icon: Heart, label: "Voluntary project support" }
];

export default async function HomePage() {
  const content = await getSiteContent();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <section className="space-y-8">
        <div className="space-y-6 text-center">
          <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">
            Independent beauty technology
          </p>
          <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-ink md:text-6xl">
            Beauty decisions, made simpler.
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-8 text-zinc-600 md:text-lg">
            Umox Beauty is an independent beauty recommendation app being built to help users
            find makeup looks, colours, and products that fit their style, preferences, and
            budget.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/support"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
            >
              Support Umox Beauty
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-ink"
            >
              Learn More
            </Link>
          </div>
          <p className="text-sm text-zinc-500">
            One-time voluntary support. No account required.
          </p>
        </div>
      </section>

      <section className="mt-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">
            What we&apos;re building
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            A better way to explore beauty
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {whatWereBuilding.map((item) => (
            <Card key={item.title} className="p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft">
                <item.icon className="h-5 w-5 text-brand" />
              </div>
              <p className="mt-5 text-base font-semibold text-ink">{item.title}</p>
              <p className="mt-2 text-sm leading-7 text-zinc-600">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <Card className="p-8 md:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">
                Support the project
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                Help us build Umox Beauty
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-600">
                Every contribution helps the independent team behind Umox Beauty continue
                designing, building, and improving the app for its users.
              </p>
              <Link
                href="/support"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
              >
                Make a contribution
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3">
              {supportAreas.map((area) => (
                <div
                  key={area}
                  className="flex items-center gap-3 rounded-2xl border border-black/5 bg-zinc-50/60 px-5 py-4"
                >
                  <span className="h-2 w-2 rounded-full bg-brand" />
                  <span className="text-sm font-medium text-ink">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-16">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {trustStrip.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-black/5 bg-white px-4 py-5 text-center"
            >
              <item.icon className="h-5 w-5 text-brand" />
              <span className="text-xs font-medium text-zinc-700">{item.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs leading-6 text-zinc-500">
          Support is voluntary, non-recurring, and does not represent an investment, equity, or
          charitable tax receipt.
        </p>
      </section>
    </div>
  );
}
