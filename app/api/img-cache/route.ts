import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// 下载并缓存图片到 Supabase Storage，返回公网 URL
// 用于解决 1688 防盗链问题：Ozon 服务器无法直接拉取 1688 图片
// POST body: { urls: string[] }
export async function POST(req: NextRequest) {
  const { urls } = await req.json().catch(() => ({ urls: [] }));
  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: "需要 urls 数组" }, { status: 400 });
  }

  const sb = createServiceClient();
  const results: string[] = [];

  // 确保 bucket 存在（幂等）
  await sb.storage.createBucket("crossly", { public: true }).catch(() => {});

  for (const rawUrl of urls.slice(0, 20)) {
    if (!rawUrl || typeof rawUrl !== "string") { results.push(""); continue; }

    // 如果已经是我们自己的域名或 Supabase URL，直接用
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (rawUrl.includes(supabaseUrl) || rawUrl.includes("supabase")) {
      results.push(rawUrl);
      continue;
    }

    // 生成稳定的文件名（基于 URL hash）
    const urlHash = Buffer.from(rawUrl).toString("base64url").slice(0, 40);
    const ext = rawUrl.match(/\.(jpg|jpeg|png|webp|gif)/i)?.[1] || "jpg";
    const filePath = `product-images/${urlHash}.${ext}`;

    // 检查是否已缓存
    const { data: existing } = await sb.storage.from("crossly").list("product-images", {
      search: `${urlHash}.${ext}`,
    });
    if (existing && existing.length > 0) {
      const { data: publicUrl } = sb.storage.from("crossly").getPublicUrl(filePath);
      results.push(publicUrl.publicUrl);
      continue;
    }

    // 下载原图（带 1688 Referer 绕过防盗链）
    try {
      const fetchRes = await fetch(rawUrl, {
        headers: {
          "Referer": "https://detail.1688.com/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!fetchRes.ok) { results.push(""); continue; }

      const buf = await fetchRes.arrayBuffer();
      const ct = fetchRes.headers.get("content-type") || "image/jpeg";

      // 上传到 Supabase Storage
      const { error } = await sb.storage.from("crossly").upload(filePath, buf, {
        contentType: ct,
        upsert: true,
      });

      if (error) { results.push(""); continue; }

      const { data: publicUrl } = sb.storage.from("crossly").getPublicUrl(filePath);
      results.push(publicUrl.publicUrl);
    } catch {
      results.push("");
    }
  }

  return NextResponse.json({ urls: results }, { headers: CORS });
}
