import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { refundSchema } from "@/features/support/schema";
import { createRefund } from "@/server/services/admin-service";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const input = refundSchema.parse(body);
    const refund = await createRefund({
      adminUserId: session.user.id,
      transactionId: input.transactionId,
      amount: input.amount,
      reason: input.reason
    });

    return NextResponse.json({ refund }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create refund.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
