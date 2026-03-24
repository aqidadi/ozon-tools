import { NextResponse } from "next/server";

// 汇率API：frankfurter.app（无限次，欧洲央行数据）
// 注意：VND、AED 欧洲央行不提供，使用备用数据
export async function GET() {
  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=CNY&to=RUB,USD,EUR,GBP,THB,IDR,MYR,BRL",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error("frankfurter failed");
    const data = await res.json();

    // 补充 frankfurter 不支持的货币（参考近似汇率，用户可手动调整）
    const supplemental: Record<string, number> = {
      VND: 3420,  // 越南盾，约3420 VND/CNY
      AED: 0.506, // 迪拉姆，约0.506 AED/CNY
    };

    return NextResponse.json({
      base: "CNY",
      rates: { ...data.rates, ...supplemental },
      updatedAt: new Date().toISOString(),
      source: "European Central Bank",
      note: "VND/AED 为近似值，建议手动确认",
    });
  } catch {
    // 备用硬编码汇率（2025年参考值）
    return NextResponse.json({
      base: "CNY",
      rates: {
        RUB: 12.5,
        USD: 0.138,
        EUR: 0.127,
        GBP: 0.109,
        THB: 4.82,
        IDR: 2180,
        MYR: 0.62,
        VND: 3420,
        AED: 0.506,
        BRL: 0.78,
      },
      updatedAt: new Date().toISOString(),
      source: "fallback",
    });
  }
}
