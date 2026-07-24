import { NextResponse } from "next/server";
import { z } from "zod";

import { checkRateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  message: z.string().trim().min(10).max(1000),
  honeypot: z.string().max(0).optional().default("")
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const rate = checkRateLimit(`contact:${ip}`, 5, 60_000);

  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const input = contactSchema.parse(body);

    if (input.honeypot) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit contact form.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
