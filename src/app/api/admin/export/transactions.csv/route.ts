import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { exportTransactionsCsv } from "@/server/services/admin-service";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const csv = await exportTransactionsCsv({
    status: (searchParams.get("status") as
      | "ALL"
      | "CREATED"
      | "REQUIRES_PAYMENT"
      | "PROCESSING"
      | "SUCCEEDED"
      | "FAILED"
      | "CANCELED"
      | "PARTIALLY_REFUNDED"
      | "REFUNDED"
      | "DISPUTED"
      | null) ?? undefined,
    gateway: (searchParams.get("gateway") as "ALL" | "STRIPE" | "MONERIS" | null) ?? undefined,
    email: searchParams.get("email") ?? undefined
  });

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="transactions.csv"'
    }
  });
}
