import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const format = (formData.get("format") as string) || "avif";
    const quality = parseInt((formData.get("quality") as string) || "80");

    if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });

    const allowed = ["avif", "jpeg", "png", "webp", "tiff"];
    if (!allowed.includes(format))
      return NextResponse.json({ error: "unsupported format" }, { status: 400 });

    const buf = Buffer.from(await file.arrayBuffer());

    let pipeline = sharp(buf);

    if (format === "avif") {
      pipeline = pipeline.avif({ quality: Math.min(quality, 100) });
    } else if (format === "jpeg") {
      pipeline = pipeline.jpeg({ quality });
    } else if (format === "png") {
      pipeline = pipeline.png({ compressionLevel: 9 });
    } else if (format === "webp") {
      pipeline = pipeline.webp({ quality });
    } else if (format === "tiff") {
      pipeline = pipeline.tiff({ quality });
    }

    const output = await pipeline.toBuffer();
    const mimeMap: Record<string, string> = {
      avif: "image/avif",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      tiff: "image/tiff",
    };

    return new NextResponse(new Uint8Array(output), {
      headers: {
        "Content-Type": mimeMap[format],
        "Content-Length": output.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "convert failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
