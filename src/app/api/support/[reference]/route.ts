import { NextResponse } from "next/server";

import { getPublicTransaction } from "@/server/services/support-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  const transaction = await getPublicTransaction(reference);

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
  }

  return NextResponse.json({
    reference: transaction.publicReference,
    amount: transaction.amount,
    currency: transaction.currency,
    status: transaction.status,
    createdAt: transaction.createdAt,
    paidAt: transaction.paidAt
  });
}
