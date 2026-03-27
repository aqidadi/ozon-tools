"use client";
import { useState } from "react";
import { ExternalLink } from "lucide-react";

// ── 小学生配置单：按「新手上路路径」编排 ────────────────────
const GUIDE_CONFIGS = [
  {
    step: 1,
    emoji: "🔍",
    title: "第一步：用这个选品",
    badge: "Crossly 独家",
    badgeColor: "bg-indigo-500",
    desc: "选品是最重要的一步。Crossly 帮你算利润、看爆款，这一步不要用别的。",
    tools: [
      {
        name: "Crossly 选品看板",
        tag: "免费·独家",
        tagColor: "bg-green-100 text-green-700",
        desc: "小学生精选300+爆款关键词，一键搜索1688，自动计算建议售价",
        url: "#picker",
        emoji: "🏆",
        crossly: true,
        recommend: true,
      },
      {
        name: "Crossly 利润计算器",
        tag: "免费·内置",
        tagColor: "bg-green-100 text-green-700",
        desc: "输入进价+运费，秒算保本线/建议售价/利润率，新手必用",
        url: "#mintools",
        emoji: "📊",
        crossly: true,
        recommend: true,
      },
      {
        name: "谷歌趋势",
        tag: "免费",
        tagColor: "bg-gray-100 text-gray-600",
        desc: "验证你的选品方向，看全球搜索热度涨跌",
        url: "https://trends.google.com",
        emoji: "📈",
      },
      {
        name: "EchoTik",
        tag: "免费",
        tagColor: "bg-gray-100 text-gray-600",
        desc: "TikTok Shop爆品榜单，看什么在东南亚热卖",
        url: "https://echotik.live",
        emoji: "🎵",
      },
    ],
  },
  {
    step: 2,
    emoji: "🛒",
    title: "第二步：去这里找货",
    badge: "小学生推荐",
    badgeColor: "bg-orange-500",
    desc: "货源就用1688。义乌购是补充。其他的先不用管。",
    tools: [
      {
        name: "1688",
        tag: "必备",
        tagColor: "bg-orange-100 text-orange-700",
        desc: "国内最大采购平台，货源最全、价格最低。装了Crossly插件后一键导入",
        url: "https://www.1688.com",
        emoji: "🛒",
        recommend: true,
      },
      {
        name: "义乌购",
        tag: "补充",
        tagColor: "bg-gray-100 text-gray-600",
        desc: "义乌小商品市场线上版，毛绒/礼品类货源丰富",
        url: "https://www.yiwugo.com",
        emoji: "🏪",
      },
    ],
  },
  {
    step: 3,
    emoji: "🚀",
    title: "第三步：用这个上货（小学生亲测最稳）",
    badge: "小学生亲测",
    badgeColor: "bg-red-500",
    desc: "上货工具小学生全测过了。秒手最适合Ozon新手，店小秘适合多平台老手。不要听别人乱推荐。",
    tools: [
      {
        name: "秒手",
        tag: "新手首选",
        tagColor: "bg-red-100 text-red-600",
        desc: "【小学生亲测最稳】专为Ozon设计，一键从1688上货到Ozon，操作傻瓜，新手必装",
        url: "https://www.miaoshou.com",
        emoji: "⚡",
        recommend: true,
        tip: "Crossly选品 → 秒手上货，黄金搭配",
      },
      {
        name: "店小秘",
        tag: "多平台老手",
        tagColor: "bg-blue-100 text-blue-600",
        desc: "支持Ozon+Shopee+Lazada+TikTok多平台，有一定经验再用，新手略复杂",
        url: "https://www.dianxiaomi.com",
        emoji: "🗂️",
        tip: "做多平台时再升级到这个",
      },
      {
        name: "芒果店长",
        tag: "备选",
        tagColor: "bg-yellow-100 text-yellow-600",
        desc: "功能全但稍贵，适合月营业额过万后再考虑",
        url: "https://www.mangguodianzhang.com",
        emoji: "🥭",
      },
    ],
  },
  {
    step: 4,
    emoji: "✈️",
    title: "第四步：发货物流",
    badge: "小学生在地推荐",
    badgeColor: "bg-teal-500",
    desc: "我在义乌北苑，这些货代我亲自用过。你照着找，少踩坑。",
    tools: [
      {
        name: "RETS跨境快线（Ozon官方）",
        tag: "Ozon必用",
        tagColor: "bg-indigo-100 text-indigo-600",
        desc: "Ozon官方合作物流，25-50元/500g，5-10天到俄罗斯，最稳不丢件",
        url: "https://seller.ozon.ru",
        emoji: "🇷🇺",
        recommend: true,
      },
      {
        name: "J&T Express（极兔）",
        tag: "东南亚首选",
        tagColor: "bg-amber-100 text-amber-600",
        desc: "东南亚最便宜，2-5元/500g，Shopee/Lazada/TikTok都可用",
        url: "https://www.jtexpress.com.cn",
        emoji: "🌏",
        recommend: true,
      },
      {
        name: "17Track",
        tag: "免费",
        tagColor: "bg-gray-100 text-gray-600",
        desc: "全球包裹追踪，买家问物流时你直接给链接",
        url: "https://www.17track.net",
        emoji: "📍",
      },
    ],
  },
  {
    step: 5,
    emoji: "💱",
    title: "第五步：收钱提现",
    badge: "亲测可用",
    badgeColor: "bg-green-600",
    desc: "外币换人民币，两个工具选一个就够了。",
    tools: [
      {
        name: "万里汇 WorldFirst",
        tag: "推荐",
        tagColor: "bg-green-100 text-green-700",
        desc: "到账快、汇率好、提现手续费低，Ozon卖家首选",
        url: "https://www.worldfirst.com.cn",
        emoji: "💳",
        recommend: true,
      },
      {
        name: "连连国际",
        tag: "备选",
        tagColor: "bg-gray-100 text-gray-600",
        desc: "支持卢布结算，俄罗斯市场常用",
        url: "https://www.lianlianpay.com",
        emoji: "🏦",
      },
    ],
  },
  {
    step: 6,
    emoji: "🎨",
    title: "加分项：做好图片",
    badge: "提升转化",
    badgeColor: "bg-pink-500",
    desc: "主图好不好，直接影响点击率。这几个工具免费好用。",
    tools: [
      {
        name: "remove.bg",
        tag: "免费",
        tagColor: "bg-gray-100 text-gray-600",
        desc: "一键AI抠图，白底主图秒做好",
        url: "https://www.remove.bg",
        emoji: "✂️",
      },
      {
        name: "DeepL翻译",
        tag: "免费",
        tagColor: "bg-gray-100 text-gray-600",
        desc: "比谷歌翻译更自然，外语标题/描述必备",
        url: "https://www.deepl.com",
        emoji: "🌐",
      },
      {
        name: "Canva",
        tag: "免费",
        tagColor: "bg-gray-100 text-gray-600",
        desc: "拖拽式设计，海报/主图/详情图都能做",
        url: "https://www.canva.com",
        emoji: "🖌️",
      },
      {
        name: "TinyPNG",
        tag: "免费",
        tagColor: "bg-gray-100 text-gray-600",
        desc: "图片压缩，上传更快，不影响画质",
        url: "https://tinypng.com",
        emoji: "🐼",
      },
    ],
  },
];

export function ToolsPage() {
  const [openStep, setOpenStep] = useState<number | null>(1);

  const handleToolClick = (url: string) => {
    if (url.startsWith("#")) {
      // 内部跳转
      return;
    }
    window.open(url, "_blank");
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="-mx-6 -mt-6 mb-6 px-6 py-7 text-white"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)" }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎒</span>
          <h1 className="text-lg font-black">小学生配置单</h1>
          <span className="text-[10px] bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full ml-1">亲测有效</span>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">
          我把全网跨境工具都测了一遍，帮你挑出最适合新手的组合。<br/>
          <span className="text-white font-semibold">照着这个配置单走，少踩90%的坑。</span>
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
          <span>📍 小学生亲测</span>
          <span>·</span>
          <span>2026年最新版</span>
          <span>·</span>
          <span>永久免费查看</span>
        </div>
      </div>

      {/* 竞品说明横幅 */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4 flex items-start gap-3">
        <span className="text-xl flex-shrink-0">💬</span>
        <div>
          <p className="text-xs font-black text-amber-800 mb-0.5">小学生说：我们推荐竞品，因为我们更自信</p>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            秒手上货稳，店小秘管多平台，Crossly 帮你选品和算利润——这是目前最好的新手组合。
            工具不分你我，帮你赚到钱才是目的。
          </p>
        </div>
      </div>

      {/* 配置单步骤 */}
      <div className="space-y-3">
        {GUIDE_CONFIGS.map((config) => {
          const isOpen = openStep === config.step;
          return (
            <div key={config.step} className={`border rounded-2xl overflow-hidden transition-all ${isOpen ? "border-indigo-200 shadow-md" : "border-gray-100"}`}>
              {/* Step Header */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpenStep(isOpen ? null : config.step)}
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                  {config.step}
                </div>
                <span className="text-lg">{config.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-sm truncate">{config.title}</p>
                </div>
                <span className={`text-[9px] font-bold text-white px-2 py-0.5 rounded-full flex-shrink-0 ${config.badgeColor}`}>
                  {config.badge}
                </span>
                <span className="text-gray-400 text-sm flex-shrink-0">{isOpen ? "▲" : "▼"}</span>
              </button>

              {/* Step Content */}
              {isOpen && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                  <p className="text-xs text-gray-500 leading-relaxed mb-3 bg-gray-50 rounded-xl px-3 py-2">
                    💬 {config.desc}
                  </p>
                  <div className="space-y-2">
                    {config.tools.map((tool) => (
                      <div key={tool.name}
                        className={`rounded-xl border p-3 transition-all ${tool.recommend ? "border-indigo-200 bg-indigo-50" : "border-gray-100 bg-white"}`}>
                        <div className="flex items-start gap-2.5">
                          <span className="text-xl flex-shrink-0 mt-0.5">{tool.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className="font-bold text-gray-900 text-sm">{tool.name}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tool.tagColor}`}>{tool.tag}</span>
                              {(tool as {crossly?: boolean}).crossly && <span className="text-[9px] bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded-full">Crossly内置</span>}
                              {(tool as {recommend?: boolean}).recommend && !(tool as {crossly?: boolean}).crossly && <span className="text-[9px] bg-orange-500 text-white font-bold px-1.5 py-0.5 rounded-full">⭐ 小学生推荐</span>}
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">{tool.desc}</p>
                            {(tool as {tip?: string}).tip && (
                              <p className="text-[10px] text-indigo-600 font-semibold mt-1">💡 {(tool as {tip?: string}).tip}</p>
                            )}
                          </div>
                          {!(tool as {crossly?: boolean}).crossly && (
                            <button
                              onClick={() => handleToolClick(tool.url)}
                              className="flex-shrink-0 flex items-center gap-1 text-[10px] text-indigo-600 bg-white border border-indigo-200 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors mt-0.5">
                              <span>去用</span>
                              <ExternalLink size={9} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center mt-6 text-xs text-gray-400 pb-4">
        <p>📍 以上工具均为小学生亲测，非广告推荐</p>
        <p className="mt-1">发现更好的工具？<span className="underline text-indigo-400">告诉我们</span>，我们持续更新配置单</p>
      </div>
    </div>
  );
}
