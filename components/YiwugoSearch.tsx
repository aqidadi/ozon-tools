"use client";
import { useState } from "react";
import { Search, ShoppingBag, ExternalLink, ArrowRight, Lightbulb } from "lucide-react";

const PLATFORMS = [
  {
    id: "yiwugo",
    name: "义乌购",
    desc: "全球最大小商品市场，500万+批发商品",
    icon: "🏪",
    color: "from-green-500 to-teal-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    searchUrl: (kw: string) => `https://www.yiwugo.com/product_list/i_0_0.html?keyword=${encodeURIComponent(kw)}`,
    tag: "义乌市场",
    tips: ["🌟 优先选「1件起批」的店家，减少资金风险", "💬 可以直接联系掌柜砍价，义乌人很好说话", "📦 在义乌发货可直接送北苑仓库，省心省力"],
  },
  {
    id: "1688",
    name: "1688",
    desc: "工厂直供，图片最全，适合做Ozon主力货源",
    icon: "🏭",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700",
    searchUrl: (kw: string) => `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(kw)}&n=y&spm=a2638t.b_80816621.0.0`,
    tag: "工厂直供",
    tips: ["🔌 用Crossly插件在商品页一键导入，30秒搞定", "📸 工厂图片最全最清晰，直接发Ozon不用P图", "✅ 找月销1000+的款，有市场验证才安全"],
  },
  {
    id: "taobao",
    name: "淘宝/天猫",
    desc: "零售+批发，货源丰富，适合小批量",
    icon: "🛒",
    color: "from-orange-400 to-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
    searchUrl: (kw: string) => `https://s.taobao.com/search?q=${encodeURIComponent(kw)}&tab=all`,
    tag: "小批量",
    tips: ["🧪 先买1-3件测款，跑通了再批量备货", "💰 价格通常比1688高一点，但可以1件起拍", "⚡ 发货快，当天下单当天发"],
  },
  {
    id: "pinduoduo",
    name: "拼多多",
    desc: "全网最低价，省钱神器，适合找价格底线",
    icon: "💰",
    color: "from-red-500 to-pink-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    searchUrl: (kw: string) => `https://mobile.pinduoduo.com/search_result.html?search_key=${encodeURIComponent(kw)}`,
    tag: "最低价",
    tips: ["💸 价格比其他平台低10-30%，先比价再下单", "🔍 找到心仪款后去1688找同款工厂货，质量更稳", "⚠️ 质量参差不齐，建议小批量先试卖"],
  },
];

const POPULAR_SEARCHES = [
  "猫咪抱枕", "拉布布公仔", "氛围小夜灯", "毛绒玩具", "硅胶手机壳", "运动手环",
  "网红发夹", "保温杯", "宠物玩具", "卡通钥匙扣", "香薰蜡烛", "儿童发饰",
];

interface Props {
  onImport?: (product: any) => void;
}

export function YiwugoSearch({ onImport }: Props) {
  const [keyword, setKeyword] = useState("");
  const [activePlatform, setActivePlatform] = useState("yiwugo");

  const platform = PLATFORMS.find(p => p.id === activePlatform)!;

  const openSearch = () => {
    if (!keyword.trim()) return;
    window.open(platform.searchUrl(keyword.trim()), "_blank");
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* 头部 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50"
        style={{ background: "linear-gradient(135deg, #fafffe, #f0fdf4)" }}>
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <ShoppingBag size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">输入想卖的宝贝，AI帮你搬到俄罗斯卖卢布 💰</p>
          <p className="text-xs text-gray-400">全网爆款一键收割 · 义乌购 · 1688 · 淘宝 · 拼多多</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* 平台选择 */}
        <div className="grid grid-cols-2 gap-2">
          {PLATFORMS.map(p => (
            <button key={p.id}
              onClick={() => setActivePlatform(p.id)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                activePlatform === p.id
                  ? `${p.bgColor} ${p.borderColor} border-2`
                  : "bg-gray-50 border-gray-100 hover:border-gray-200"
              }`}>
              <span className="text-xl">{p.icon}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className={`text-xs font-bold ${activePlatform === p.id ? p.textColor : "text-gray-700"}`}>{p.name}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activePlatform === p.id ? `${p.bgColor} ${p.textColor}` : "bg-gray-100 text-gray-500"}`}>
                    {p.tag}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{p.desc.slice(0, 16)}...</p>
              </div>
            </button>
          ))}
        </div>

        {/* 搜索框 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && openSearch()}
              placeholder={`输入想卖的宝贝，比如"猫咪抱枕"...`}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 bg-gray-50"
            />
          </div>
          <button
            onClick={openSearch}
            disabled={!keyword.trim()}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 bg-gradient-to-r ${platform.color}`}>
            搜索 <ArrowRight size={14} />
          </button>
        </div>

        {/* 全网爆款一键收割 */}
        <div>
          <p className="text-xs text-gray-400 mb-1.5">🔥 当前俄罗斯爆卖款：</p>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SEARCHES.map(kw => (
              <button key={kw}
                onClick={() => setKeyword(kw)}
                className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700 transition-all">
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* 平台提示 */}
        <div className={`${platform.bgColor} border ${platform.borderColor} rounded-xl p-3`}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lightbulb size={12} className={platform.textColor} />
            <p className={`text-xs font-semibold ${platform.textColor}`}>
              {platform.id === "yiwugo" ? "🏅 宝妈避坑提示" : platform.id === "1688" ? "✅ 高手用法" : "💡 小贴士"}
            </p>
          </div>
          <ul className="space-y-0.5">
            {platform.tips.map((tip, i) => (
              <li key={i} className={`text-[11px] ${platform.textColor} opacity-80 flex items-start gap-1.5`}>
                <span className="mt-0.5 flex-shrink-0">·</span>{tip}
              </li>
            ))}
          </ul>
        </div>

        {/* 找到商品后 */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2">
          <span className="text-base">💡</span>
          <div>
            <p className="text-xs font-semibold text-indigo-700">找到商品后怎么导入？</p>
            <p className="text-[11px] text-indigo-500 mt-0.5">
              1688商品 → 用 Chrome 插件一键导入 &nbsp;|&nbsp; 其他平台 → 点上方「手动添加」按钮填写信息
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
