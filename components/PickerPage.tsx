"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, Search, TrendingUp, Flame } from "lucide-react";

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
      { label: "棉花娃娃", kw: "动漫 棉花娃娃 八寸", hot: true },
      { label: "亚克力立牌", kw: "动漫 亚克力立牌", hot: false },
      { label: "手办盲盒", kw: "动漫手办 盲盒", hot: true },
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
      { label: "泡泡解压玩具", kw: "pop it 解压玩具", hot: false },
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
      { label: "LED小夜灯", kw: "LED 小夜灯 氛围灯", hot: false },
      { label: "无线充电器", kw: "三合一 无线充电器", hot: true },
      { label: "宠物玩具", kw: "猫咪玩具 宠物用品", hot: false },
    ],
  },
  {
    name: "潮流饰品",
    icon: "💎",
    keywords: [
      { label: "ins风项链", kw: "ins风 不锈钢项链 女", hot: true },
      { label: "珍珠发夹", kw: "珍珠 发夹 头饰 批发", hot: true },
      { label: "手链套装", kw: "编织手链 波西米亚", hot: false },
      { label: "耳环套装", kw: "耳环套装 耳钉 批发", hot: true },
      { label: "卡通钥匙扣", kw: "动漫 钥匙扣 挂件 批发", hot: true },
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
    ],
  },
];

export function PickerPage() {
  const [search, setSearch] = useState("");
  const [copiedKw, setCopiedKw] = useState("");
  const [activeKw, setActiveKw] = useState("");

  const copyKw = (kw: string) => {
    navigator.clipboard.writeText(kw).catch(() => {});
    setCopiedKw(kw);
    setActiveKw(kw);
    setTimeout(() => setCopiedKw(""), 2000);
  };

  const searchOn1688 = (kw: string) => {
    window.open(`https://s.1688.com/selloffer/offer_search.html?keywords=${encodeURIComponent(kw)}&sortType=6`, "_blank");
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
        <p className="text-sm text-gray-500">点「复制」→ 去 1688 粘贴搜索；点「搜索」→ 直接打开 1688 结果页</p>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 mb-6">
        <Search size={15} className="text-gray-400" />
        <input
          type="text"
          placeholder="搜索关键词..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm outline-none"
        />
      </div>

      {/* 当前选中的关键词提示 */}
      {activeKw && (
        <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <Check size={16} className="text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800">已复制：<span className="font-bold">{activeKw}</span></p>
            <p className="text-xs text-green-600 mt-0.5">打开 1688 后直接 Ctrl+V 粘贴到搜索框即可</p>
          </div>
          <button
            onClick={() => searchOn1688(activeKw)}
            className="flex items-center gap-1.5 bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors flex-shrink-0"
          >
            <ExternalLink size={12} />
            去1688搜索
          </button>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-6">
        {filteredCategories.map((cat) => (
          <div key={cat.name}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{cat.icon}</span>
              <h3 className="font-semibold text-gray-800">{cat.name}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {cat.keywords.map((item) => (
                <div
                  key={item.kw}
                  className={`flex items-center justify-between bg-white border rounded-xl px-3 py-2.5 transition-all ${
                    copiedKw === item.kw ? "border-green-400 bg-green-50" : "border-gray-200"
                  }`}
                >
                  {/* 关键词名称 */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {item.hot && (
                      <span className="flex items-center gap-0.5 text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                        <Flame size={10} />热
                      </span>
                    )}
                    <span className="text-sm text-gray-800 truncate">{item.label}</span>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {/* 复制按钮 */}
                    <button
                      onClick={() => copyKw(item.kw)}
                      title="复制关键词"
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                        copiedKw === item.kw
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600"
                      }`}
                    >
                      {copiedKw === item.kw ? <Check size={11} /> : <Copy size={11} />}
                      {copiedKw === item.kw ? "已复制" : "复制"}
                    </button>
                    {/* 搜索按钮 */}
                    <button
                      onClick={() => searchOn1688(item.kw)}
                      title="在1688搜索"
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                    >
                      <ExternalLink size={11} />
                      搜索
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm font-medium text-blue-800 mb-2">💡 使用技巧</p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>复制</strong> → 去已登录的 1688 粘贴搜索，结果最准确</li>
          <li>• <strong>搜索</strong> → 直接跳转，若搜索框显示旧词请手动粘贴</li>
          <li>• 找到好产品后点浏览器插件 → 一键导入选品列表</li>
          <li>• 优先选「🔥热」标签，Ozon 市场验证过的热销类目</li>
        </ul>
      </div>
    </div>
  );
}
