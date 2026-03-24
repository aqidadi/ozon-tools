import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// 爱发电 webhook 验证
// 文档：https://afdian.com/p/9c9d6b5039f011eca29452540025c377
// 爱发电会在用户购买后 POST 到这个地址

const PLANS: Record<string, { months: number; name: string }> = {
  // ⬇ 爱发电后台每个方案的 plan_id，建好后填入这里
  // 格式：爱发电方案ID -> { months: 有效月数, name: 名称 }
  // months=0 表示终身；0.033≈1天；0.25≈7天
  "trial_24h":    { months: -1,  name: "24小时体验" },  // 特殊：按小时算
  "week_card":    { months: -7,  name: "周卡7天" },      // 特殊：按天算
  "pro_monthly":  { months: 1,   name: "月度Pro" },
  "pro_yearly":   { months: 12,  name: "年度Pro" },
  "pro_lifetime": { months: 0,   name: "终身Pro" },
};

// 按金额兜底匹配（plan_id 不匹配时用金额判断）
function getPlanByAmount(amount: number): { months: number; name: string } {
  if (amount <= 6)    return { months: -1,  name: "24小时体验" };
  if (amount <= 20)   return { months: -7,  name: "周卡7天" };
  if (amount <= 45)   return { months: 1,   name: "月度Pro" };
  if (amount <= 310)  return { months: 12,  name: "年度Pro" };
  return { months: 0, name: "终身Pro" }; // 999+
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 爱发电签名验证（防止伪造）
    const token = process.env.AFDIAN_TOKEN;
    if (token) {
      const { ec, em } = body;
      // 简单验证：实际使用时按爱发电文档实现 md5 签名验证
      if (ec !== 200) {
        return NextResponse.json({ ec: 200, em: "ok" });
      }
    }

    const order = body.data?.order;
    if (!order) {
      return NextResponse.json({ ec: 200, em: "ok" });
    }

    const {
      out_trade_no,   // 订单号
      user_id: afdianUserId, // 爱发电用户ID
      plan_id,        // 套餐ID
      month,          // 购买月数
      remark,         // 用户备注（用来传 email）
      total_amount,   // 金额（字符串，如 "99.00"）
    } = order;

    // remark 里放用户邮箱（让用户购买时在备注里填）
    const email = remark?.trim();
    if (!email || !email.includes("@")) {
      // 记录但不报错（爱发电可能有其他途径关联）
      console.log("No email in remark for order:", out_trade_no);
      return NextResponse.json({ ec: 200, em: "ok" });
    }

    const sb = createServiceClient();

    // 找到对应用户
    const { data: authUser } = await sb.auth.admin.listUsers();
    const targetUser = authUser?.users?.find(u => u.email === email);
    if (!targetUser) {
      console.log("User not found for email:", email);
      return NextResponse.json({ ec: 200, em: "ok" });
    }

    // 计算有效期（支持小时/天/月/永久）
    const amount = parseFloat(total_amount) || 0;
    const planConfig = PLANS[plan_id] ?? getPlanByAmount(amount);
    let expiresAt: string | null = null;

    if (planConfig.months === 0) {
      expiresAt = null; // 终身
    } else if (planConfig.months === -1) {
      // 24小时体验
      const exp = new Date();
      exp.setHours(exp.getHours() + 24);
      expiresAt = exp.toISOString();
    } else if (planConfig.months < 0) {
      // 负数表示天数（如 -7 = 7天）
      const exp = new Date();
      exp.setDate(exp.getDate() + Math.abs(planConfig.months));
      expiresAt = exp.toISOString();
    } else {
      const exp = new Date();
      exp.setMonth(exp.getMonth() + planConfig.months);
      expiresAt = exp.toISOString();
    }

    // 更新用户 plan
    await sb.from("profiles").update({
      plan: "pro",
      quota: -1,
      plan_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }).eq("id", targetUser.id);

    // 记录订阅
    await sb.from("subscriptions").insert({
      user_id: targetUser.id,
      plan: planConfig.name,
      amount: Math.round(parseFloat(total_amount) * 100),
      status: "paid",
      payment_provider: "afdian",
      payment_id: out_trade_no,
      starts_at: new Date().toISOString(),
      expires_at: expiresAt,
    });

    console.log(`✅ 用户 ${email} 升级到 Pro，有效期至 ${expiresAt || "永久"}`);
    return NextResponse.json({ ec: 200, em: "ok" });

  } catch (e) {
    console.error("Payment webhook error:", e);
    return NextResponse.json({ ec: 200, em: "ok" }); // 必须返回200，否则爱发电会重试
  }
}

// 手动激活 Pro（管理员用）
export async function PUT(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key");
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, months } = await req.json(); // months=0 = 终身
  const sb = createServiceClient();

  const { data: users } = await sb.auth.admin.listUsers();
  const user = users?.users?.find(u => u.email === email);
  if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

  let expiresAt: string | null = null;
  if (months > 0) {
    const exp = new Date();
    exp.setMonth(exp.getMonth() + months);
    expiresAt = exp.toISOString();
  }

  await sb.from("profiles").update({
    plan: "pro",
    quota: -1,
    plan_expires_at: expiresAt,
  }).eq("id", user.id);

  return NextResponse.json({ ok: true, email, expiresAt: expiresAt || "终身" });
}
