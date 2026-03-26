import { NextRequest, NextResponse } from "next/server";

const OZON_API = "https://api-seller.ozon.ru";

// 颜色映射：中文→Ozon颜色ID
const COLOR_MAP: Record<string, {id: number, value: string}> = {
  "白": {id: 61571, value: "белый"}, "白色": {id: 61571, value: "белый"},
  "黑": {id: 61574, value: "черный"}, "黑色": {id: 61574, value: "черный"},
  "棕": {id: 61575, value: "коричневый"}, "棕色": {id: 61575, value: "коричневый"}, "褐色": {id: 61575, value: "коричневый"},
  "灰": {id: 61576, value: "серый"}, "灰色": {id: 61576, value: "серый"},
  "黄": {id: 61578, value: "желтый"}, "黄色": {id: 61578, value: "желтый"},
  "红": {id: 61579, value: "красный"}, "红色": {id: 61579, value: "красный"},
  "粉": {id: 61580, value: "розовый"}, "粉色": {id: 61580, value: "розовый"}, "粉红": {id: 61580, value: "розовый"},
  "蓝": {id: 61581, value: "синий"}, "蓝色": {id: 61581, value: "синий"},
  "绿": {id: 61583, value: "зеленый"}, "绿色": {id: 61583, value: "зеленый"},
  "橙": {id: 61585, value: "оранжевый"}, "橙色": {id: 61585, value: "оранжевый"},
  "紫": {id: 61586, value: "фиолетовый"}, "紫色": {id: 61586, value: "фиолетовый"},
  "米": {id: 61573, value: "бежевый"}, "米色": {id: 61573, value: "бежевый"}, "奶油色": {id: 61573, value: "бежевый"},
  "彩色": {id: 61591, value: "мультиколор"}, "多色": {id: 61591, value: "мультиколор"},
};

function getColor(colorZh: string) {
  if (!colorZh) return null;
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (colorZh.includes(key)) return val;
  }
  return null;
}



// Ozon API 一键刊登接口
// 文档: https://docs.ozon.ru/api/seller/#operation/ProductAPI_ImportProductsV3
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { product, clientId: bodyClientId, apiKey: bodyApiKey } = body;

  // 优先用环境变量，其次用用户传入的
  const clientId = process.env.OZON_CLIENT_ID || bodyClientId;
  const apiKey = process.env.OZON_API_KEY || bodyApiKey;

  if (!clientId || !apiKey) {
    return NextResponse.json({ 
      error: "需要 Ozon Client-Id 和 Api-Key",
      hint: "联系Crossly管理员配置API密钥"
    }, { status: 400 });
  }

  if (!product?.title) {
    return NextResponse.json({ error: "缺少商品信息" }, { status: 400 });
  }

  // ── 自动翻译：如果标题是中文，调 DeepSeek 翻译成俄文 ──
  function isChinese(text: string) {
    return /[\u4e00-\u9fff]/.test(text);
  }

  async function translateToRu(text: string): Promise<string> {
    if (!text || !isChinese(text)) return text;
    try {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY || "sk-e8f1e6eb4be646b99c31686d5bd7bfe1"}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "你是专业的电商翻译，将中文商品信息翻译成俄语。只输出翻译结果，不加任何解释。" },
            { role: "user", content: `翻译成俄语：${text}` },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || text;
    } catch {
      return text;
    }
  }

  // 翻译标题（如果没有俄文标题）
  let titleRu = product.title;
  if (isChinese(product.title)) {
    titleRu = await translateToRu(product.title);
  }

  // 生成俄文描述（用 AI 基于标题生成简短描述）
  let descriptionRu = product.description || titleRu;
  if (isChinese(descriptionRu)) {
    descriptionRu = await translateToRu(descriptionRu);
  }
  // 如果描述和标题相同，用 AI 生成更丰富的描述
  if (descriptionRu === titleRu && process.env.DEEPSEEK_API_KEY) {
    try {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY || "sk-e8f1e6eb4be646b99c31686d5bd7bfe1"}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "你是Ozon平台的电商运营专家，专门为俄语市场撰写商品描述。" },
            { role: "user", content: `根据以下商品标题，用俄语写一段50-100字的商品描述，突出材质柔软、适合送礼、质量好等卖点：\n${titleRu}` },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });
      const data = await res.json();
      const generated = data.choices?.[0]?.message?.content?.trim();
      if (generated) descriptionRu = generated;
    } catch { /* 失败用标题作描述 */ }
  }

  // ── 服务端图片缓存：直接下载+上传到 Supabase，不走 HTTP 自调用 ──
  async function cacheImages(urls: string[]): Promise<string[]> {
    if (!urls || urls.length === 0) return [];
    const { createServiceClient } = await import("@/lib/supabase");
    const sb = createServiceClient();
    // 确保 bucket 存在
    await sb.storage.createBucket("crossly", { public: true }).catch(() => {});

    const results: string[] = [];
    for (const rawUrl of urls.slice(0, 15)) {
      if (!rawUrl?.startsWith("https://")) { results.push(""); continue; }

      const urlHash = Buffer.from(rawUrl).toString("base64url").slice(0, 40);
      const ext = rawUrl.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || "jpg";
      const filePath = `product-images/${urlHash}.${ext}`;

      // 检查是否已缓存
      const { data: pub } = sb.storage.from("crossly").getPublicUrl(filePath);
      // 先尝试 head 请求验证文件是否存在
      try {
        const headRes = await fetch(pub.publicUrl, { method: "HEAD" });
        if (headRes.ok) { results.push(pub.publicUrl); continue; }
      } catch {}

      // 下载原图（带 1688 Referer 绕过防盗链）
      try {
        const fetchRes = await fetch(rawUrl, {
          headers: {
            "Referer": "https://detail.1688.com/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(12000),
        });
        if (!fetchRes.ok) { results.push(""); continue; }
        const buf = await fetchRes.arrayBuffer();
        const ct = fetchRes.headers.get("content-type") || "image/jpeg";
        const { error } = await sb.storage.from("crossly").upload(filePath, buf, { contentType: ct, upsert: true });
        if (error) { results.push(""); continue; }
        results.push(pub.publicUrl);
      } catch { results.push(""); }
    }
    return results.filter(Boolean);
  }

  const rawImages = (product.images || []).filter((u: string) => u?.startsWith("https://"));
  const rawDetailImages = (product.detailImages || []).filter((u: string) => u?.startsWith("https://"));
  const cachedImages = await cacheImages(rawImages.slice(0, 10));
  const cachedDetailImages = await cacheImages(rawDetailImages.slice(0, 15));

  // 构建Ozon商品数据结构
  const ozonProduct = {
    items: [{
      // 基础信息
      name: titleRu.slice(0, 500),                 // 商品名称（俄文，最多500字符）
      offer_id: product.offerId || `crossly_${Date.now()}`, // 卖家自定义SKU
      
      // 价格库存
      price: String(product.price || product.sellPrice || 999),      // 售价（卢布）
      old_price: String(product.oldPrice || 0),     // 原价（可选）
      vat: "0",                                      // 税率0%（中国卖家）
      
      // 类目 + 类型（v3 API 必填，两个字段缺一不可）
      description_category_id: product.categoryId || 17028973,
      type_id: product.typeId || 92851,
      
      // 图片（缓存到 Supabase 的公网 HTTPS URL）
      images: cachedImages,
      images360: [],
      
      // 重量尺寸
      weight: product.weight || 500,                // 克
      weight_unit: "g",
      width: 20, height: 20, depth: 20,             // 厘米（需用户填写）
      dimension_unit: "cm",
      
      // 描述（富文本）
      description: descriptionRu,
      
      // 属性（必填项，根据类目不同）
      attributes: [
        // ★ 必填
        { id: 9048, complex_id: 0, values: [{ value: (product.title || "").slice(0, 100) }] },
        { id: 85, complex_id: 0, values: [{ dictionary_value_id: product.brandId || 126745801, value: product.brand || "Нет бренда" }] },
        { id: 8229, complex_id: 0, values: [{ value: product.typeName || "Мягкая игрушка" }] },
        // 可选但重要
        ...(() => {
          const c = getColor(product.color || "");
          return c ? [{ id: 10096, complex_id: 0, values: [{ dictionary_value_id: c.id, value: c.value }] }] : [];
        })(),
        ...(product.colorName ? [{ id: 10097, complex_id: 0, values: [{ value: product.colorName }] }] : []),
        ...(product.material ? [{ id: 4975, complex_id: 0, values: [{ value: product.material }] }] : []),
        ...(product.height ? [{ id: 7147, complex_id: 0, values: [{ value: String(product.height) }] }] : []),
        ...(product.country ? [{ id: 4389, complex_id: 0, values: [{ value: product.country || "Китай" }] }] : [{ id: 4389, complex_id: 0, values: [{ value: "Китай" }] }]),
        ...(product.weight ? [{ id: 4497, complex_id: 0, values: [{ value: String(product.weight) }] }] : []),
        { id: 4191, complex_id: 0, values: [{ value: descriptionRu.slice(0, 4000) }] },
        ...(product.toyType ? [{ id: 7173, complex_id: 0, values: [{ value: product.toyType }] }] : []),
      ],
      // 详情图（最多15张，单独字段）
      ...(cachedDetailImages.length ? { 
        images360: cachedDetailImages.slice(0, 15)
      } : {}),
    }]
  };

  try {
    const resp = await fetch(`${OZON_API}/v3/product/import`, {
      method: "POST",
      headers: {
        "Client-Id": clientId,
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ozonProduct),
    });

    const data = await resp.json();
    
    if (!resp.ok) {
      return NextResponse.json({ 
        error: "Ozon API错误", 
        detail: data,
        status: resp.status 
      }, { status: resp.status });
    }

    // 返回刊登结果
    return NextResponse.json({
      success: true,
      taskId: data.result?.task_id,
      titleRu,         // 翻译后的俄文标题，前端可回写到商品
      descriptionRu,   // 生成的俄文描述
      message: "商品已提交Ozon审核，通常1-3小时后上架",
      raw: data,
    });

  } catch (e) {
    return NextResponse.json({ error: "网络错误", detail: String(e) }, { status: 500 });
  }
}

// GET: 查询刊登任务状态
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const apiKey = searchParams.get("apiKey");
  const taskId = searchParams.get("taskId");

  if (!clientId || !apiKey || !taskId) {
    return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  }

  const resp = await fetch(`${OZON_API}/v1/product/import/info`, {
    method: "POST",
    headers: { "Client-Id": clientId, "Api-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ task_id: parseInt(taskId) }),
  });

  const data = await resp.json();
  return NextResponse.json(data);
}
