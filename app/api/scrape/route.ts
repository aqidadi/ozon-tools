import { NextRequest, NextResponse } from "next/server";

// 从1688商品页抓取数据
async function fetch1688Product(url: string) {
  try {
    // 清理URL，提取offerId
    const offerMatch = url.match(/offer\/(\d+)/) || url.match(/offerId=(\d+)/);
    const offerId = offerMatch?.[1];

    // 用手机版页面，结构更简单
    const fetchUrl = offerId
      ? `https://m.1688.com/offer/${offerId}.html`
      : url.replace("detail.1688.com", "m.1688.com").replace("www.1688.com", "m.1688.com");

    const res = await fetch(fetchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Referer": "https://m.1688.com/",
      },
      // 10秒超时
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // 提取标题
    let title = "";
    const titlePatterns = [
      /<title>([^<]+)<\/title>/,
      /"subject"\s*:\s*"([^"]+)"/,
      /"title"\s*:\s*"([^"]+)"/,
      /class="title"[^>]*>([^<]+)</,
      /<h1[^>]*>([^<]+)<\/h1>/,
    ];
    for (const pat of titlePatterns) {
      const m = html.match(pat);
      if (m?.[1]) {
        title = m[1].replace(/\\u([\dA-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        title = title.replace(/&[^;]+;/g, "").replace(/[-_|].*?(1688|阿里|淘宝).*$/i, "").trim();
        if (title.length > 5) break;
      }
    }

    // 提取价格
    let price = 0;
    const pricePatterns = [
      /"priceInfo".*?"price"\s*:\s*"([\d.]+)"/,
      /"price"\s*:\s*"([\d.]+)"/,
      /"minPrice"\s*:\s*"?([\d.]+)"?/,
      /￥\s*([\d.]+)/,
      /¥\s*([\d.]+)/,
    ];
    for (const pat of pricePatterns) {
      const m = html.match(pat);
      if (m?.[1]) {
        const p = parseFloat(m[1]);
        if (p > 0 && p < 100000) { price = p; break; }
      }
    }

    // 提取图片
    const images: string[] = [];
    const imgPatterns = [
      /https:\/\/cbu01\.alicdn\.com\/[^"'\s]+\.(jpg|jpeg|png|webp)/gi,
      /https:\/\/img\.alicdn\.com\/[^"'\s]+\.(jpg|jpeg|png|webp)/gi,
    ];
    for (const pat of imgPatterns) {
      const matches = html.matchAll(pat);
      for (const m of matches) {
        const src = m[0].split("?")[0].replace(/_\d+x\d+\.(jpg|jpeg|png|webp)/i, "_400x400.$1");
        if (!images.includes(src)) {
          images.push(src);
          if (images.length >= 5) break;
        }
      }
      if (images.length > 0) break;
    }

    // 提取店铺名
    let shopName = "";
    const shopPatterns = [
      /"sellerNick"\s*:\s*"([^"]+)"/,
      /"companyName"\s*:\s*"([^"]+)"/,
      /class="shop-name"[^>]*>([^<]+)</,
    ];
    for (const pat of shopPatterns) {
      const m = html.match(pat);
      if (m?.[1]) {
        shopName = m[1].replace(/\\u([\dA-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        break;
      }
    }

    if (!title) throw new Error("无法提取商品标题，请检查链接是否为1688商品页");

    return {
      success: true,
      title,
      price,
      images,
      shopName,
      sourceUrl: url,
      offerId,
    };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "抓取失败";
    return { success: false, error: message };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || !url.includes("1688.com")) {
      return NextResponse.json({ success: false, error: "请输入有效的1688商品链接" }, { status: 400 });
    }
    const result = await fetch1688Product(url);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 });
  }
}
