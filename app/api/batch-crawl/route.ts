import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, getUserByToken } from "@/lib/supabase";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Token",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

async function getUser(req: NextRequest) {
  const sb = createServiceClient();
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data: { user } } = await sb.auth.getUser(token);
    if (user) {
      const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).single();
      return profile;
    }
  }
  const apiToken = req.headers.get("x-api-token");
  if (apiToken) return getUserByToken(apiToken);
  return null;
}

// 从 1688 页面 HTML 解析商品数据
function parse1688Html(html: string, url: string) {
  // 标题
  let title = "";
  const titleMatch = html.match(/<h1[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)
    || html.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch) title = titleMatch[1].replace(/<[^>]+>/g, "").trim().replace(/[-|].*?(1688|阿里).*$/, "").trim();

  // 价格
  let price = 0;
  const priceMatches = html.match(/[\¥￥]\s*(\d+(?:\.\d{1,2})?)/g) || [];
  const prices = priceMatches
    .map(m => parseFloat(m.replace(/[¥￥\s]/g, "")))
    .filter(n => n >= 1 && n <= 9999);
  if (prices.length > 0) {
    const freq: Record<number, number> = {};
    prices.forEach(p => { freq[p] = (freq[p] || 0) + 1; });
    const repeated = prices.filter(p => freq[p] >= 2);
    price = repeated.length > 0 ? Math.min(...repeated) : prices[0];
  }

  // 图片（ibank路径）
  const ibankRegex = /https?:\/\/cbu01\.alicdn\.com\/img\/ibank\/[^"'\s>?#]{10,}\.jpg/g;
  const ibankMatches = html.match(ibankRegex) || [];
  const blackList = ['logo', 'setting', 'icon', 'gear', 'check', 'loading', 'avatar', 'spaceball'];
  const allImgs = [...new Set(ibankMatches)]
    .filter(u => !blackList.some(k => u.toLowerCase().includes(k)))
    .map(u => u.replace(/(_\d+x\d+.*\.jpg$)|(\.\d+x\d+.*\.jpg$)/i, ""));

  const images = allImgs.slice(0, 10);
  const detailImages = allImgs.slice(10, 40);

  // 规格参数（从 JSON 数据里找）
  const specs: Record<string, string> = {};
  const skuMatch = html.match(/"attributes"\s*:\s*(\[[\s\S]{0,2000}?\])/);
  if (skuMatch) {
    try {
      const attrs = JSON.parse(skuMatch[1]);
      if (Array.isArray(attrs)) {
        attrs.forEach((a: { attrName?: string; attrValue?: string }) => {
          if (a.attrName && a.attrValue) specs[a.attrName] = a.attrValue;
        });
      }
    } catch {}
  }

  // 月销量
  let monthlySales = 0;
  const salesMatch = html.match(/月销[量售]?\s*[：:]?\s*([\d,]+)/);
  if (salesMatch) monthlySales = parseInt(salesMatch[1].replace(/,/g, ""));

  return {
    id: crypto.randomUUID(),
    title,
    titleRu: "",
    price,
    weight: 0,
    images,
    detailImages,
    specs,
    monthlySales,
    moq: 1,
    sellPrices: {},
    sellPriceRub: 0,
    note: "",
    sourceUrl: url,
  };
}

// POST /api/batch-crawl
// body: { urls: string[] }  最多100个
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401, headers: CORS });
  }

  const { urls } = await req.json().catch(() => ({ urls: [] }));
  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: "请提供 urls 数组" }, { status: 400, headers: CORS });
  }

  const validUrls = urls
    .filter(u => typeof u === "string" && (u.includes("1688.com") || u.includes("yiwugo.com")))
    .slice(0, 100);

  if (validUrls.length === 0) {
    return NextResponse.json({ error: "没有有效的 1688 或义乌购链接" }, { status: 400, headers: CORS });
  }

  const sb = createServiceClient();
  const results: { url: string; ok: boolean; title?: string; error?: string }[] = [];

  // 并发抓取（最多5个并发，避免被封）
  const CONCURRENCY = 5;
  for (let i = 0; i < validUrls.length; i += CONCURRENCY) {
    const batch = validUrls.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (url) => {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Referer": "https://www.1688.com/",
          },
          signal: AbortSignal.timeout(15000),
        });

        if (!res.ok) {
          results.push({ url, ok: false, error: `HTTP ${res.status}` });
          return;
        }

        const html = await res.text();
        const product = parse1688Html(html, url);

        if (!product.title) {
          results.push({ url, ok: false, error: "解析失败，可能需要登录" });
          return;
        }

        // 存入数据库
        await sb.from("products").upsert({
          id: product.id,
          user_id: user.id,
          data: product,
        });

        results.push({ url, ok: true, title: product.title });
      } catch (e) {
        results.push({ url, ok: false, error: String(e).slice(0, 100) });
      }
    }));

    // 每批之间稍微停一下，避免被限速
    if (i + CONCURRENCY < validUrls.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const successCount = results.filter(r => r.ok).length;
  return NextResponse.json({
    total: validUrls.length,
    success: successCount,
    failed: validUrls.length - successCount,
    results,
  }, { headers: CORS });
}
