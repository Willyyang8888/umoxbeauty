import { NextResponse } from "next/server";

import { checkoutSchema } from "@/features/support/schema";
import { checkRateLimit } from "@/lib/rate-limit";
import { createCheckoutSession } from "@/server/services/support-service";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const rate = checkRateLimit(`checkout:${ip}`, 10, 60_000);

  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const input = checkoutSchema.parse(body);
    const session = await createCheckoutSession(input);

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create checkout session.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
