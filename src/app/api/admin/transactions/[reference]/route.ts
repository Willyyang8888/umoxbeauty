import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getTransactionDetails } from "@/server/services/admin-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reference } = await params;
  const transaction = await getTransactionDetails(reference);

  if (!transaction) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(transaction);
}
