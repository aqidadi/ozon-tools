"use client";
import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { AdBanner } from "@/components/AdBanner";

const TOOL_CATEGORIES = [
  { id: "learn", emoji: "📚", title: "学习平台", color: "blue", tools: [
    { name: "AMZ123", desc: "东南亚卖家导航，整合卖家常用工具", url: "https://www.amz123.com" },
    { name: "雨果网", desc: "跨境综合资讯平台", url: "https://www.cifnews.com" },
    { name: "Shopee大学", desc: "Shopee官方免费课程", url: "https://sellercenter.shopee.cn" },
  ]},
  { id: "translate", emoji: "🌐", title: "翻译工具", color: "green", tools: [
    { name: "DeepL", desc: "效果最自然的翻译工具", url: "https://www.deepl.com" },
    { name: "沉浸式翻译", desc: "网页翻译插件，原译文对照", url: "https://immersivetranslate.com" },
    { name: "Google翻译", desc: "支持28种语言在线翻译", url: "https://translate.google.com" },
  ]},
  { id: "data", emoji: "📊", title: "数据分析", color: "purple", tools: [
    { name: "卖家精灵", desc: "亚马逊选品、市场分析、关键词优化", url: "https://www.sellersprite.com" },
    { name: "知虾", desc: "Shopee/Lazada电商数据平台", url: "https://www.zhi-xia.com" },
    { name: "EchoTik", desc: "TikTok Shop数据，看销量/KOL排名", url: "https://echotik.live" },
  ]},
  { id: "image", emoji: "🎨", title: "图片工具", color: "orange", tools: [
    { name: "Removebg", desc: "一键抠图，替换背景", url: "https://www.remove.bg" },
    { name: "创客贴", desc: "在线设计产品海报主图", url: "https://www.chuangkit.com" },
    { name: "Pixabay", desc: "百万张免费商用图片", url: "https://pixabay.com" },
  ]},
  { id: "erp", emoji: "⚙️", title: "ERP工具", color: "red", tools: [
    { name: "店小秘", desc: "产品刊登/打单发货/数据采集", url: "https://www.dianxiaomi.com" },
    { name: "妙手ERP", desc: "Shopee/Lazada主流ERP", url: "https://www.miaoshousoft.com" },
    { name: "通途Ton", desc: "订单/发货/仓库一站式管理", url: "https://www.tongtool.com" },
  ]},
  { id: "customs", emoji: "🚢", title: "物流海关", color: "indigo", tools: [
    { name: "ImportYeti", desc: "美国进口提单数据查询，免费", url: "https://www.importyeti.com" },
    { name: "Trade Map", desc: "国际贸易地图，ITC出品免费", url: "https://www.trademap.org" },
    { name: "Bitly", desc: "短链生成，分享商品链接用", url: "https://bitly.com" },
  ]},
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 border-blue-100 text-blue-700",
  green: "bg-green-50 border-green-100 text-green-700",
  purple: "bg-purple-50 border-purple-100 text-purple-700",
  orange: "bg-orange-50 border-orange-100 text-orange-700",
  red: "bg-red-50 border-red-100 text-red-700",
  gray: "bg-gray-50 border-gray-200 text-gray-700",
  indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
};

export function ToolsPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🧰</span>
        <div>
          <h2 className="text-base font-bold text-gray-800">工具导航</h2>
          <p className="text-xs text-gray-400">跨境电商必备工具，点击直达</p>
        </div>
      </div>
      {TOOL_CATEGORIES.map(cat => {
        const isOpen = openId === cat.id;
        const cls = colorMap[cat.color] ?? colorMap.gray;
        return (
          <div key={cat.id} className="border border-gray-100 rounded-xl overflow-hidden">
            <button onClick={() => setOpenId(isOpen ? null : cat.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <span>{cat.emoji}</span>
                <span className="text-sm font-semibold text-gray-800">{cat.title}</span>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{cat.tools.length}</span>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div className="px-4 pb-3 space-y-2">
                {cat.tools.map(tool => (
                  <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center justify-between p-2.5 rounded-lg border ${cls} hover:opacity-80`}>
                    <div>
                      <p className="text-xs font-semibold">{tool.name}</p>
                      <p className="text-[11px] opacity-70">{tool.desc}</p>
                    </div>
                    <ExternalLink size={11} className="flex-shrink-0 ml-2 opacity-50" />
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <AdBanner slot="tools-bottom" size="banner" />
    </div>
  );
}
