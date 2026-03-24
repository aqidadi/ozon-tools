import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Token",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// POST /api/auth/register  { email, password, name? }
// POST /api/auth/login     { email, password }
// GET  /api/auth/me        (需要 Authorization: Bearer <token>)
// POST /api/auth/logout

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const sb = createServiceClient();

  if (action === "register") {
    const { email, password, name } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码不能为空" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少6位" }, { status: 400 });
    }

    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) {
      const msg = error.message.includes("already registered")
        ? "该邮箱已注册，请直接登录"
        : error.message;
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // 更新显示名
    if (name && data.user) {
      await sb.from("profiles").update({ display_name: name }).eq("id", data.user.id);
    }

    return NextResponse.json({
      success: true,
      message: "注册成功！请登录",
      user: { id: data.user?.id, email },
    });
  }

  if (action === "login") {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "请输入邮箱和密码" }, { status: 400 });
    }

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    // 获取 profile（含 api_token）
    const { data: profile } = await sb
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    return NextResponse.json({
      success: true,
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        plan: profile?.plan || "free",
        quota: profile?.quota || 50,
        productCount: profile?.product_count || 0,
        apiToken: profile?.api_token,  // 插件用这个
        displayName: profile?.display_name,
      },
    });
  }

  if (action === "logout") {
    await sb.auth.signOut();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (action !== "me") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const sb = createServiceClient();
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: "Token 已过期，请重新登录" }, { status: 401 });
  }

  const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).single();

  return NextResponse.json({
    id: user.id,
    email: user.email,
    plan: profile?.plan || "free",
    quota: profile?.quota || 50,
    productCount: profile?.product_count || 0,
    apiToken: profile?.api_token,
    displayName: profile?.display_name,
    avatarUrl: profile?.avatar_url,
    planExpiresAt: profile?.plan_expires_at,
  });
}
