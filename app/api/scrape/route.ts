import { NextRequest, NextResponse } from "next/server";

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

    // 同时请求 PC版 和 移动版，PC版有更多结构化数据
    const [pcHtml, mHtml] = await Promise.allSettled([
      fetch(`https://detail.1688.com/offer/${offerId}.html`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "zh-CN,zh;q=0.9",
          "Referer": "https://www.1688.com/",
        },
        signal: AbortSignal.timeout(12000),
      }).then(r => r.ok ? r.text() : ""),
      fetch(`https://m.1688.com/offer/${offerId}.html`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "zh-CN,zh;q=0.9",
          "Referer": "https://m.1688.com/",
        },
        signal: AbortSignal.timeout(12000),
      }).then(r => r.ok ? r.text() : ""),
    ]);

    const html = (pcHtml.status === "fulfilled" ? pcHtml.value : "") +
                 (mHtml.status === "fulfilled" ? mHtml.value : "");

    if (!html || html.length < 500) throw new Error("页面加载失败，1688可能需要登录或IP受限");

    // ── 标题 ──
    let title = "";
    for (const pat of [
      /"subject"\s*:\s*"([^"]{5,200})"/,
      /"title"\s*:\s*"([^"]{5,200})"/,
      /<title>([^<|]+)/,
      /<h1[^>]*>([^<]{5,100})<\/h1>/,
    ]) {
      const m = html.match(pat);
      if (m?.[1]) {
        title = decodeUnicode(m[1]).replace(/[-_|].*?(1688|阿里|淘宝).*$/i, "").trim();
        if (title.length > 5) break;
      }
    }
    if (!title) throw new Error("无法提取商品标题，请检查链接");

    // ── 价格 ──
    let price = 0;
    for (const pat of [
      /"priceInfo"[\s\S]{0,200}?"price"\s*:\s*"([\d.]+)"/,
      /"startPrice"\s*:\s*"([\d.]+)"/,
      /"price"\s*:\s*"([\d.]+)"/,
      /"minPrice"\s*:\s*"?([\d.]+)"?/,
      /[￥¥]\s*([\d.]+)/,
    ]) {
      const m = html.match(pat);
      if (m?.[1]) {
        const p = parseFloat(m[1]);
        if (p > 0 && p < 999999) { price = p; break; }
      }
    }

    // ── 主图（商品展示图）──
    const mainImages: string[] = [];
    const seenUrls = new Set<string>();

    const addImage = (src: string) => {
      const cleaned = src.split("?")[0]
        .replace(/_\d+x\d+\.(jpg|jpeg|png|webp)/i, "_800x800.$1")
        .replace(/_(compress|webp)\.(jpg|jpeg|png|webp)/i, ".$1");
      if (!seenUrls.has(cleaned) && /alicdn\.com|aliyuncs\.com/i.test(cleaned)) {
        seenUrls.add(cleaned);
        mainImages.push(cleaned);
      }
    };

    // 从 JSON 数据里提取主图数组（最可靠）
    const imgArrayPatterns = [
      /"imageList"\s*:\s*\[([^\]]+)\]/,
      /"images"\s*:\s*\[([^\]]+)\]/,
      /"mainImages"\s*:\s*\[([^\]]+)\]/,
    ];
    for (const pat of imgArrayPatterns) {
      const m = html.match(pat);
      if (m?.[1]) {
        const urls = m[1].match(/https?:\/\/[^"'\s,]+\.(jpg|jpeg|png|webp)/gi) || [];
        urls.forEach(addImage);
        if (mainImages.length >= 5) break;
      }
    }

    // 补充从 HTML 正则扫描
    if (mainImages.length < 3) {
      const allImgUrls = html.matchAll(/https?:\/\/(cbu01|img|sc04|sc01)\.alicdn\.com\/[^"'\s\\]+\.(jpg|jpeg|png|webp)/gi);
      for (const m of allImgUrls) {
        addImage(m[0]);
        if (mainImages.length >= 8) break;
      }
    }

    // ── 详情图（商品描述区大图）──
    const detailImages: string[] = [];
    const seenDetail = new Set<string>();

    // 描述区的图片通常在 descContent / description 字段
    const descPatterns = [
      /"descContent"\s*:\s*"([^"]{50,})"/,
      /"description"\s*:\s*"([^"]{50,})"/,
      /"desc"\s*:\s*"([^"]{50,})"/,
      /id="J_DivItemDesc"[^>]*>([\s\S]{100,5000}?)<\/div>/,
      /class="[^"]*detail[^"]*"[^>]*>([\s\S]{100,5000}?)<\/div>/i,
    ];

    for (const pat of descPatterns) {
      const m = html.match(pat);
      if (m?.[1]) {
        const chunk = decodeUnicode(m[1]);
        const imgUrls = chunk.matchAll(/https?:\/\/[^"'\s\\]+\.(jpg|jpeg|png|webp)/gi);
        for (const img of imgUrls) {
          const src = img[0].split("?")[0];
          if (!seenDetail.has(src) && /alicdn\.com|aliyuncs\.com/i.test(src)) {
            seenDetail.add(src);
            detailImages.push(src);
            if (detailImages.length >= 20) break;
          }
        }
        if (detailImages.length > 0) break;
      }
    }

    // ── 规格参数 ──
    const specs: Record<string, string> = {};

    // 从 JSON 里找 attributes / skuProps
    const specPatterns = [
      /"attributes"\s*:\s*(\[[^\]]{10,}\])/,
      /"skuProps"\s*:\s*(\[[^\]]{10,}\])/,
      /"props"\s*:\s*(\[[^\]]{10,}\])/,
    ];
    for (const pat of specPatterns) {
      try {
        const m = html.match(pat);
        if (m?.[1]) {
          const arr = JSON.parse(m[1]);
          if (Array.isArray(arr)) {
            for (const item of arr.slice(0, 20)) {
              const k = item.name || item.attributeName || item.propName;
              const v = item.value || item.attributeValue || item.propValue ||
                       (Array.isArray(item.values) ? item.values.map((x: { name?: string }) => x.name || x).join("、") : "");
              if (k && v && typeof k === "string" && typeof v === "string") {
                specs[decodeUnicode(k)] = decodeUnicode(v);
              }
            }
          }
          if (Object.keys(specs).length > 0) break;
        }
      } catch {}
    }

    // ── 店铺名 ──
    let shopName = "";
    for (const pat of [
      /"sellerNick"\s*:\s*"([^"]+)"/,
      /"companyName"\s*:\s*"([^"]+)"/,
      /"memberName"\s*:\s*"([^"]+)"/,
    ]) {
      const m = html.match(pat);
      if (m?.[1]) { shopName = decodeUnicode(m[1]); break; }
    }

    // ── 月销量 ──
    let monthlySales = 0;
    for (const pat of [
      /"monthSold"\s*:\s*(\d+)/,
      /"soldCount"\s*:\s*(\d+)/,
      /成交\s*(\d+)/,
    ]) {
      const m = html.match(pat);
      if (m?.[1]) { monthlySales = parseInt(m[1]); break; }
    }

    // ── 最小起订量 ──
    let moq = 1;
    const moqMatch = html.match(/"minOrderQuantity"\s*:\s*(\d+)/) ||
                     html.match(/"beginAmount"\s*:\s*(\d+)/);
    if (moqMatch?.[1]) moq = parseInt(moqMatch[1]);

    return {
      success: true,
      offerId,
      title,
      price,
      images: mainImages,
      detailImages,
      specs,
      shopName,
      monthlySales,
      moq,
      sourceUrl: url,
    };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "抓取失败";
    return { success: false, error: message };
  }
}

// ─────────────────────────────────────────────
// POST /api/scrape  — 单个 或 批量
// body: { url } 或 { urls: string[] }
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 批量模式
    if (Array.isArray(body.urls)) {
      const urls: string[] = body.urls
        .map((u: string) => u.trim())
        .filter((u: string) => u.includes("1688.com"))
        .slice(0, 20); // 最多20个

      if (urls.length === 0) {
        return NextResponse.json({ success: false, error: "没有有效的1688链接" }, { status: 400 });
      }

      // 并发抓取（最多5个同时，避免被封）
      const results = [];
      for (let i = 0; i < urls.length; i += 5) {
        const batch = urls.slice(i, i + 5);
        const batchResults = await Promise.all(batch.map(u => fetch1688Product(u)));
        results.push(...batchResults);
        // 批次间停顿500ms
        if (i + 5 < urls.length) await new Promise(r => setTimeout(r, 500));
      }

      return NextResponse.json({ success: true, results, total: urls.length });
    }

    // 单个模式（兼容旧逻辑）
    const url = body.url;
    if (!url || !url.includes("1688.com")) {
      return NextResponse.json({ success: false, error: "请输入有效的1688商品链接" }, { status: 400 });
    }
    const result = await fetch1688Product(url);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 });
  }
}
