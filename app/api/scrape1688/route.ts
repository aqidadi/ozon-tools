import { NextRequest, NextResponse } from "next/server";

// 1688商品后端直接解析
// 注意：1688对服务器IP有封锁，需要用户的Cookie才能正常访问
// 最佳实践：用户在浏览器侧请求，或配置代理

export async function POST(req: NextRequest) {
  const { url, cookie } = await req.json().catch(() => ({}));
  
  if (!url || !url.includes("1688.com")) {
    return NextResponse.json({ error: "请提供有效的1688商品链接" }, { status: 400 });
  }

  // 从URL提取offerId
  const offerIdMatch = url.match(/offer\/(\d+)/) || 
                        url.match(/offerId=(\d+)/) || 
                        url.match(/offer_id=(\d+)/);
  const offerId = offerIdMatch?.[1];
  
  if (!offerId) {
    return NextResponse.json({ error: "无法从URL提取商品ID" }, { status: 400 });
  }

  try {
    // 方法1: 1688开放平台API（需要AppKey，但商品详情无需授权）
    const apiUrl = `https://www.1688.com/page/offerdetail/${offerId}.html`;
    
    // 方法2: 直接抓取商品JSON数据接口
    const jsonApiUrl = `https://offerdetail.1688.com/offerdetail/getDetailCommonInfo.do?offerId=${offerId}`;
    
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://www.1688.com/",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "zh-CN,zh;q=0.9",
    };
    
    // 如果用户提供了Cookie，加上（提高成功率）
    if (cookie) headers["Cookie"] = cookie;

    const resp = await fetch(jsonApiUrl, { 
      headers,
      signal: AbortSignal.timeout(10000),
    });
    
    if (resp.ok) {
      const data = await resp.json();
      
      // 解析1688接口返回的商品数据
      const offer = data?.offerDetail || data?.data || data;
      
      if (offer) {
        return NextResponse.json({
          success: true,
          offerId,
          title: offer.subject || offer.title || "",
          price: offer.priceInfo?.price || offer.price || 0,
          minOrder: offer.tradeUnit?.minOrder || 1,
          images: offer.imageList || [],
          specs: offer.skuModel || {},
        });
      }
    }

    // 方法3: 抓取页面提取window.__amd_data__
    const pageResp = await fetch(apiUrl, { 
      headers,
      signal: AbortSignal.timeout(15000),
    });
    
    if (!pageResp.ok) {
      return NextResponse.json({ 
        error: "1688服务器拒绝访问（IP被封）",
        suggestion: "请使用Chrome插件模式（带用户Cookie），或配置代理IP",
        offerId,
      }, { status: 403 });
    }

    const html = await pageResp.text();
    
    // 从页面HTML提取JSON数据（不用s flag，兼容es2017）
    const amdIdx = html.indexOf('window.__amd_data__');
    const initIdx = html.indexOf('window.__INIT_DATA__');
    const idx = amdIdx >= 0 ? amdIdx : initIdx;
    let dataMatch: string | null = null;
    if (idx >= 0) {
      const start = html.indexOf('{', idx);
      const end = html.indexOf('</script>', idx);
      if (start > 0 && end > start) dataMatch = html.slice(start, end).replace(/;\s*$/, '');
    }
    
    if (dataMatch) {
      try {
        const pageData = JSON.parse(dataMatch);
        const offerData = pageData?.offerDetail || pageData;
        return NextResponse.json({
          success: true,
          offerId,
          title: offerData?.subject || "",
          price: offerData?.priceInfo?.price || 0,
          images: offerData?.imageList || [],
          source: "page_parse",
        });
      } catch {
        // JSON解析失败，继续
      }
    }

    // 提取图片URL（fallback）
    const imgMatches = html.match(/https:\/\/cbu01\.alicdn\.com\/img\/ibank\/[^\s"']+\.jpg/g) || [];
    const uniqueImgs = [...new Set(imgMatches)].slice(0, 20);
    
    return NextResponse.json({
      success: true,
      offerId,
      images: uniqueImgs,
      source: "html_regex",
      warning: "部分数据可能不完整，建议使用插件模式",
    });

  } catch (e) {
    return NextResponse.json({ 
      error: "请求失败",
      detail: String(e),
      suggestion: "1688对海外IP有封锁，推荐使用插件模式（用户浏览器直接请求）",
    }, { status: 500 });
  }
}
