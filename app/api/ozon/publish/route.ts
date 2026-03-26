import { NextRequest, NextResponse } from "next/server";

const OZON_API = "https://api-seller.ozon.ru";

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
      price: String(product.sellPrice || 999),      // 售价（卢布）
      old_price: String(product.oldPrice || 0),     // 原价（可选）
      vat: "0",                                      // 税率（0=无税）
      
      // 类目（需要用Ozon类目ID）
      category_id: product.categoryId || 17028973,  // 默认：玩具类
      
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
        {
          id: 9048,       // 品牌
          complex_id: 0,
          values: [{ value: product.brand || "Без бренда" }]
        },
        {
          id: 85,         // 名称
          complex_id: 0,
          values: [{ value: product.title }]
        },
      ],
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
