import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Token",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// 批量图片上传：接收最多30张图片URL，全部缓存到Supabase，返回可用的公网URL数组
// POST body: { urls: string[], detailUrls?: string[] }
// Response: { images: string[], detailImages: string[] }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const urls: string[] = Array.isArray(body.urls) ? body.urls : [];
  const detailUrls: string[] = Array.isArray(body.detailUrls) ? body.detailUrls : [];

  const sb = createServiceClient();
  await sb.storage.createBucket("crossly", { public: true }).catch(() => {});

  async function cacheOne(rawUrl: string): Promise<string> {
    if (!rawUrl || typeof rawUrl !== "string") return "";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (rawUrl.includes(supabaseUrl) || rawUrl.includes("supabase.co")) return rawUrl;

    const urlHash = Buffer.from(rawUrl).toString("base64url").slice(0, 40);
    const ext = rawUrl.match(/\.(jpg|jpeg|png|webp|gif)/i)?.[1] || "jpg";
    const filePath = `product-images/${urlHash}.${ext}`;

    // 已缓存直接返回
    const { data: existing } = await sb.storage.from("crossly").list("product-images", { search: `${urlHash}.${ext}` });
    if (existing && existing.length > 0) {
      return sb.storage.from("crossly").getPublicUrl(filePath).data.publicUrl;
    }

    try {
      const fetchRes = await fetch(rawUrl, {
        headers: {
          "Referer": "https://detail.1688.com/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(12000),
      });
      if (!fetchRes.ok) return "";
      const buf = await fetchRes.arrayBuffer();
      const ct = fetchRes.headers.get("content-type") || "image/jpeg";
      const { error } = await sb.storage.from("crossly").upload(filePath, buf, { contentType: ct, upsert: true });
      if (error) return "";
      return sb.storage.from("crossly").getPublicUrl(filePath).data.publicUrl;
    } catch {
      return "";
    }
  }

  // 并发处理（主图最多15张，详情图最多15张）
  const [images, detailImages] = await Promise.all([
    Promise.all(urls.slice(0, 15).map(cacheOne)),
    Promise.all(detailUrls.slice(0, 15).map(cacheOne)),
  ]);

  return NextResponse.json({
    images: images.filter(Boolean),
    detailImages: detailImages.filter(Boolean),
  }, { headers: CORS });
}
