import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, getUserByToken, checkQuota } from "@/lib/supabase";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,PATCH,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Token",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// 从请求中获取用户身份
// 支持两种方式：
//   1. Authorization: Bearer <supabase_access_token>  （网页登录态）
//   2. X-Api-Token: <api_token>                        （Chrome 插件）
async function getUser(req: NextRequest) {
  const sb = createServiceClient();

  // 方式1：Supabase access token
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data: { user } } = await sb.auth.getUser(token);
    if (user) {
      const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).single();
      return profile;
    }
  }

  // 方式2：API token（插件）
  const apiToken = req.headers.get("x-api-token");
  if (apiToken) {
    return getUserByToken(apiToken);
  }

  return null;
}

export async function POST(req: NextRequest) {
  const sb = createServiceClient();
  const user = await getUser(req);

  if (!user) {
    return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });
  }

  // 配额检查
  const quota = checkQuota(user);
  if (!quota.ok) {
    return NextResponse.json({ error: quota.message, code: "QUOTA_EXCEEDED" }, { status: 403 });
  }

  const product = await req.json();
  if (!product || !product.title) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }
  product.id = product.id || crypto.randomUUID();

  const { error } = await sb.from("products").upsert({
    id: product.id,
    user_id: user.id,
    data: product,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: product.id });
}

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("products")
    .select("id, data, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = (data || []).map((row) => ({
    ...row.data,
    id: row.id,
  }));

  return NextResponse.json({
    products,
    plan: user.plan,
    quota: user.quota,
    productCount: user.product_count,
  });
}

export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await req.json();
  const sb = createServiceClient();

  const { error } = await sb
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // 只能删自己的

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id, ...updates } = await req.json();
  const sb = createServiceClient();

  // 先拿出原数据
  const { data: existing } = await sb
    .from("products")
    .select("data")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }

  const merged = { ...existing.data, ...updates };
  const { error } = await sb
    .from("products")
    .update({ data: merged, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
