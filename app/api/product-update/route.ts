import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = Redis.fromEnv();
const KEY = "ozon:products";

export async function POST(req: NextRequest) {
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "No id" }, { status: 400 });

  const items = await redis.lrange(KEY, 0, -1);
  for (let i = 0; i < items.length; i++) {
    const p = typeof items[i] === "string" ? JSON.parse(items[i] as string) : items[i];
    if (p.id === id) {
      const updated = { ...p, ...updates };
      // lset 替换指定位置
      await redis.lset(KEY, i, JSON.stringify(updated));
      return NextResponse.json({ ok: true });
    }
  }
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
