import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────
// 义乌购搜索 API（无需认证，直接可用）
// ─────────────────────────────────────────────
async function fetchYiwugoSearch(keyword: string, page = 1, pageSize = 20) {
  // 先拿 csrf token 和 cookie
  const homeResp = await fetch("https://www.yiwugo.com/", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml",
    },
  });
  const homeHtml = await homeResp.text();
  const csrfMatch = homeHtml.match(/"csrf":"([^"]+)"/);
  const csrf = csrfMatch?.[1] ?? "";
  const setCookieHeader = homeResp.headers.get("set-cookie") ?? "";
  const cookieMatch = setCookieHeader.match(/csrfToken=([^;]+)/);
  const cookie = cookieMatch ? `csrfToken=${cookieMatch[1]}` : "";

  const searchUrl = `https://www.yiwugo.com/api/search/s.htm?keyword=${encodeURIComponent(keyword)}&pageNum=${page}&pageSize=${pageSize}&lang=zh_CN`;
  const searchResp = await fetch(searchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Referer": "https://www.yiwugo.com/",
      "x-csrf-token": csrf,
      "Cookie": cookie,
    },
  });
  const data = await searchResp.json();
  if (data.code !== "1") throw new Error(data.msg ?? "义乌购搜索失败");

  const content = data.content ?? {};
  const prslist: any[] = content.prslist ?? [];

  return {
    total: content.numfound ?? 0,
    products: prslist.map((p: any) => ({
      source: "yiwugo" as const,
      yiwugoId: String(p.id),
      yiwugoShopId: String(p.shopUrlId ?? p.shopId ?? ""),
      title: p.title ?? "",
      price: p.sellPrice ? p.sellPrice / 100 : 0, // 单位：分 → 元
      priceUnit: p.metric ?? "件",
      images: [p.picture1, p.picture2].filter(Boolean),
      moq: p.startNum ?? 1,
      monthlySales: p.dealQuantity ?? 0,
      totalSales: p.saleNumber ?? 0,
      shopName: p.shopName ?? "",
      location: p.marketOrAdress ?? p.factoryAddress ?? "",
      url: `https://www.yiwugo.com/product/${p.id}.html`,
    })),
  };
}

// ─────────────────────────────────────────────
// 工具：Unicode 转义解码
// ─────────────────────────────────────────────
function decodeUnicode(str: string): string {
  return str
    .replace(/\\u([\dA-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

// ─────────────────────────────────────────────
// 从1688商品页抓取完整数据（主图 + 详情图 + 规格）
// ─────────────────────────────────────────────
async function fetch1688Product(url: string) {
  try {
    const offerMatch = url.match(/offer\/(\d+)/) || url.match(/offerId=(\d+)/);
    const offerId = offerMatch?.[1];
    if (!offerId) throw new Error("无法识别商品ID，请检查链接格式");

    const [pcHtml, mHtml] = await Promise.allSettled([
      fetch(`https://detail.1688.com/offer/${offerId}.html`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "zh-CN,zh;q=0.9",
          "Referer": "https://www.1688.com/",
        },
        signal: AbortSignal.timeout(12000),
      }).then(r => r.text()),
      fetch(`https://m.1688.com/offer/${offerId}.html`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
          "Referer": "https://m.1688.com/",
        },
        signal: AbortSignal.timeout(10000),
      }).then(r => r.text()),
    ]);

    const pc = pcHtml.status === "fulfilled" ? pcHtml.value : "";
    const mob = mHtml.status === "fulfilled" ? mHtml.value : "";

    if (pc.includes("cloud_ip_bl") || pc.includes("bixi.alicdn.com")) {
      throw new Error("SERVER_BLOCKED: 服务器IP被1688封锁，请使用Chrome插件导入");
    }

    // 提取标题
    let title = "";
    const titleMatch = pc.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) title = titleMatch[1].replace(/[\-\|].*$/, "").trim();
    if (!title) {
      const h1Match = pc.match(/<h1[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/h1>/);
      if (h1Match) title = h1Match[1].replace(/<[^>]+>/g, "").trim();
    }

    // 提取价格
    let price = 0;
    const priceMatch = pc.match(/[\u4e00-\u9fa5]*\s*(\d+\.?\d*)\s*[\u5143\u4efb\u00a5]/);
    if (priceMatch) price = parseFloat(priceMatch[1]);
    if (!price) {
      const jsPriceMatch = pc.match(/"price"\s*:\s*"?([\d.]+)"?/);
      if (jsPriceMatch) price = parseFloat(jsPriceMatch[1]);
    }

    // 提取主图
    const mainImages: string[] = [];
    const thumbMatches = pc.matchAll(/"picUrl"\s*:\s*"([^"]+)"/g);
    for (const m of thumbMatches) {
      const src = m[1].replace(/^\/\//, "https://").split("?")[0];
      if (src && !mainImages.includes(src)) mainImages.push(src);
      if (mainImages.length >= 8) break;
    }

    return {
      source: "1688" as const,
      title: decodeUnicode(title),
      price,
      images: mainImages,
      detailImages: [] as string[],
      specs: {} as Record<string, string>,
      url,
    };
  } catch (err: any) {
    throw new Error(err.message ?? "1688抓取失败");
  }
}

// ─────────────────────────────────────────────
// GET: 义乌购关键词搜索
// POST: 1688单个/批量链接导入（服务端，1688已封锁请用插件）
// ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source") ?? "yiwugo";
  const keyword = searchParams.get("keyword") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") ?? "20"), 50);

  if (!keyword) {
    return NextResponse.json({ error: "请提供关键词" }, { status: 400 });
  }

  try {
    if (source === "yiwugo") {
      const result = await fetchYiwugoSearch(keyword, page, pageSize);
      return NextResponse.json({ ok: true, ...result });
    }
    return NextResponse.json({ error: "不支持的货源" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const urls: string[] = body.urls ?? (body.url ? [body.url] : []);

  if (!urls.length) {
    return NextResponse.json({ error: "请提供商品链接" }, { status: 400 });
  }

  // 批量模式（最多20个，5并发）
  if (urls.length > 1) {
    const results: any[] = [];
    const errors: string[] = [];
    const concurrency = 5;
    for (let i = 0; i < urls.length; i += concurrency) {
      const chunk = urls.slice(i, i + concurrency);
      const settled = await Promise.allSettled(chunk.map(u => fetch1688Product(u)));
      settled.forEach((r, idx) => {
        if (r.status === "fulfilled") results.push(r.value);
        else errors.push(`${chunk[idx]}: ${r.reason?.message ?? "失败"}`);
      });
      if (i + concurrency < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    return NextResponse.json({ ok: true, results, errors });
  }

  // 单个
  try {
    const data = await fetch1688Product(urls[0]);
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    const isBlocked = err.message?.includes("SERVER_BLOCKED");
    return NextResponse.json(
      { error: err.message, blocked: isBlocked },
      { status: isBlocked ? 503 : 500 }
    );
  }
}
