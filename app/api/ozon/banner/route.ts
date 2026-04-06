import { NextRequest, NextResponse } from "next/server";

// 品类 Banner 配置
const TEMPLATES: Record<string, {
  title: string;
  subtitle: string;
  emoji: string;
  bg1: string;
  bg2: string;
  textColor: string;
}> = {
  toy: {
    title: "Мягкие игрушки из Китая",
    subtitle: "★  Быстрая доставка  ★  Качество проверено  ★  Лучшие цены",
    emoji: "🧸",
    bg1: "#ea4c89",
    bg2: "#f59e0b",
    textColor: "#ffffff",
  },
  phone: {
    title: "Аксессуары для телефонов",
    subtitle: "✓  Все модели  ✓  Противоударные  ✓  Быстрая зарядка",
    emoji: "📱",
    bg1: "#1e40af",
    bg2: "#3b82f6",
    textColor: "#ffffff",
  },
  home: {
    title: "Товары для дома из Китая",
    subtitle: "✓  Удобно  ✓  Красиво  ✓  Недорого  ✓  Быстрая доставка",
    emoji: "🏠",
    bg1: "#14532d",
    bg2: "#22c55e",
    textColor: "#ffffff",
  },
  beauty: {
    title: "Красота и уход из Китая",
    subtitle: "✦  Маникюр  ✦  Уход за кожей  ✦  Тренды сезона",
    emoji: "💄",
    bg1: "#6b21a8",
    bg2: "#ec4899",
    textColor: "#ffffff",
  },
  general: {
    title: "Всё из Китая — лучшие цены!",
    subtitle: "✓  Быстро  ✓  Надёжно  ✓  Выгодно  ✓  Широкий ассортимент",
    emoji: "🛒",
    bg1: "#b45309",
    bg2: "#f59e0b",
    textColor: "#ffffff",
  },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "toy";
  const storeName = searchParams.get("store") || "Мой Магазин";

  const tpl = TEMPLATES[category] || TEMPLATES.toy;

  // 生成 SVG → 转 PNG via Sharp（Vercel支持）
  const W = 2832;
  const H = 600;

  // 用 SVG 生成，Vercel Edge 不支持 Canvas，但支持返回 SVG 或用 Sharp
  // 这里直接返回 SVG（可被浏览器显示/截图，或前端用 canvas 转 PNG）
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${tpl.bg1};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${tpl.bg2};stop-opacity:1"/>
    </linearGradient>
    <!-- 装饰圆圈 -->
    <filter id="blur">
      <feGaussianBlur stdDeviation="40"/>
    </filter>
  </defs>
  
  <!-- 背景 -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  
  <!-- 装饰圆圈（磨砂感） -->
  <circle cx="200" cy="300" r="300" fill="white" fill-opacity="0.06" filter="url(#blur)"/>
  <circle cx="${W - 200}" cy="300" r="250" fill="white" fill-opacity="0.06" filter="url(#blur)"/>
  <circle cx="${W / 2}" cy="-50" r="350" fill="white" fill-opacity="0.04" filter="url(#blur)"/>
  
  <!-- 左侧装饰线 -->
  <rect x="80" y="160" width="6" height="280" rx="3" fill="white" fill-opacity="0.4"/>
  <rect x="100" y="200" width="3" height="200" rx="1.5" fill="white" fill-opacity="0.25"/>
  
  <!-- 右侧装饰圆角框 -->
  <rect x="${W - 380}" y="80" width="300" height="440" rx="30" fill="white" fill-opacity="0.08"/>
  
  <!-- Emoji 大字 -->
  <text x="${W - 230}" y="370" font-size="180" text-anchor="middle" dominant-baseline="middle">${tpl.emoji}</text>
  
  <!-- 品牌小标 -->
  <rect x="130" y="155" width="180" height="36" rx="18" fill="white" fill-opacity="0.2"/>
  <text x="220" y="178" font-family="Arial,sans-serif" font-size="18" font-weight="700" 
    fill="white" fill-opacity="0.9" text-anchor="middle">Crossly · 义乌直发</text>
  
  <!-- 主标题 -->
  <text x="150" y="310" font-family="Arial Black,Arial,sans-serif" font-size="88" font-weight="900" 
    fill="${tpl.textColor}" letter-spacing="-1">${tpl.title}</text>
  
  <!-- 副标题 -->
  <text x="150" y="400" font-family="Arial,sans-serif" font-size="42" font-weight="400" 
    fill="${tpl.textColor}" fill-opacity="0.85">${tpl.subtitle}</text>
  
  <!-- 店铺名 -->
  <text x="150" y="490" font-family="Arial,sans-serif" font-size="36" font-weight="700" 
    fill="${tpl.textColor}" fill-opacity="0.7">${storeName}</text>
  
  <!-- 底部装饰波浪线 -->
  <path d="M0,560 Q${W/4},530 ${W/2},560 Q${W*3/4},590 ${W},560 L${W},${H} L0,${H} Z" 
    fill="white" fill-opacity="0.06"/>
</svg>`;

  // 尝试用 Sharp 转成 PNG（Vercel 支持 sharp）
  try {
    const sharp = (await import("sharp")).default;
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .resize(W, H)
      .toBuffer();

    return new NextResponse(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="crossly-banner-${category}.png"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    // Sharp 不可用时直接返回 SVG
    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="crossly-banner-${category}.svg"`,
      },
    });
  }
}
