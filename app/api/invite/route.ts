import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, getUserByToken } from "@/lib/supabase";

const supabase = createServiceClient();

// GET /api/invite — 获取当前用户的邀请码 + 邀请记录
export async function GET(req: NextRequest) {
  const user = await getUserByToken(req);
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("invite_code, invite_count, plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  // 如果还没有邀请码，自动生成一个
  if (profile && !profile.invite_code) {
    let code = "";
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    await supabase.from("profiles").update({ invite_code: code }).eq("id", user.id);
    profile.invite_code = code;
  }

  // 获取邀请的用户列表（最近10个）
  const { data: invitees } = await supabase
    .from("profiles")
    .select("email, display_name, plan, created_at")
    .eq("invited_by", profile?.invite_code || "")
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    inviteCode: profile?.invite_code,
    inviteCount: profile?.invite_count || 0,
    inviteLink: `https://www.crossly.cn/?ref=${profile?.invite_code}`,
    invitees: invitees || [],
  });
}

// POST /api/invite — 注册时使用邀请码（给邀请人延长30天）
export async function POST(req: NextRequest) {
  const { inviteCode, userId } = await req.json().catch(() => ({}));
  if (!inviteCode || !userId) return NextResponse.json({ error: "参数缺失" }, { status: 400 });

  // 查找邀请人
  const { data: inviter } = await supabase
    .from("profiles")
    .select("id, plan, plan_expires_at, invite_count")
    .eq("invite_code", inviteCode.toUpperCase())
    .single();

  if (!inviter) return NextResponse.json({ error: "邀请码无效" }, { status: 404 });

  // 记录被邀请人使用了此邀请码
  await supabase.from("profiles").update({ invited_by: inviteCode.toUpperCase() }).eq("id", userId);

  // 给邀请人延长 30 天 Pro
  const now = new Date();
  const currentExpiry = inviter.plan_expires_at ? new Date(inviter.plan_expires_at) : now;
  const base = currentExpiry > now ? currentExpiry : now;
  base.setDate(base.getDate() + 30);

  await supabase.from("profiles").update({
    plan: "pro",
    plan_expires_at: base.toISOString(),
    invite_count: (inviter.invite_count || 0) + 1,
  }).eq("id", inviter.id);

  return NextResponse.json({ ok: true, message: "邀请码有效，邀请人已获得30天Pro奖励" });
}
