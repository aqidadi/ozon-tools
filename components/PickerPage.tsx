"use client";

import { useState } from "react";
import { ExternalLink, Search, TrendingUp } from "lucide-react";

const CATEGORIES = [
  {
    name: "动漫周边",
    icon: "🎌",
    keywords: [
      { label: "咒术回战手办", kw: "咒术回战 手办", hot: true },
      { label: "鬼灭之刃公仔", kw: "鬼灭之刃 公仔", hot: true },
      { label: "海贼王手办", kw: "海贼王 手办 摆件", hot: true },
      { label: "进击的巨人周边", kw: "进击的巨人 周边", hot: false },
      { label: "龙珠手办", kw: "龙珠 手办", hot: true },
      { label: "火影忍者摆件", kw: "火影忍者 摆件", hot: false },
      { label: "原神周边", kw: "原神 周边 摆件", hot: true },
      { label: "我的英雄学院", kw: "僕のヒーローアカデミア 手办", hot: false },
      { label: "棉花娃娃", kw: "动漫 棉花娃娃 八寸", hot: true },
      { label: "亚克力立牌", kw: "动漫 亚克力立牌", hot: false },
    ],
  },
  {
    name: "玩具/儿童",
    icon: "🧸",
    keywords: [
      { label: "盲盒玩具", kw: "盲盒 潮玩", hot: true },
      { label: "积木玩具", kw: "兼容乐高 积木 小颗粒", hot: true },
      { label: "毛绒玩具", kw: "毛绒玩具 公仔 批发", hot: true },
      { label: "遥控车", kw: "遥控车 儿童玩具", hot: false },
      { label: "芭比娃娃", kw: "换装娃娃 女孩玩具", hot: true },
      { label: "磁力片", kw: "磁力片 儿童益智玩具", hot: false },
      { label: "抓机娃娃", kw: "抓机公仔 可爱玩偶 批发", hot: true },
      { label: "气泡球玩具", kw: "pop it 解压玩具", hot: false },
    ],
  },
  {
    name: "生活用品",
    icon: "🏠",
    keywords: [
      { label: "硅藻泥吸水垫", kw: "硅藻泥 速干地垫", hot: true },
      { label: "折叠收纳箱", kw: "折叠收纳箱 家用", hot: true },
      { label: "保温杯", kw: "316不锈钢 保温杯", hot: true },
      { label: "硅胶厨具套装", kw: "硅胶 锅铲 厨具套装", hot: false },
      { label: "磁吸手机支架", kw: "磁吸 手机车载支架", hot: true },
      { label: "卡片收纳册", kw: "卡册 收藏册 活页", hot: true },
      { label: "LED小夜灯", kw: "LED 小夜灯 氛围灯", hot: false },
      { label: "无线充电器", kw: "三合一 无线充电器", hot: true },
      { label: "宠物玩具", kw: "猫咪玩具 宠物用品", hot: false },
      { label: "美妆工具", kw: "化妆刷套装 美妆蛋", hot: true },
    ],
  },
  {
    name: "潮流饰品",
    icon: "💎",
    keywords: [
      { label: "ins风项链", kw: "ins风 不锈钢项链 女", hot: true },
      { label: "珍珠发夹", kw: "珍珠 发夹 头饰 批发", hot: true },
      { label: "手工戒指", kw: "ins风戒指 小众设计", hot: false },
      { label: "手链套装", kw: "编织手链 波西米亚", hot: false },
      { label: "耳环套装", kw: "耳环套装 耳钉 批发", hot: true },
    ],
  },
  {
    name: "文创/办公",
    icon: "✏️",
    keywords: [
      { label: "卡通贴纸", kw: "防水贴纸 手账贴", hot: true },
      { label: "手账本", kw: "手账本 日记本 可爱", hot: false },
      { label: "荧光笔套装", kw: "莫兰迪 荧光笔 文具套装", hot: true },
      { label: "桌面收纳", kw: "桌面收纳盒 文具整理", hot: false },
      { label: "卡通钥匙扣", kw: "动漫 钥匙扣 挂件 批发", hot: true },
    ],
  },
];

const SORT_OPTIONS = [
  { label: "月销量最高", value: "monthSold", param: "sortField=monthSold&sortType=desc" },
  { label: "好评最多", value: "score", param: "sortField=qualityScore&sortType=desc" },
  { label: "价格最低", value: "price", param: "sortField=price&sortType=asc" },
];

export function PickerPage() {
  const [sort, setSort] = useState(SORT_OPTIONS[0]);
  const [search, setSearch] = useState("");

  const open1688 = (kw: string) => {
    const encoded = encodeURIComponent(kw);
    // 用1688标准搜索URL
    const url = `https://www.1688.com/chanpin/${encoded}.html?sortType=${sort.value === "monthSold" ? "ga_desc" : sort.value === "price" ? "price_asc" : "credit_desc"}`;
    window.open(url, "_blank");
  };

  const filteredCategories = CATEGORIES.map((cat) => ({
    ...cat,
    keywords: cat.keywords.filter(
      (k) => !search || k.label.includes(search) || k.kw.includes(search)
    ),
  })).filter((cat) => cat.keywords.length > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="text-blue-600" size={20} />
          <h2 className="text-lg font-bold text-gray-900">热销选品参考</h2>
        </div>
        <p className="text-sm text-gray-500">点击关键词自动在 1688 打开月销量排行，再用插件一键导入</p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search size={15} className="text-gray-400" />
          <input
            type="text"
            placeholder="搜索关键词..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none"
          />
        </div>
        <div className="flex gap-2">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sort.value === s.value
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {filteredCategories.map((cat) => (
          <div key={cat.name}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{cat.icon}</span>
              <h3 className="font-semibold text-gray-800">{cat.name}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {cat.keywords.map((item) => (
                <button
                  key={item.kw}
                  onClick={() => open1688(item.kw)}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm hover:border-blue-400 hover:bg-blue-50 transition-all group text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.hot && (
                      <span className="text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded font-medium flex-shrink-0">热</span>
                    )}
                    <span className="text-gray-700 truncate">{item.label}</span>
                  </div>
                  <ExternalLink size={13} className="text-gray-300 group-hover:text-blue-500 flex-shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm font-medium text-blue-800 mb-2">💡 使用技巧</p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 点击任意关键词 → 自动按月销量排序打开 1688 搜索结果</li>
          <li>• 找到好产品后点浏览器插件图标 → 一键导入到选品列表</li>
          <li>• 建议优先选「热」标签的品类，俄罗斯市场验证过的热销类目</li>
          <li>• 筛选时注意选跨境可发的商品（避免液体、电池等限制品）</li>
        </ul>
      </div>
    </div>
  );
}
