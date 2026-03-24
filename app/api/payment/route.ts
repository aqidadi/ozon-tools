import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// 爱发电 webhook 验证
// 文档：https://afdian.com/p/9c9d6b5039f011eca29452540025c377
// 爱发电会在用户购买后 POST 到这个地址

const PLANS: Record<string, { months: number; name: string }> = {
  // 对应爱发电的套餐 plan_id（在爱发电后台设置）
  "plan_monthly": { months: 1, name: "Pro 月度" },
  "plan_yearly":  { months: 12, name: "Pro 年度" },
  "plan_lifetime": { months: 0, name: "Pro 终身" }, // 0 = 永久
};

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

    // 计算有效期
    const planConfig = PLANS[plan_id] || { months: month || 1, name: "Pro" };
    let expiresAt: string | null = null;

    if (planConfig.months === 0) {
      expiresAt = null; // 终身
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
