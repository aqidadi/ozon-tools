import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API = "https://api.deepseek.com/chat/completions";

const TASKS: Record<string, (product: string, platform: string, lang: string) => string> = {
  title: (product, platform, lang) => {
    if (lang === "俄语" || lang === "ru" || platform.toLowerCase().includes("ozon") || platform.toLowerCase().includes("wildberries")) {
      return `你是Ozon平台俄语运营专家，精通俄罗斯电商搜索算法。请为以下商品生成5个高转化俄语标题。

商品信息：${product}
目标平台：${platform || "Ozon"}

【爆款标题公式】= 核心类目词 + 材质/规格 + 适用人群/场景 + 情绪卖点 + 数量/套装

【Ozon算法要求】：
1. 标题必须包含买家在Ozon上真实搜索的俄语关键词（如：мягкая игрушка、подарок девочке、плюшевый медведь等）
2. 关键词自然融入，禁止堆砌
3. 每个标题控制在100字符以内（Ozon展示上限）
4. 优先级：搜索词 > 卖点 > 品牌

输出格式（严格按此）：
1. [俄语标题]
   📌 核心词: [标题中的Ozon高权重词]
   💡 中文解读: [为什么这样写]

2. [俄语标题]
   📌 核心词: [...]
   💡 中文解读: [...]

（共5条，直接输出，不要额外说明）`;
    }
    return `你是一个专业的跨境电商运营专家。请为以下商品生成5个${platform}平台的商品标题，目标市场语言：${lang}。
商品：${product}
要求：
1. 每个标题独占一行，前面加序号
2. 包含核心关键词，突出卖点
3. 控制在80字符以内
4. 每个${lang}标题下方紧跟一行中文备注（格式：【中文备注：...】）
5. 直接输出，不要额外解释`;
  },

  keywords: (product, platform, lang) => {
    if (lang === "俄语" || lang === "ru" || platform.toLowerCase().includes("ozon") || platform.toLowerCase().includes("wildberries")) {
      return `你是Ozon/Wildberries俄语关键词专家。为以下商品生成20个俄语买家搜索词。

商品：${product}
平台：${platform || "Ozon"}

【分类输出】：
🔥 高搜索量核心词（5个）：买家最常搜的大词
🎯 精准长尾词（8个）：带场景/人群/用途的词，转化高
🌟 情绪/节日词（4个）：подарок、праздник等送礼场景词
🔑 属性词（3个）：材质、颜色、尺寸等

每行格式：俄语词 | 中文含义 | 预估月搜索量(高/中/低)
直接输出，不要解释`;
    }
    return `你是跨境电商关键词专家。为以下商品生成15个${platform}平台买家搜索关键词，目标语言：${lang}。
商品：${product}
要求：
1. 每行一个关键词，格式：${lang}词 —— 中文含义
2. 包含：核心词、长尾词、场景词
3. 按搜索量从高到低排列
4. 直接输出关键词列表，不要解释`;
  },

  description: (product, platform, lang) =>
    `你是跨境电商文案专家。为以下商品写3条简短有力的卖点描述，语言：${lang}。
商品：${product}，平台：${platform}
要求：
1. 每条格式：emoji + ${lang}文案 + 换行 + 【中文：...】
2. 每条${lang}文案不超过30字
3. 突出用户价值（解决什么问题/带来什么好处）
4. 直接输出，不要解释`,

  reply: (product, platform, lang) =>
    `你是跨境电商客服专家。用${lang}写一条回复买家差评的模板，平台：${platform}。
差评场景：买家对【${product}】不满意
要求：
1. 先输出${lang}回复内容（100字以内）
2. 再输出【中文参考：...】供卖家理解
3. 真诚道歉，不卑不亢，提供解决方案
4. 直接输出，不要解释`,
};

export async function POST(req: NextRequest) {
  const { product, platform, lang, task } = await req.json().catch(() => ({}));

  if (!product || !task) {
    return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI服务未配置" }, { status: 500 });
  }

  const promptFn = TASKS[task];
  if (!promptFn) {
    return NextResponse.json({ error: "不支持的任务类型" }, { status: 400 });
  }

  const prompt = promptFn(product, platform || "通用", lang || "中文");

  try {
    const resp = await fetch(DEEPSEEK_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`DeepSeek API 错误: ${resp.status} ${err.slice(0, 100)}`);
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ ok: true, content });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
