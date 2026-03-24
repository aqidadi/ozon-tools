import { NextResponse } from "next/server";

// 汇率API：使用 exchangerate-api.com 免费版（1500次/月）
// 备用：frankfurter.app（无限次，欧洲央行数据）
export async function GET() {
  try {
    // 主力：frankfurter.app（免费无限制，欧洲央行）
    const res = await fetch("https://api.frankfurter.app/latest?from=CNY&to=RUB,USD,EUR,THB,IDR,MYR,VND", {
      next: { revalidate: 3600 }, // 缓存1小时
    });
    if (!res.ok) throw new Error("frankfurter failed");
    const data = await res.json();
    return NextResponse.json({
      base: "CNY",
      rates: data.rates,
      updatedAt: new Date().toISOString(),
      source: "European Central Bank",
    });
  } catch {
    // 备用硬编码汇率
    return NextResponse.json({
      base: "CNY",
      rates: { RUB: 12.5, USD: 0.138, EUR: 0.127, THB: 4.82, IDR: 2180, MYR: 0.62, VND: 3420 },
      updatedAt: new Date().toISOString(),
      source: "fallback",
    });
  }
}
