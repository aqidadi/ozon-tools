import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text) return NextResponse.json({ error: "No text" }, { status: 400 });

  try {
    // 使用豆包/火山引擎翻译 API（免费额度）
    // 如果没有配置API KEY，回退到 MyMemory 免费翻译
    const apiKey = process.env.VOLCENGINE_API_KEY;

    if (apiKey) {
      // 豆包翻译（字节跳动火山引擎）
      const res = await fetch("https://translate.volcengineapi.com/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          SourceLanguage: "zh",
          TargetLanguage: "ru",
          TextList: [text],
        }),
      });
      const data = await res.json();
      const result = data?.TranslationList?.[0]?.Translation || "";
      return NextResponse.json({ result });
    } else {
      // 回退：MyMemory 免费翻译（无需API Key，每天5000字）
      const encoded = encodeURIComponent(text);
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encoded}&langpair=zh|ru`
      );
      const data = await res.json();
      const result = data?.responseData?.translatedText || "";
      return NextResponse.json({ result });
    }
  } catch (e) {
    console.error("Translation error:", e);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
