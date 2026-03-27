import { NextRequest, NextResponse } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Token",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// 品类参数模板：预设90%的Ozon必填参数
const CATEGORY_TEMPLATES: Record<string, {
  description_category_id: number;
  type_id: number;
  vat: string;
  dimension_unit: string;
  weight_unit: string;
  attributes: { id: number; values: { dictionary_value_id?: number; value: string }[] }[];
}> = {
  // 毛绒玩具 / 玩具类
  toy: {
    description_category_id: 17028973,
    type_id: 92851,
    vat: "0",
    dimension_unit: "mm",
    weight_unit: "g",
    attributes: [
      { id: 8229, values: [{ dictionary_value_id: 126745801, value: "Нет бренда" }] }, // 品牌=无品牌
      { id: 9048, values: [{ value: "Китай" }] }, // 产地=中国
      { id: 10096, values: [{ dictionary_value_id: 61576, value: "серый" }] }, // 颜色=灰色(默认)
      { id: 4180, values: [{ value: "Полиэстер" }] }, // 材质=聚酯纤维
      { id: 7799, values: [{ value: "3+" }] }, // 返回年龄
    ],
  },
  // 家居 / 收纳
  home: {
    description_category_id: 17027873,
    type_id: 95792,
    vat: "0",
    dimension_unit: "mm",
    weight_unit: "g",
    attributes: [
      { id: 8229, values: [{ dictionary_value_id: 126745801, value: "Нет бренда" }] },
      { id: 9048, values: [{ value: "Китай" }] },
      { id: 10096, values: [{ dictionary_value_id: 61574, value: "чёрный" }] },
    ],
  },
  // 美妆 / 美甲
  beauty: {
    description_category_id: 34757,
    type_id: 95911,
    vat: "0",
    dimension_unit: "mm",
    weight_unit: "g",
    attributes: [
      { id: 8229, values: [{ dictionary_value_id: 126745801, value: "Нет бренда" }] },
      { id: 9048, values: [{ value: "Китай" }] },
    ],
  },
  // 手机配件
  phone: {
    description_category_id: 17033670,
    type_id: 95938,
    vat: "0",
    dimension_unit: "mm",
    weight_unit: "g",
    attributes: [
      { id: 8229, values: [{ dictionary_value_id: 126745801, value: "Нет бренда" }] },
      { id: 9048, values: [{ value: "Китай" }] },
      { id: 10096, values: [{ dictionary_value_id: 61574, value: "чёрный" }] },
    ],
  },
};

// 颜色映射
const COLOR_MAP: Record<string, { id: number; ru: string }> = {
  "白": { id: 61571, ru: "белый" }, "白色": { id: 61571, ru: "белый" },
  "黑": { id: 61574, ru: "чёрный" }, "黑色": { id: 61574, ru: "чёрный" },
  "棕": { id: 61575, ru: "коричневый" }, "棕色": { id: 61575, ru: "коричневый" },
  "灰": { id: 61576, ru: "серый" }, "灰色": { id: 61576, ru: "серый" },
  "黄": { id: 61578, ru: "жёлтый" }, "黄色": { id: 61578, ru: "жёлтый" },
  "红": { id: 61579, ru: "красный" }, "红色": { id: 61579, ru: "красный" },
  "粉": { id: 61580, ru: "розовый" }, "粉色": { id: 61580, ru: "розовый" }, "粉红": { id: 61580, ru: "розовый" },
  "蓝": { id: 61581, ru: "синий" }, "蓝色": { id: 61581, ru: "синий" },
  "绿": { id: 61583, ru: "зелёный" }, "绿色": { id: 61583, ru: "зелёный" },
  "橙": { id: 61585, ru: "оранжевый" }, "橙色": { id: 61585, ru: "оранжевый" },
  "紫": { id: 61586, ru: "фиолетовый" }, "紫色": { id: 61586, ru: "фиолетовый" },
  "米": { id: 61572, ru: "бежевый" }, "米色": { id: 61572, ru: "бежевый" }, "米白": { id: 61572, ru: "бежевый" },
};

function detectCategory(title: string, specs: Record<string, string>): string {
  const t = (title + JSON.stringify(specs)).toLowerCase();
  if (/玩具|公仔|毛绒|娃娃|抱枕|熊|猫|狗|兔|熊猫|plush|toy/.test(t)) return "toy";
  if (/手机壳|支架|数据线|充电|耳机|phone|mobile/.test(t)) return "phone";
  if (/美甲|指甲|美妆|化妆|护肤|nail|beauty/.test(t)) return "beauty";
  if (/收纳|家居|装饰|灯|摆件|home|decor/.test(t)) return "home";
  return "toy"; // 默认玩具
}

function resolveColor(colorStr: string) {
  if (!colorStr) return null;
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (colorStr.includes(key)) return val;
  }
  return null;
}

async function translateTitle(title: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return title;
  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是专业跨境电商翻译。将中文商品标题翻译成俄语，简洁有吸引力，不超过100个字符，直接输出翻译结果，不要解释。" },
          { role: "user", content: title },
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || title;
  } catch {
    return title;
  }
}

async function cacheImages(urls: string[], detailUrls: string[]): Promise<{ images: string[]; detailImages: string[] }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.crossly.cn";
    const res = await fetch(`${baseUrl}/api/img-cache`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls, detailUrls }),
    });
    const data = await res.json();
    return { images: data.images || [], detailImages: data.detailImages || [] };
  } catch {
    return { images: urls.filter(u => u.startsWith("https://")), detailImages: [] };
  }
}

async function publishToOzon(item: {
  title: string; titleRu?: string; price: number; oldPrice?: number;
  weight: number; images: string[]; detailImages: string[];
  color?: string; material?: string; offerId: string;
  category?: string; specs?: Record<string, string>;
}, clientId: string, apiKey: string) {
  const catKey = item.category || detectCategory(item.title, item.specs || {});
  const template = CATEGORY_TEMPLATES[catKey] || CATEGORY_TEMPLATES.toy;

  // 翻译标题
  const titleRu = item.titleRu || await translateTitle(item.title);

  // 缓存图片
  const { images, detailImages } = await cacheImages(item.images, item.detailImages);

  // 构建属性
  const attributes = JSON.parse(JSON.stringify(template.attributes)); // 深拷贝
  
  // 覆盖颜色
  const colorInfo = resolveColor(item.color || "");
  const colorAttrIdx = attributes.findIndex((a: { id: number }) => a.id === 10096);
  if (colorInfo && colorAttrIdx >= 0) {
    attributes[colorAttrIdx].values = [{ dictionary_value_id: colorInfo.id, value: colorInfo.ru }];
  }

  // 覆盖材质
  if (item.material) {
    const matIdx = attributes.findIndex((a: { id: number }) => a.id === 4180);
    if (matIdx >= 0) attributes[matIdx].values = [{ value: item.material }];
  }

  const ozonProduct = {
    description_category_id: template.description_category_id,
    type_id: template.type_id,
    name: titleRu.slice(0, 200),
    offer_id: item.offerId,
    price: String(Math.max(item.price, 1)),
    old_price: String(item.oldPrice || Math.ceil(item.price * 1.2)),
    vat: template.vat,
    weight: item.weight,
    weight_unit: template.weight_unit,
    dimension_unit: template.dimension_unit,
    depth: 200, width: 200, height: 200,
    images: images.slice(0, 15),
    images360: detailImages.slice(0, 15),
    attributes,
    currency_code: "RUB",
  };

  const resp = await fetch("https://api-seller.ozon.ru/v3/product/import", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Client-Id": clientId,
      "Api-Key": apiKey,
    },
    body: JSON.stringify({ items: [ozonProduct] }),
    signal: AbortSignal.timeout(30000),
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data.message || JSON.stringify(data).slice(0, 200));
  const taskId = data.result?.task_id;
  if (!taskId) throw new Error(JSON.stringify(data).slice(0, 200));
  return { taskId, titleRu };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { products, clientId, apiKey } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "products数组不能为空" }, { status: 400, headers: CORS });
    }
    if (!clientId || !apiKey) {
      return NextResponse.json({ error: "缺少Ozon Client-Id或Api-Key" }, { status: 400, headers: CORS });
    }

    const results = [];
    for (const product of products.slice(0, 20)) {
      try {
        const offerId = product.offerId || ("crossly_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6));
        const result = await publishToOzon({ ...product, offerId }, clientId, apiKey);
        results.push({ id: product.id, success: true, taskId: result.taskId, titleRu: result.titleRu, offerId });
      } catch (e) {
        results.push({ id: product.id, success: false, error: String(e) });
      }
      // 避免Ozon限速
      await new Promise(r => setTimeout(r, 800));
    }

    const successCount = results.filter(r => r.success).length;
    return NextResponse.json({ results, total: products.length, success: successCount, failed: products.length - successCount }, { headers: CORS });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500, headers: CORS });
  }
}
