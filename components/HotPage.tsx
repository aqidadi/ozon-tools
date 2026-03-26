"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AdBanner } from "@/components/AdBanner";

interface HotItem {
  rank: number;
  name: string;
  category: string;
  trend: "up" | "down" | "stable";
  growth: string;
  reason: string;
  searchUrl?: string;
}

interface Platform {
  id: string;
  label: string;
  emoji: string;
  color: string;
  bg: string;
  border: string;
  ranklistUrl: string;
  ranklistLabel: string;
  description: string;
  items: HotItem[];
}

const PLATFORMS: Platform[] = [
  {
    id: "tiktok",
    label: "TikTok Shop",
    emoji: "🎵",
    color: "text-pink-600",
    bg: "bg-pink-600",
    border: "border-pink-200",
    ranklistUrl: "https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en",
    ranklistLabel: "TikTok Creative Center",
    description: "短视频带货爆品 · 冲动消费为主",
    items: [
      { rank: 1, name: "LED氛围灯 RGB多彩", category: "家居灯具", trend: "up", growth: "+91%", reason: "直播打光神器，达人带货效果炸裂" },
      { rank: 2, name: "磁吸手机支架 折叠", category: "手机配件", trend: "up", growth: "+74%", reason: "开车/追剧必备，视觉展示效果好" },
      { rank: 3, name: "猫咪长条抱枕 毛绒", category: "毛绒玩具", trend: "up", growth: "+68%", reason: "社媒病毒传播，外形萌引发复购" },
      { rank: 4, name: "电子宠物 复古手持", category: "电子玩具", trend: "up", growth: "+55%", reason: "Z世代怀旧风潮，TK种草极快" },
      { rank: 5, name: "香薰蜡烛礼盒 网红款", category: "家居香氛", trend: "stable", growth: "+22%", reason: "礼品刚需，精致包装出镜率高" },
      { rank: 6, name: "迷你便携投影仪", category: "数码电子", trend: "up", growth: "+48%", reason: "户外露营热，场景化展示转化高" },
      { rank: 7, name: "Y2K辣妹夸张耳环", category: "时尚饰品", trend: "stable", growth: "+18%", reason: "穿搭博主标配，每季更新款式" },
      { rank: 8, name: "宠物自动逗猫棒", category: "宠物用品", trend: "up", growth: "+61%", reason: "视频内容天然有趣，分享率高" },
    ],
  },
  {
    id: "ozon",
    label: "Ozon",
    emoji: "🇷🇺",
    color: "text-blue-600",
    bg: "bg-blue-600",
    border: "border-blue-200",
    ranklistUrl: "https://www.ozon.ru/highlight/bestsellers-10985822/",
    ranklistLabel: "Ozon 官方热销榜",
    description: "俄罗斯电商龙头 · 本地化需求为主",
    items: [
      { rank: 1, name: "棉花娃娃素体 20cm", category: "棉花娃娃", trend: "up", growth: "+45%", reason: "俄罗斯女性消费者高复购，节日礼品首选" },
      { rank: 2, name: "硅藻泥吸水地垫", category: "家居生活", trend: "up", growth: "+38%", reason: "浴室防滑刚需，品质口碑传播" },
      { rank: 3, name: "宠物自动饮水机", category: "宠物用品", trend: "up", growth: "+35%", reason: "俄罗斯养宠比例高，市场快速增长" },
      { rank: 4, name: "便携挂耳咖啡", category: "食品饮料", trend: "up", growth: "+29%", reason: "咖啡消费文化崛起，单价低易冲动购买" },
      { rank: 5, name: "儿童泡泡枪玩具", category: "儿童玩具", trend: "up", growth: "+42%", reason: "儿童节前备货季，家长采购高峰" },
      { rank: 6, name: "手账贴纸套装", category: "文创文具", trend: "stable", growth: "+14%", reason: "学生群体稳定需求，全年销售平稳" },
      { rank: 7, name: "美妆刷套装 16支", category: "美妆工具", trend: "up", growth: "+26%", reason: "俄罗斯女性消费力强，礼盒送礼热门" },
      { rank: 8, name: "数据线 3合1 编织", category: "手机配件", trend: "stable", growth: "+11%", reason: "多设备兼容，刚需复购快" },
    ],
  },
  {
    id: "shopee",
    label: "Shopee",
    emoji: "🛍️",
    color: "text-orange-600",
    bg: "bg-orange-500",
    border: "border-orange-200",
    ranklistUrl: "https://shopee.co.th/",
    ranklistLabel: "Shopee 热销榜",
    description: "东南亚最大电商 · 泰越印马菲",
    items: [
      { rank: 1, name: "防晒霜 SPF50+ 轻薄", category: "防晒护肤", trend: "up", growth: "+88%", reason: "东南亚全年热带气候，防晒是刚需" },
      { rank: 2, name: "无线蓝牙耳机 入耳式", category: "数码配件", trend: "up", growth: "+65%", reason: "通勤娱乐刚需，价格敏感带动走量" },
      { rank: 3, name: "迷你风扇 USB充电", category: "家用电器", trend: "up", growth: "+72%", reason: "高温天气刚需，轻巧便携好评多" },
      { rank: 4, name: "收纳袋 旅行防水", category: "旅行收纳", trend: "stable", growth: "+23%", reason: "东南亚旅游热，多种尺寸套装热卖" },
      { rank: 5, name: "美白精华 烟酰胺", category: "美容护肤", trend: "up", growth: "+54%", reason: "东南亚美白需求极大，成分党兴起" },
      { rank: 6, name: "儿童学习文具套装", category: "文具教育", trend: "up", growth: "+31%", reason: "开学季需求旺，家长团购多" },
      { rank: 7, name: "网红零食礼包", category: "食品零食", trend: "stable", growth: "+19%", reason: "TikTok种草转化，节日送礼热门" },
      { rank: 8, name: "运动护膝护腕套", category: "运动健身", trend: "up", growth: "+28%", reason: "健身风潮兴起，年轻群体关注度高" },
    ],
  },
  {
    id: "amazon",
    label: "亚马逊",
    emoji: "🌎",
    color: "text-yellow-700",
    bg: "bg-yellow-500",
    border: "border-yellow-200",
    ranklistUrl: "https://www.amazon.com/gp/bestsellers",
    ranklistLabel: "Amazon Best Sellers",
    description: "欧美主流市场 · 品质要求高",
    items: [
      { rank: 1, name: "硅胶厨具套装 耐高温", category: "厨房用品", trend: "up", growth: "+33%", reason: "居家烹饪热潮延续，礼品采购稳定" },
      { rank: 2, name: "蓝牙追踪器 防丢失", category: "数码配件", trend: "up", growth: "+57%", reason: "AirTag热度带动，旅行行李追踪刚需" },
      { rank: 3, name: "办公人体工学腰垫", category: "办公用品", trend: "stable", growth: "+21%", reason: "居家办公常态化，健康办公持续热" },
      { rank: 4, name: "宠物磨爪板 瓦楞纸", category: "宠物用品", trend: "up", growth: "+44%", reason: "美国养宠家庭多，消耗品高复购" },
      { rank: 5, name: "便携折叠露营桌椅", category: "户外运动", trend: "up", growth: "+39%", reason: "美国露营Glamping风潮，春夏旺季" },
      { rank: 6, name: "儿童磁力贴画套装", category: "儿童玩具", trend: "up", growth: "+28%", reason: "益智教育类礼品，亚马逊高评分口碑好" },
      { rank: 7, name: "电动洁面仪 硅胶", category: "美容仪器", trend: "stable", growth: "+18%", reason: "护肤科技感强，客单价高利润好" },
      { rank: 8, name: "保温杯 大容量1L", category: "餐饮厨具", trend: "up", growth: "+35%", reason: "Stanley带动同类热销，实用口碑强" },
    ],
  },
  {
    id: "aliexpress",
    label: "速卖通",
    emoji: "🌍",
    color: "text-red-600",
    bg: "bg-red-500",
    border: "border-red-200",
    ranklistUrl: "https://www.aliexpress.com/gcp/300000512/OqTEjjpT?spm=a2g0o.home.trending.1.1",
    ranklistLabel: "速卖通热销榜",
    description: "中东欧非拉 · 高性价比优势",
    items: [
      { rank: 1, name: "车载手机支架 磁吸", category: "汽车用品", trend: "up", growth: "+52%", reason: "中东驾车率高，手机导航刚需" },
      { rank: 2, name: "小白鞋 百搭休闲", category: "鞋类服饰", trend: "up", growth: "+41%", reason: "全球通款，性价比高走量大" },
      { rank: 3, name: "仿真花束 永生花", category: "家居装饰", trend: "up", growth: "+36%", reason: "节日送礼替代鲜花，保存时间长" },
      { rank: 4, name: "无线鼠标键盘套装", category: "电脑配件", trend: "stable", growth: "+24%", reason: "居家办公刚需，性价比高竞争力强" },
      { rank: 5, name: "男士手表 机械风格", category: "手表饰品", trend: "up", growth: "+31%", reason: "中东男性消费力强，送礼首选" },
      { rank: 6, name: "假发 直发 长款", category: "美发用品", trend: "up", growth: "+68%", reason: "非洲/中东假发需求巨大，增长快" },
      { rank: 7, name: "太阳能充电板 折叠", category: "户外数码", trend: "up", growth: "+44%", reason: "非洲电力不稳定，太阳能产品刚需" },
      { rank: 8, name: "穆斯林礼拜毯", category: "宗教用品", trend: "stable", growth: "+20%", reason: "中东斋月前后需求大涨，季节性强" },
    ],
  },
];

const SEARCH_URLS: Record<string, (kw: string) => string> = {
  tiktok: (kw) => `https://search.1688.com/search/product.do?SearchText=${encodeURIComponent(kw)}&sortType=6`,
  ozon: (kw) => `https://search.1688.com/search/product.do?SearchText=${encodeURIComponent(kw)}&sortType=6`,
  shopee: (kw) => `https://search.1688.com/search/product.do?SearchText=${encodeURIComponent(kw)}&sortType=6`,
  amazon: (kw) => `https://search.1688.com/search/product.do?SearchText=${encodeURIComponent(kw)}&sortType=6`,
  aliexpress: (kw) => `https://search.1688.com/search/product.do?SearchText=${encodeURIComponent(kw)}&sortType=6`,
};

export function HotPage() {
  const [activePlatform, setActivePlatform] = useState("tiktok");
  const [copied, setCopied] = useState<string | null>(null);

  const platform = PLATFORMS.find(p => p.id === activePlatform)!;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const search1688 = (kw: string) => {
    window.open(SEARCH_URLS[activePlatform](kw), "_blank");
  };

  const openRanklist = () => {
    window.open(platform.ranklistUrl, "_blank");
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">全平台爆品榜单</h2>
        <p className="text-sm text-gray-500 mt-0.5">TikTok · Ozon · Shopee · 亚马逊 · 速卖通 · 每周更新</p>
      </div>

      {/* Platform Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {PLATFORMS.map(p => (
          <button
            key={p.id}
            onClick={() => setActivePlatform(p.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
              activePlatform === p.id
                ? `${p.bg} text-white shadow-md`
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>{p.emoji}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Platform Header Card */}
      <div className={`bg-white border ${platform.border} rounded-2xl px-5 py-4 mb-4 flex items-center justify-between`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{platform.emoji}</span>
            <span className={`text-base font-bold ${platform.color}`}>{platform.label}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{platform.description}</p>
        </div>
        <button
          onClick={openRanklist}
          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl ${platform.bg} text-white hover:opacity-90 transition-opacity`}
        >
          <ExternalLink size={12} />
          {platform.ranklistLabel}
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {platform.items.map(item => (
          <div key={item.rank} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-gray-300 transition-colors">
            {/* Rank */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              item.rank <= 3 ? `${platform.bg} text-white` : "bg-gray-100 text-gray-500"
            }`}>
              {item.rank}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{item.category}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{item.reason}</p>
            </div>

            {/* Trend */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className={`text-sm font-bold ${
                item.trend === "up" ? "text-green-600" : item.trend === "down" ? "text-red-500" : "text-gray-500"
              }`}>
                {item.growth}
              </span>
              {item.trend === "up" ? <TrendingUp size={13} className="text-green-500" /> :
               item.trend === "down" ? <TrendingDown size={13} className="text-red-400" /> :
               <Minus size={13} className="text-gray-400" />}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => copy(item.name)}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="复制关键词">
                {copied === item.name ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
              <button onClick={() => search1688(item.name)}
                className="text-xs px-2.5 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap">
                搜1688
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          📌 数据综合各平台公开热销趋势，每周人工更新 · 点击「搜1688」直接找货源
        </p>
        <button
          onClick={openRanklist}
          className={`flex items-center gap-1 text-xs ${platform.color} hover:underline`}
        >
          查看{platform.label}完整榜单 <ExternalLink size={11} />
        </button>
      </div>

      <AdBanner slot="hot-bottom" size="banner" className="mt-4" />
    </div>
  );
}
