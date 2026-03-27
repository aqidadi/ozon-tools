import { NextRequest, NextResponse } from "next/server";

// 后端爬虫：无需Chrome插件，用户贴1688/义乌购链接，服务器直接抓
export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "缺少 url 参数" }, { status: 400 });
  }

  // 标准化URL
  let targetUrl = url.trim();
  if (!targetUrl.startsWith("http")) {
    return NextResponse.json({ error: "URL 格式不对，请贴完整链接" }, { status: 400 });
  }

  // 义乌购链接转换（yiwugo.com → 可直访）
  // 1688链接转换（detail.1688.com → 需要特殊处理）
  const is1688 = targetUrl.includes("1688.com");
  const isYiwugo = targetUrl.includes("yiwugo.com");

  if (!is1688 && !isYiwugo) {
    return NextResponse.json({ error: "目前只支持1688和义乌购的链接" }, { status: 400 });
  }

  try {
    // 服务端 fetch，带 UA 伪装成普通浏览器
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9",
      "Referer": is1688 ? "https://www.1688.com/" : "https://www.yiwugo.com/",
    };

    const res = await fetch(targetUrl, { headers, redirect: "follow" });
    if (!res.ok) {
      return NextResponse.json({ error: `抓取失败，状态码 ${res.status}，可能需要登录才能查看` }, { status: 502 });
    }

    const html = await res.text();

    // 从HTML提取商品信息
    const product = extractProduct(html, targetUrl, is1688);

    return NextResponse.json({ ok: true, product });
  } catch (e) {
    return NextResponse.json({ error: `网络错误：${e instanceof Error ? e.message : "未知错误"}` }, { status: 500 });
  }
}

function extractProduct(html: string, url: string, is1688: boolean) {
  // 提取标题
  let title = "";
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1]
      .replace(/[-_|].*$/, "") // 去掉后缀
      .replace(/1688|阿里巴巴|义乌购|yiwugo/gi, "")
      .trim();
  }

  // 从 og:title 提取更准确的标题
  const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i);
  if (ogTitle) title = ogTitle[1].replace(/[-|].*$/, "").trim();

  // 从 JSON-LD 或 window.__INIT_DATA__ 提取价格
  let price = 0;
  const pricePatterns = [
    /"price"\s*:\s*"?(\d+\.?\d*)"/,
    /priceRange[^"]*"(\d+\.?\d*)"/,
    /"minPrice"\s*:\s*(\d+\.?\d*)/,
    /data-price="(\d+\.?\d*)"/,
    /class="[^"]*price[^"]*"[^>]*>\s*[¥￥]?\s*(\d+\.?\d*)/i,
  ];
  for (const p of pricePatterns) {
    const m = html.match(p);
    if (m && parseFloat(m[1]) > 0) {
      price = parseFloat(m[1]);
      break;
    }
  }

  // 提取图片
  const imgs: string[] = [];
  // 1688 图片通常在 cbu01.alicdn.com
  const imgRegex = /https:\/\/cbu01\.alicdn\.com\/img\/ibank\/[^"'\s,]+/g;
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    const imgUrl = m[0].replace(/\\u002F/g, "/").split("?")[0];
    if (!imgs.includes(imgUrl) && imgs.length < 8) imgs.push(imgUrl);
  }

  // 义乌购图片
  if (isYiwugoUrl(url)) {
    const ywImgRegex = /https:\/\/[^"'\s,]+\.yiwugo\.com\/[^"'\s,]+\.(jpg|jpeg|png|webp)/gi;
    while ((m = ywImgRegex.exec(html)) !== null) {
      if (!imgs.includes(m[0]) && imgs.length < 8) imgs.push(m[0]);
    }
  }

  // 提取商品ID
  let offerId = "";
  if (is1688) {
    const idMatch = url.match(/offer\/(\d+)\.html/) || url.match(/offerid=(\d+)/i);
    if (idMatch) offerId = idMatch[1];
  }

  // 提取店铺名
  let shopName = "";
  const shopMatch = html.match(/["']shopName["']\s*:\s*["']([^"']+)["']/) ||
                    html.match(/class="[^"]*shop-name[^"]*"[^>]*>([^<]+)</) ;
  if (shopMatch) shopName = shopMatch[1];

  return {
    id: offerId || `crawl_${Date.now()}`,
    title: title || "未能识别商品名称",
    price: price || 0,
    images: imgs,
    url,
    shopName,
    source: is1688 ? "1688" : "义乌购",
  };
}

function isYiwugoUrl(url: string) {
  return url.includes("yiwugo.com");
}
