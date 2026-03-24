import { NextResponse } from "next/server";

// 主力：exchangerate-api.com 免费版（open.er-api.com，无需 key，每月1500次）
// 备用：hardcode 近期参考值
export async function GET() {
  try {
    const res = await fetch(
      "https://open.er-api.com/v6/latest/CNY",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error("er-api failed");
    const data = await res.json();
    if (data.result !== "success") throw new Error("er-api error");

    const r = data.rates;
    return NextResponse.json({
      base: "CNY",
      rates: {
        RUB: r.RUB,
        USD: r.USD,
        EUR: r.EUR,
        GBP: r.GBP,
        THB: r.THB,
        IDR: r.IDR,
        MYR: r.MYR,
        BRL: r.BRL,
        AED: r.AED,
        VND: r.VND,
      },
      updatedAt: new Date().toISOString(),
      source: "open.er-api.com",
    });
  } catch {
    // 备用硬编码（2025年3月参考值）
    return NextResponse.json({
      base: "CNY",
      rates: {
        RUB: 12.06,
        USD: 0.145,
        EUR: 0.125,
        GBP: 0.108,
        THB: 4.72,
        IDR: 2380,
        MYR: 0.637,
        BRL: 0.784,
        AED: 0.532,
        VND: 3680,
      },
      updatedAt: new Date().toISOString(),
      source: "fallback",
    });
  }
}
