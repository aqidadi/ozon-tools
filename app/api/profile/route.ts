import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, getUserByToken } from "@/lib/supabase";

async function getAuthUser(req: NextRequest) {
  const sb = createServiceClient();
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data: { user } } = await sb.auth.getUser(token);
    if (user) return { id: user.id };
  }
  const apiToken = req.headers.get("x-api-token");
  if (apiToken) {
    const profile = await getUserByToken(apiToken);
    if (profile) return { id: profile.id };
  }
  return null;
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { displayName, avatarUrl } = await req.json();
  const sb = createServiceClient();

  const updates: Record<string, string> = { updated_at: new Date().toISOString() };
  if (displayName !== undefined) updates.display_name = displayName;
  if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

  const { error } = await sb.from("profiles").update(updates).eq("id", authUser.id);
  if (error) {
    console.error("profile update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const sb = createServiceClient();
  const { data: profile } = await sb.from("profiles").select("*").eq("id", authUser.id).single();
  return NextResponse.json(profile);
}
