import { NextRequest, NextResponse } from "next/server";

// 支持的目标语言
export const SUPPORTED_LANGUAGES = [
  { code: "ru", label: "俄语", flag: "🇷🇺", platform: "Ozon / Wildberries" },
  { code: "en", label: "英语", flag: "🇺🇸", platform: "Amazon / eBay / Shopee" },
  { code: "th", label: "泰语", flag: "🇹🇭", platform: "Shopee TH / Lazada TH" },
  { code: "vi", label: "越南语", flag: "🇻🇳", platform: "Shopee VN / Lazada VN" },
  { code: "id", label: "印尼语", flag: "🇮🇩", platform: "Shopee ID / Tokopedia" },
  { code: "ms", label: "马来语", flag: "🇲🇾", platform: "Shopee MY / Lazada MY" },
  { code: "es", label: "西班牙语", flag: "🇪🇸", platform: "Amazon ES /速卖通" },
  { code: "ar", label: "阿拉伯语", flag: "🇸🇦", platform: "速卖通中东 / Noon" },
];

export async function POST(req: NextRequest) {
  const { text, to = "ru", from = "zh" } = await req.json();
  if (!text) return NextResponse.json({ error: "No text" }, { status: 400 });

  try {
    const apiKey = process.env.VOLCENGINE_API_KEY;

    if (apiKey) {
      // 豆包翻译（字节跳动火山引擎）
      const langMap: Record<string, string> = {
        ru: "ru", en: "en", th: "th", vi: "vi",
        id: "id", ms: "ms", es: "es", ar: "ar", zh: "zh",
      };
      const res = await fetch("https://translate.volcengineapi.com/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          SourceLanguage: langMap[from] || "zh",
          TargetLanguage: langMap[to] || "ru",
          TextList: [text],
        }),
      });
      const data = await res.json();
      const result = data?.TranslationList?.[0]?.Translation || "";
      return NextResponse.json({ result });
    } else {
      // MyMemory 免费翻译（无需API Key，每天5000字）
      // MyMemory语言代码映射
      const myMemoryLang: Record<string, string> = {
        ru: "ru-RU", en: "en-US", th: "th-TH", vi: "vi-VN",
        id: "id-ID", ms: "ms-MY", es: "es-ES", ar: "ar-SA", zh: "zh-CN",
      };
      const fromCode = myMemoryLang[from] || "zh-CN";
      const toCode = myMemoryLang[to] || "ru-RU";
      const encoded = encodeURIComponent(text);
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encoded}&langpair=${fromCode}|${toCode}`
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
