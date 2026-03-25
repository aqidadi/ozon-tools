"use client";
import { useState } from "react";
import { ExternalLink, Search, Star } from "lucide-react";

const CATEGORIES = [
  {
    id: "hot", emoji: "🔥", title: "热门工具", desc: "卖家最常用",
    color: "from-orange-500 to-red-500",
    tools: [
      { name: "DeepL翻译", tag: "免费", desc: "最自然的AI翻译，超越谷歌翻译", url: "https://www.deepl.com", emoji: "🌐" },
      { name: "Removebg", tag: "免费", desc: "一键AI抠图，主图必备", url: "https://www.remove.bg", emoji: "✂️" },
      { name: "汇率换算", tag: "内置", desc: "Crossly内置，10货币实时换算", url: "#mintools", emoji: "💱" },
      { name: "利润计算", tag: "内置", desc: "Crossly内置，考虑运费佣金", url: "#mintools", emoji: "📊" },
      { name: "1688插件", tag: "独家", desc: "一键导入1688商品+详情图+规格", url: "https://www.crossly.cn/crossly-extension.zip?v=20260325", emoji: "🔌" },
      { name: "创客贴", tag: "免费", desc: "在线设计主图海报，模板丰富", url: "https://www.chuangkit.com", emoji: "🎨" },
    ]
  },
  {
    id: "data", emoji: "📈", title: "数据选品", desc: "找爆款靠它",
    color: "from-blue-500 to-indigo-600",
    tools: [
      { name: "知虾", tag: "付费", desc: "Shopee/Lazada商品销量数据", url: "https://www.zhi-xia.com", emoji: "🦐" },
      { name: "EchoTik", tag: "免费", desc: "TikTok Shop爆品、KOL排名", url: "https://echotik.live", emoji: "📱" },
      { name: "卖家精灵", tag: "付费", desc: "亚马逊关键词+流量分析", url: "https://www.sellersprite.com", emoji: "🧞" },
      { name: "Jungle Scout", tag: "付费", desc: "亚马逊选品神器，销量估算", url: "https://www.junglescout.com", emoji: "🌿" },
      { name: "飞瓜数据", tag: "付费", desc: "抖音/快手带货数据，找达人", url: "https://www.feigua.io", emoji: "🍉" },
      { name: "谷歌趋势", tag: "免费", desc: "看全球搜索热度，挖掘蓝海", url: "https://trends.google.com", emoji: "📉" },
    ]
  },
  {
    id: "source", emoji: "🏭", title: "货源采购", desc: "找工厂供应商",
    color: "from-green-500 to-teal-600",
    tools: [
      { name: "1688", tag: "必备", desc: "国内最大采购平台，B端货源", url: "https://www.1688.com", emoji: "🛒" },
      { name: "义乌购", tag: "免费", desc: "义乌小商品市场线上版", url: "https://www.yiwugo.com", emoji: "🏪" },
      { name: "全球速卖通", tag: "免费", desc: "中国卖家面向全球的平台", url: "https://www.aliexpress.com", emoji: "⚡" },
      { name: "Thomasnet", tag: "免费", desc: "美国制造商数据库", url: "https://www.thomasnet.com", emoji: "🔩" },
      { name: "ImportYeti", tag: "免费", desc: "查美国进口提单，看对手供应链", url: "https://www.importyeti.com", emoji: "🚢" },
      { name: "Trade Map", tag: "免费", desc: "ITC国际贸易地图，看全球贸易流", url: "https://www.trademap.org", emoji: "🗺️" },
    ]
  },
  {
    id: "logistics", emoji: "🚚", title: "物流海关", desc: "发货清关必备",
    color: "from-purple-500 to-violet-600",
    tools: [
      { name: "HS编码查询", tag: "免费", desc: "海关商品编码查询，报关必备", url: "https://www.hsbianma.com", emoji: "📦" },
      { name: "关税计算", tag: "免费", desc: "各国进口关税税率计算", url: "https://www.simplyduty.com", emoji: "🧾" },
      { name: "17Track", tag: "免费", desc: "全球包裹追踪，400+物流公司", url: "https://www.17track.net", emoji: "📍" },
      { name: "运通天下", tag: "免费", desc: "小包/专线/海运报价查询", url: "https://www.transrush.com", emoji: "✈️" },
      { name: "易仓物流", tag: "付费", desc: "跨境物流整合，FBA头程", url: "https://www.eccang.com", emoji: "🏗️" },
      { name: "跨境王物流", tag: "报价", desc: "俄罗斯/东欧专线，Ozon必备", url: "https://www.kjw56.com", emoji: "🇷🇺" },
    ]
  },
  {
    id: "design", emoji: "🎨", title: "图片设计", desc: "做好主图转化",
    color: "from-pink-500 to-rose-600",
    tools: [
      { name: "Canva", tag: "免费", desc: "拖拽式设计，海量模板", url: "https://www.canva.com", emoji: "🖌️" },
      { name: "TinyPNG", tag: "免费", desc: "无损压缩图片，提升加载速度", url: "https://tinypng.com", emoji: "🐼" },
      { name: "Pixabay", tag: "免费", desc: "免版权高清图，可商用", url: "https://pixabay.com", emoji: "📷" },
      { name: "Unsplash", tag: "免费", desc: "高质量摄影图，免费商用", url: "https://unsplash.com", emoji: "🖼️" },
      { name: "魔抠", tag: "免费", desc: "国内AI抠图工具，批量处理", url: "https://www.mokcut.com", emoji: "🪄" },
      { name: "Photopea", tag: "免费", desc: "网页版PS，无需安装", url: "https://www.photopea.com", emoji: "💻" },
    ]
  },
  {
    id: "erp", emoji: "⚙️", title: "ERP运营", desc: "管理订单发货",
    color: "from-gray-600 to-slate-700",
    tools: [
      { name: "店小秘", tag: "付费", desc: "多平台ERP，刊登打单一体", url: "https://www.dianxiaomi.com", emoji: "🗂️" },
      { name: "妙手ERP", tag: "付费", desc: "Shopee/Lazada专属ERP", url: "https://www.miaoshousoft.com", emoji: "🛠️" },
      { name: "领星ERP", tag: "付费", desc: "亚马逊卖家首选ERP", url: "https://www.lingxing.com", emoji: "⭐" },
      { name: "通途Ton", tag: "付费", desc: "订单/发货/仓库一站管理", url: "https://www.tongtool.com", emoji: "🔄" },
      { name: "万里汇", tag: "免费", desc: "跨境收款，Ozon卖家常用", url: "https://www.worldfirst.com.cn", emoji: "💳" },
      { name: "连连国际", tag: "免费", desc: "俄罗斯/东欧卢布收款结算", url: "https://www.lianlianpay.com", emoji: "🏦" },
    ]
  },
  {
    id: "learn", emoji: "📚", title: "学习资讯", desc: "跟上行业动态",
    color: "from-cyan-500 to-blue-500",
    tools: [
      { name: "AMZ123", desc: "跨境卖家导航，资讯+工具", url: "https://www.amz123.com", emoji: "🧭", tag: "导航" },
      { name: "雨果网", desc: "跨境综合资讯，政策早知道", url: "https://www.cifnews.com", emoji: "📰", tag: "资讯" },
      { name: "Shopee大学", desc: "Shopee官方免费卖家培训", url: "https://sellercenter.shopee.cn", emoji: "🎓", tag: "官方" },
      { name: "Ozon大学", desc: "Ozon官方卖家学习中心", url: "https://seller.ozon.ru/university", emoji: "🎓", tag: "官方" },
      { name: "跨境知道", desc: "跨境问答社区，踩坑避雷", url: "https://www.kjzhidao.com", emoji: "💬", tag: "社区" },
      { name: "TikTok官方", desc: "TikTok Shop卖家中心", url: "https://seller-id.tiktok.com", emoji: "🎵", tag: "官方" },
    ]
  },
  {
    id: "ai", emoji: "🤖", title: "AI工具", desc: "效率提升10倍",
    color: "from-violet-500 to-purple-600",
    tools: [
      { name: "DeepSeek", tag: "免费", desc: "国产最强AI，写标题/回评价", url: "https://www.deepseek.com", emoji: "🔮" },
      { name: "ChatGPT", tag: "付费", desc: "写文案、翻译、客服回复", url: "https://chat.openai.com", emoji: "🧠" },
      { name: "沉浸式翻译", tag: "免费", desc: "网页双语对照，看竞品页面", url: "https://immersivetranslate.com", emoji: "🌏" },
      { name: "Midjourney", tag: "付费", desc: "AI生成产品场景图/主图", url: "https://www.midjourney.com", emoji: "🖼️" },
      { name: "Kimi", tag: "免费", desc: "国产长文本AI，读报告写分析", url: "https://kimi.moonshot.cn", emoji: "🌙" },
      { name: "CapCut", tag: "免费", desc: "剪映海外版，快速做TikTok视频", url: "https://www.capcut.com", emoji: "🎬" },
    ]
  },
];

const TAG_COLORS: Record<string, string> = {
  "免费": "bg-green-100 text-green-700",
  "付费": "bg-gray-100 text-gray-500",
  "内置": "bg-indigo-100 text-indigo-700",
  "独家": "bg-purple-100 text-purple-700",
  "必备": "bg-red-100 text-red-700",
  "报价": "bg-orange-100 text-orange-700",
  "导航": "bg-blue-100 text-blue-700",
  "资讯": "bg-sky-100 text-sky-700",
  "官方": "bg-yellow-100 text-yellow-700",
  "社区": "bg-teal-100 text-teal-700",
};

export function ToolsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = CATEGORIES.map(cat => ({
    ...cat,
    tools: cat.tools.filter(t =>
      !search || t.name.includes(search) || t.desc.includes(search)
    )
  })).filter(cat =>
    (!activeCategory || cat.id === activeCategory) && cat.tools.length > 0
  );

  return (
    <div className="space-y-4">
      {/* 顶部搜索 + 分类筛选 */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索工具名称或功能..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50"
            />
          </div>
          {search && (
            <button onClick={() => setSearch("")}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100">
              清除
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${!activeCategory ? "bg-indigo-600 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            全部
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${activeCategory === cat.id ? "bg-indigo-600 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {cat.emoji} {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* 工具卡片 */}
      {filtered.map(cat => (
        <div key={cat.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {/* 分类头部 */}
          <div className={`px-5 py-3 bg-gradient-to-r ${cat.color} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{cat.emoji}</span>
              <div>
                <span className="text-sm font-bold text-white">{cat.title}</span>
                <span className="text-xs text-white/70 ml-2">{cat.desc}</span>
              </div>
            </div>
            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{cat.tools.length} 个工具</span>
          </div>

          {/* 工具网格 */}
          <div className="p-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {cat.tools.map(tool => (
              <a key={tool.name} href={tool.url.startsWith("#") ? undefined : tool.url}
                target={tool.url.startsWith("#") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="group flex items-start gap-2.5 p-2.5 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-pointer">
                <span className="text-xl flex-shrink-0 mt-0.5">{tool.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-semibold text-gray-800 group-hover:text-indigo-700 truncate">{tool.name}</p>
                    {tool.tag && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${TAG_COLORS[tool.tag] ?? "bg-gray-100 text-gray-500"}`}>
                        {tool.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-tight line-clamp-2">{tool.desc}</p>
                </div>
                <ExternalLink size={10} className="flex-shrink-0 mt-1 text-gray-300 group-hover:text-indigo-400" />
              </a>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm">没有找到"{search}"相关工具</p>
        </div>
      )}

      {/* 底部提交入口 */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">📬 推荐好工具</p>
          <p className="text-xs text-gray-500 mt-0.5">有好用的跨境工具没收录？告诉我们</p>
        </div>
        <a href="mailto:hi@crossly.cn"
          className="text-xs px-4 py-2 rounded-xl text-white font-medium"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          去推荐 →
        </a>
      </div>
    </div>
  );
}
