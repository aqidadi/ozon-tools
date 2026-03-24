import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// 浏览器端客户端（带 session 管理）
export const supabase = supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

// 服务端客户端（用 service role key，跳过 RLS）
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase env vars not configured");
  return createClient(url, key, { auth: { persistSession: false } });
}

export interface Profile {
  id: string;
  email: string;
  display_name?: string;
  plan: "free" | "pro";
  plan_expires_at?: string;
  product_count: number;
  quota: number;
  api_token: string;
  created_at: string;
}

// 从 API token 获取用户（插件使用）
export async function getUserByToken(token: string): Promise<Profile | null> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("profiles")
    .select("*")
    .eq("api_token", token)
    .single();
  return data;
}

// 检查配额
export function checkQuota(profile: Profile): { ok: boolean; message?: string } {
  if (profile.quota === -1) return { ok: true }; // 无限
  if (profile.product_count >= profile.quota) {
    return {
      ok: false,
      message: `免费版最多导入${profile.quota}个商品，请升级到 Pro 解锁无限导入`,
    };
  }
  return { ok: true };
}

// 检查 pro 是否过期
export function isPro(profile: Profile): boolean {
  if (profile.plan !== "pro") return false;
  if (!profile.plan_expires_at) return true; // 永久 pro
  return new Date(profile.plan_expires_at) > new Date();
}
