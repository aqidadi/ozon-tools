import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, getUserByToken } from "@/lib/supabase";

async function getUser(req: NextRequest) {
  const sb = createServiceClient();
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data: { user } } = await sb.auth.getUser(token);
    if (user) {
      const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).single();
      return profile;
    }
  }
  const apiToken = req.headers.get("x-api-token");
  if (apiToken) return getUserByToken(apiToken);
  return null;
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { displayName, avatarUrl } = await req.json();
  const sb = createServiceClient();

  const updates: Record<string, string> = { updated_at: new Date().toISOString() };
  if (displayName !== undefined) updates.display_name = displayName;
  if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

  await sb.from("profiles").update(updates).eq("id", user.id);
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  return NextResponse.json(user);
}
