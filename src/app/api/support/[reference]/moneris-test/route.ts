import { NextResponse } from "next/server";
import { z } from "zod";

import { completeMonerisTestPayment } from "@/server/services/support-service";

const schema = z.object({
  result: z.enum(["SUCCEEDED", "FAILED", "CANCELED"])
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const body = await request.json();
    const input = schema.parse(body);
    const status = await completeMonerisTestPayment(reference, input.result);
    const redirectTo =
      status === "SUCCEEDED"
        ? `/support/${reference}/success`
        : status === "FAILED" || status === "CANCELED"
          ? `/support/${reference}/failed`
          : `/support/${reference}/processing`;

    return NextResponse.json({ ok: true, redirectTo });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete Moneris test payment.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
