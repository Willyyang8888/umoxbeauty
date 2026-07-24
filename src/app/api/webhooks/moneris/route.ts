import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "BLOCKED_BY_MONERIS_ACCOUNT_CONFIGURATION",
      message:
        "Moneris production webhook handling is pending merchant account product confirmation. Use the internal Moneris test simulation flow for non-production validation."
    },
    { status: 501 }
  );
}
