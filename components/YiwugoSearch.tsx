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
    tips: ["价格单位多样（元/公斤、元/个）", "可以联系商家询价", "起订量从1件到100件不等"],
  },
  {
    id: "1688",
    name: "1688",
    desc: "阿里巴巴国内批发平台，工厂直供",
    icon: "🏭",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700",
    searchUrl: (kw: string) => `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(kw)}&n=y&spm=a2638t.b_80816621.0.0`,
    tag: "工厂直供",
    tips: ["用Chrome插件导入商品（服务端被封）", "工厂货起订量通常较高", "图片和规格最完整"],
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
    tips: ["适合测款，起订量低", "价格含零售成本", "速度快，有现货"],
  },
  {
    id: "pinduoduo",
    name: "拼多多",
    desc: "价格最低，适合找极致低价货源",
    icon: "💰",
    color: "from-red-500 to-pink-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    searchUrl: (kw: string) => `https://mobile.pinduoduo.com/search_result.html?search_key=${encodeURIComponent(kw)}`,
    tag: "最低价",
    tips: ["价格比1688/淘宝便宜10-30%", "部分商品质量参差不齐", "适合找价格基准"],
  },
];

const POPULAR_SEARCHES = [
  "手机壳", "蓝牙耳机", "毛绒玩具", "草帽", "首饰", "运动手环",
  "LED灯", "充电宝", "保温杯", "瑜伽垫", "宠物玩具", "丝巾",
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
          <p className="text-sm font-bold text-gray-800">货源搜索</p>
          <p className="text-xs text-gray-500">义乌购 · 1688 · 淘宝 · 拼多多，一键跳转</p>
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
              placeholder={`在 ${platform.name} 搜索商品...`}
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

        {/* 热门关键词 */}
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_SEARCHES.map(kw => (
            <button key={kw}
              onClick={() => setKeyword(kw)}
              className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700 transition-all">
              {kw}
            </button>
          ))}
        </div>

        {/* 平台提示 */}
        <div className={`${platform.bgColor} border ${platform.borderColor} rounded-xl p-3`}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lightbulb size={12} className={platform.textColor} />
            <p className={`text-xs font-semibold ${platform.textColor}`}>{platform.name} 使用提示</p>
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
