import { NextRequest, NextResponse } from "next/server";

const OZON_API = "https://api-seller.ozon.ru";

// 查询Ozon类目树（用于找正确的category_id）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const apiKey = searchParams.get("apiKey");
  const categoryId = searchParams.get("categoryId") || "0";

  if (!clientId || !apiKey) {
    return NextResponse.json({ error: "需要 Ozon API Key" }, { status: 400 });
  }

  // 获取类目列表
  const resp = await fetch(`${OZON_API}/v1/description-category/tree`, {
    method: "POST",
    headers: {
      "Client-Id": clientId,
      "Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category_id: parseInt(categoryId), language: "RU" }),
  });

  const data = await resp.json();
  return NextResponse.json(data);
}

// 获取类目必填属性
export async function POST(req: NextRequest) {
  const { clientId, apiKey, categoryId, typeId } = await req.json();

  if (!clientId || !apiKey || !categoryId) {
    return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  }

  const resp = await fetch(`${OZON_API}/v1/description-category/attribute`, {
    method: "POST",
    headers: {
      "Client-Id": clientId,
      "Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description_category_id: categoryId,
      type_id: typeId || 0,
      language: "RU",
    }),
  });

  const data = await resp.json();
  
  // 只返回必填属性，减少噪音
  const required = (data.result || []).filter((a: { is_required: boolean }) => a.is_required);
  return NextResponse.json({ required, all: data.result });
}
