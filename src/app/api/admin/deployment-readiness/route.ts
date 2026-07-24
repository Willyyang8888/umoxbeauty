import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getReleaseReadiness } from "@/lib/release-readiness";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const readiness = await getReleaseReadiness();
  return NextResponse.json(readiness);
}
