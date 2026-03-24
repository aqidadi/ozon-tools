import { NextRequest, NextResponse } from "next/server";

// 简单的内存存储（生产环境可换成数据库）
// 前端通过 /api/import/pending 轮询拿数据
const pending: unknown[] = [];

export async function POST(req: NextRequest) {
  const product = await req.json();
  if (!product || !product.title) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }
  product.id = product.id || crypto.randomUUID();
  pending.push(product);
  return NextResponse.json({ ok: true, id: product.id });
}

export async function GET() {
  const items = [...pending];
  pending.length = 0; // 清空队列
  return NextResponse.json({ items });
}
