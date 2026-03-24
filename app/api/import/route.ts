import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = Redis.fromEnv();
const KEY = "ozon:products";

export async function POST(req: NextRequest) {
  const product = await req.json();
  if (!product || !product.title) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }
  product.id = product.id || crypto.randomUUID();

  // 插入到列表头部
  await redis.lpush(KEY, JSON.stringify(product));
  // 只保留最近500个
  await redis.ltrim(KEY, 0, 499);

  return NextResponse.json({ ok: true, id: product.id });
}

export async function GET() {
  const items = await redis.lrange(KEY, 0, -1);
  const products = items.map((item) =>
    typeof item === "string" ? JSON.parse(item) : item
  );
  return NextResponse.json({ products });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const items = await redis.lrange(KEY, 0, -1);
  for (const item of items) {
    const p = typeof item === "string" ? JSON.parse(item) : item;
    if (p.id === id) {
      await redis.lrem(KEY, 1, item);
      break;
    }
  }
  return NextResponse.json({ ok: true });
}
