import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getGatewayConfigurations, saveGatewaySettings } from "@/server/services/admin-service";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configs = await getGatewayConfigurations();
  return NextResponse.json(configs);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await saveGatewaySettings(session.user.id, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save gateway settings.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
