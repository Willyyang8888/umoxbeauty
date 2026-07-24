import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getContentSettings, saveContentSettings } from "@/server/services/admin-service";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await getContentSettings();
  return NextResponse.json(content);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await saveContentSettings(session.user.id, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save content settings.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
