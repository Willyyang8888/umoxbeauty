import { NextResponse } from "next/server";

import { StripeGateway } from "@/features/payments/gateways/stripe-gateway";
import { handleStripeWebhookEvent } from "@/server/services/support-service";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  try {
    const payload = await request.text();
    const gateway = new StripeGateway();
    const event = await gateway.verifyWebhook(payload, signature);

    await handleStripeWebhookEvent({
      eventId: event.eventId,
      eventType: event.eventType,
      payload: event.payload as Record<string, unknown>
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
