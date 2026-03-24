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

  const { id, ...updates } = await req.json();
  const sb = createServiceClient();

  const { data: existing } = await sb
    .from("products")
    .select("data")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) return NextResponse.json({ error: "商品不存在" }, { status: 404 });

  const merged = { ...existing.data, ...updates };
  await sb.from("products")
    .update({ data: merged, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
