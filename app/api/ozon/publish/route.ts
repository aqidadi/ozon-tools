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

  // 构建Ozon商品数据结构
  const ozonProduct = {
    items: [{
      // 基础信息
      name: product.title,                          // 商品名称（俄文）
      offer_id: product.offerId || `crossly_${Date.now()}`, // 卖家自定义SKU
      
      // 价格库存
      price: String(product.price || product.sellPrice || 999),      // 售价（卢布）
      old_price: String(product.oldPrice || 0),     // 原价（可选）
      vat: "0",                                      // 税率0%（中国卖家）
      
      // 类目 + 类型（v3 API 必填，两个字段缺一不可）
      // description_category_id: 新版类目ID（叶子节点）
      // type_id: 商品类型ID（配合类目使用，0 会报错）
      // 17028973 = 玩具/毛绒玩具类目，93726 = 毛绒玩具类型
      description_category_id: product.categoryId || 17028973,
      type_id: product.typeId || 93726,
      
      // 图片（Ozon要求公网可访问的HTTPS URL）
      images: (product.images || []).slice(0, 15),  // 最多15张主图
      images360: [],
      
      // 重量尺寸
      weight: product.weight || 500,                // 克
      weight_unit: "g",
      width: 20, height: 20, depth: 20,             // 厘米（需用户填写）
      dimension_unit: "cm",
      
      // 描述（富文本）
      description: product.description || product.title,
      
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
        ...(product.description ? [{ id: 4191, complex_id: 0, values: [{ value: product.description.slice(0, 4000) }] }] : []),
        ...(product.toyType ? [{ id: 7173, complex_id: 0, values: [{ value: product.toyType }] }] : []),
      ],
      // 详情图（最多15张，单独字段）
      ...(product.detailImages?.length ? { 
        images360: product.detailImages.slice(0, 15)
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
