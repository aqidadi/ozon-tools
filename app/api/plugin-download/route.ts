import { NextResponse } from "next/server";
import JSZip from "jszip";
import { readFileSync } from "fs";
import { join } from "path";

// 插件文件列表（相对于项目根目录）
const PLUGIN_FILES = [
  "chrome-extension/manifest.json",
  "chrome-extension/popup.html",
  "chrome-extension/popup.js",
  "chrome-extension/content.js",
  "chrome-extension/icons/icon16.png",
  "chrome-extension/icons/icon48.png",
  "chrome-extension/icons/icon128.png",
];

export async function GET() {
  try {
    const zip = new JSZip();
    const folder = zip.folder("crossly-plugin")!;

    const root = process.cwd();

    for (const filePath of PLUGIN_FILES) {
      const fullPath = join(root, filePath);
      const content = readFileSync(fullPath);
      // 去掉 chrome-extension/ 前缀，保留子目录结构
      const zipPath = filePath.replace("chrome-extension/", "");
      folder.file(zipPath, content);
    }

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    // 读取版本号
    const manifest = JSON.parse(
      readFileSync(join(root, "chrome-extension/manifest.json"), "utf-8")
    );
    const version = manifest.version || "1.0.0";

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="crossly-plugin-v${version}.zip"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Plugin download error:", error);
    return NextResponse.json({ error: "打包失败" }, { status: 500 });
  }
}
