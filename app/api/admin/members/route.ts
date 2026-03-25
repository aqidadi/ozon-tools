import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, plan, quota, subscription_expires_at, created_at, api_token")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 获取 auth.users 邮箱
  const { data: users } = await supabase.auth.admin.listUsers();
  const emailMap: Record<string, string> = {};
  if (users?.users) {
    for (const u of users.users) emailMap[u.id] = u.email ?? "";
  }

  const result = (data || []).map(p => ({ ...p, email: emailMap[p.id] || "—" }));
  return NextResponse.json(result);
}
