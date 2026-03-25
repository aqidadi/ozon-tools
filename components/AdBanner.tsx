"use client";

interface AdBannerProps {
  slot?: string;
  size?: "hero" | "banner" | "card" | "inline";
  className?: string;
}

const PLACEHOLDER_ADS = [
  {
    title: "🚀 Ozon 官方认证服务商",
    desc: "一站式入驻、运营、物流，新手首单立减200元",
    cta: "免费咨询",
    href: "#",
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "📦 跨境物流专线 | 俄罗斯/东南亚",
    desc: "清关100%，时效28天，首单免代收费",
    cta: "获取报价",
    href: "#",
    color: "from-orange-500 to-orange-600",
  },
  {
    title: "💡 1688 找货神器 · AI选款",
    desc: "输入关键词，AI帮你筛选高利润潜力商品",
    cta: "立即体验",
    href: "#",
    color: "from-purple-500 to-purple-600",
  },
];

export function AdBanner({ slot = "default", size = "banner", className = "" }: AdBannerProps) {
  const ad = PLACEHOLDER_ADS[slot.length % PLACEHOLDER_ADS.length];

  if (size === "hero") {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${ad.color} text-white p-6 ${className}`}>
        <div className="absolute top-2 right-3 text-[10px] opacity-40">广告</div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold mb-1">{ad.title}</p>
            <p className="text-sm opacity-85">{ad.desc}</p>
          </div>
          <a href={ad.href} className="ml-6 flex-shrink-0 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition whitespace-nowrap">
            {ad.cta} →
          </a>
        </div>
        <p className="text-[10px] opacity-30 mt-3">广告位招租 · 联系 hi@crossly.cn</p>
      </div>
    );
  }

  if (size === "inline") {
    return (
      <div className={`flex items-center justify-between bg-gradient-to-r ${ad.color} text-white rounded-xl px-4 py-2.5 ${className}`}>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate">{ad.title}</p>
          <p className="text-[10px] opacity-80 truncate">{ad.desc}</p>
        </div>
        <a href={ad.href} className="ml-3 flex-shrink-0 bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold px-3 py-1 rounded-lg transition">
          {ad.cta}
        </a>
        <span className="ml-2 text-[9px] opacity-40 flex-shrink-0">广告</span>
      </div>
    );
  }

  if (size === "card") {
    return (
      <div className={`bg-gradient-to-br ${ad.color} text-white rounded-2xl p-4 ${className}`}>
        <p className="text-[10px] opacity-50 mb-1">推广</p>
        <p className="text-sm font-bold mb-1">{ad.title}</p>
        <p className="text-[11px] opacity-80 mb-3">{ad.desc}</p>
        <a href={ad.href} className="inline-block bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition">
          {ad.cta} →
        </a>
      </div>
    );
  }

  // banner (default)
  return (
    <div className={`bg-gray-50 border border-dashed border-gray-200 rounded-xl p-3 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-gray-300">广告位招租 · 联系 hi@crossly.cn</span>
        <span className="text-[10px] text-gray-300">AD</span>
      </div>
      <div className={`bg-gradient-to-r ${ad.color} text-white rounded-lg px-4 py-3 flex items-center justify-between`}>
        <div>
          <p className="text-xs font-bold">{ad.title}</p>
          <p className="text-[10px] opacity-80">{ad.desc}</p>
        </div>
        <a href={ad.href} className="ml-4 flex-shrink-0 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
          {ad.cta}
        </a>
      </div>
    </div>
  );
}
