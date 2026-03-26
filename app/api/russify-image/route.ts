import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// 生成 SVG 文字图层
function makeSvgText(text: string, width: number, fontSize = 28): string {
  const lines = wrapText(text, Math.floor(width / (fontSize * 0.55)));
  const lineHeight = fontSize * 1.4;
  const height = lines.length * lineHeight + 20;
  const svgLines = lines.map((line, i) =>
    `<text x="${width / 2}" y="${20 + i * lineHeight + fontSize}" 
      font-family="Arial, sans-serif" font-size="${fontSize}" 
      fill="white" text-anchor="middle" 
      style="text-shadow: 1px 1px 3px rgba(0,0,0,0.8)">${escXml(line)}</text>`
  ).join("\n");

  return `<svg width="${width}" height="${Math.ceil(height)}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${Math.ceil(height)}" fill="rgba(0,0,0,0.65)" rx="0"/>
    ${svgLines}
  </svg>`;
}

function wrapText(text: string, maxChars: number): string[] {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines.slice(0, 4); // 最多4行
}

function escXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// POST /api/russify-image
// body: { imageUrl: string, titleRu: string, priceRub?: number }
// 返回: base64 PNG
export async function POST(req: NextRequest) {
  const { imageUrl, titleRu, priceRub } = await req.json().catch(() => ({}));

  if (!imageUrl || !titleRu) {
    return NextResponse.json({ error: "需要 imageUrl 和 titleRu" }, { status: 400, headers: CORS });
  }

  try {
    // 下载原图
    const imgRes = await fetch(imageUrl, {
      headers: {
        "Referer": "https://detail.1688.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!imgRes.ok) {
      return NextResponse.json({ error: `图片下载失败: ${imgRes.status}` }, { status: 400, headers: CORS });
    }

    const imgBuf = Buffer.from(await imgRes.arrayBuffer());

    // 获取图片尺寸
    const meta = await sharp(imgBuf).metadata();
    const width = meta.width || 800;
    const height = meta.height || 800;

    // 生成底部俄文标题条
    const textLabel = priceRub ? `${titleRu}  ₽${priceRub}` : titleRu;
    const fontSize = Math.max(20, Math.min(32, Math.floor(width / 20)));
    const svgText = makeSvgText(textLabel, width, fontSize);
    const svgBuf = Buffer.from(svgText);
    const textLayer = await sharp(svgBuf).png().toBuffer();
    const textMeta = await sharp(textLayer).metadata();
    const textH = textMeta.height || 60;

    // 合成：原图 + 底部文字条
    const result = await sharp(imgBuf)
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .composite([{
        input: textLayer,
        gravity: "south",  // 底部对齐
        top: Math.max(0, height - textH),
        left: 0,
      }])
      .jpeg({ quality: 85 })
      .toBuffer();

    // 同时上传到 Supabase Storage
    let publicUrl = "";
    try {
      const { createServiceClient } = await import("@/lib/supabase");
      const sb = createServiceClient();
      await sb.storage.createBucket("crossly", { public: true }).catch(() => {});
      const fileName = `russified/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      const { error } = await sb.storage.from("crossly").upload(fileName, result, {
        contentType: "image/jpeg",
        upsert: true,
      });
      if (!error) {
        const { data } = sb.storage.from("crossly").getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      }
    } catch {}

    return NextResponse.json({
      ok: true,
      base64: `data:image/jpeg;base64,${result.toString("base64")}`,
      url: publicUrl || null,
    }, { headers: CORS });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500, headers: CORS });
  }
}
