"use client";
import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { AdBanner } from "@/components/AdBanner";

const TOOL_CATEGORIES = [
  { id: "learn", emoji: "📚", title: "学习平台", color: "blue", tools: [
    { name: "AMZ123", desc: "东南亚卖家导航，整合卖家常用网站工具", url: "https://www.amz123.com" },
    { name: "雨果网", desc: "跨境综合资讯平台，集热门跨境平台资讯", url: "https://www.cifnews.com" },
    { name: "Shopee大学", desc: "Shopee官方学习平台，指引新手运营", url: "https://sellercenter.shopee.cn" },
    { name: "Lazada大学", desc: "Lazada官方学习平台，免费运营课程", url: "https://university.lazada.com" },
    { name: "得果果课堂", desc: "东南亚跨境电商学习平台，很多卖家在用", url: "https://www.deiguoguo.com" },
  ]},
  { id: "translate", emoji: "🌐", title: "语言翻译", color: "green", tools: [
    { name: "DeepL", desc: "翻译效果最自然，目前最佳付费翻译软件", url: "https://www.deepl.com", stars: 5 },
    { name: "微软翻译", desc: "支持多国语言文字/图片/截图翻译", url: "https://www.bing.com/translator", stars: 3 },
    { name: "有道翻译", desc: "基于搜索引擎，全文翻译、网页翻译", url: "https://fanyi.youdao.com", stars: 3 },
    { name: "沉浸式翻译", desc: "网页翻译插件，原译文对照，支持PDF/视频字幕", url: "https://immersivetranslate.com", stars: 5 },
    { name: "Google翻译", desc: "跨境卖家常用，在线翻译28门语言", url: "https://translate.google.com", stars: 4 },
  ]},
  { id: "data", emoji: "📊", title: "数据分析", color: "purple", tools: [
    { name: "知虾", desc: "Shopee/Lazada东南亚电商数据平台，监控竞店查关键词", url: "https://www.zhi-xia.com", stars: 4 },
    { name: "卖家精灵", desc: "亚马逊选品、市场分析、关键词优化、产品监控", url: "https://www.sellersprite.com", stars: 5 },
    { name: "PPSPY", desc: "Shopify店铺分析，快速了解竞争对手畅销产品", url: "https://ppspy.com", stars: 3 },
    { name: "Similarweb", desc: "网站流量分析，查排名、流量来源、社交属性", url: "https://www.similarweb.com", stars: 4 },
    { name: "EchoTik", desc: "TikTok Shop数据工具，看周销/月销/店铺排名/KOL", url: "https://echotik.live", stars: 3 },
  ]},
  { id: "image", emoji: "🎨", title: "图库 & 做图", color: "orange", tools: [
    { name: "创客贴", desc: "模板轻松设计产品海报、主图，可制作简单视频", url: "https://www.chuangkit.com", stars: 4 },
    { name: "稿定设计", desc: "在线做不同场景尺寸的产品图", url: "https://www.gaoding.com", stars: 4 },
    { name: "Removebg", desc: "一键抠图，虚化或替换背景", url: "https://www.remove.bg", stars: 4 },
    { name: "waifu2x", desc: "商品图模糊？无损放大及降噪处理", url: "http://waifu2x.udp.jp", stars: 5 },
    { name: "Pixabay", desc: "百万张免费图片素材，CC0协议可商用", url: "https://pixabay.com", stars: 4 },
    { name: "Pexels", desc: "高质量免费图片，CC0许可，风格简约素材丰富", url: "https://www.pexels.com", stars: 4 },
  ]},
  { id: "erp", emoji: "⚙️", title: "ERP & 运营工具", color: "red", tools: [
    { name: "妙手ERP", desc: "Shopee/Lazada主流ERP，提供链接采集/全店采集/插件采集", url: "https://www.miaoshousoft.com", stars: 4 },
    { name: "店小秘", desc: "用户超10万，产品刊登/打单发货/数据采集/店铺搬家", url: "https://www.dianxiaomi.com", stars: 5 },
    { name: "通途Ton", desc: "采购/订单/发货/仓库/售后一站式智能自动化管理", url: "https://www.tongtool.com", stars: 3 },
  ]},
  { id: "file", emoji: "🔧", title: "效率工具", color: "gray", tools: [
    { name: "Filemail", desc: "大文件传输，直接发到email通过链接下载", url: "https://www.filemail.com" },
    { name: "Removebg", desc: "一键抠图神器", url: "https://www.remove.bg" },
    { name: "Bitly", desc: "短链生成平台", url: "https://bitly.com" },
    { name: "Namecheap", desc: "域名注册服务商，价格便宜", url: "https://www.namecheap.com" },
  ]},
  { id: "customs", emoji: "🚢", title: "海关数据", color: "indigo", tools: [
    { name: "ImportGenius", desc: "全球进出口数据查询平台", url: "https://www.importgenius.com" },
    { name: "ImportYeti", desc: "美国进口提单数据查询，免费", url: "https://www.importyeti.com" },
    { name: "Trade Map", desc: "国际贸易地图，ITC出品免费", url: "https://www.trademap.org" },
    { name: "UN Comtrade", desc: "联合国商品贸易统计数据库", url: "https://comtradeplus.un.org" },
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
  teal: "bg-teal-50 border-teal-100 text-teal-700",
};

export function ToolsPage() {
  const [openId, setOpenId] = useState<string | null>("learn");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🧰</span>
        <div>
          <h2 className="text-base font-bold text-gray-800">工具导航</h2>
          <p className="text-xs text-gray-400">跨境电商必备工具整理，点击直达</p>
        </div>
      </div>
      {TOOL_CATEGORIES.map(cat => {
        const isOpen = openId === cat.id;
        const colorCls = colorMap[cat.color] || colorMap.gray;
        return (
          <div key={cat.id} className="border border-gray-100 rounded-xl overflow-hidden">
            <button onClick={() => setOpenId(isOpen ? null : cat.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat.emoji}</span>
                <span className="text-sm font-semibold text-gray-800">{cat.title}</span>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{cat.tools.length}个工具</span>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div className="px-4 pb-3 space-y-2">
                {cat.tools.map(tool => (
                  <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer"
                    className={`flex items-start justify-between p-2.5 rounded-lg border ${colorCls} hover:opacity-80 transition-opacity`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold">{tool.name}</span>
                        {(tool as {stars?:number}).stars && (
                          <span className="text-yellow-400 text-[10px]">{"★".repeat((tool as {stars?:number}).stars!)}</span>
                        )}
                      </div>
                      <p className="text-[11px] opacity-75 mt-0.5 leading-tight">{tool.desc}</p>
                    </div>
                    <ExternalLink size={11} className="flex-shrink-0 mt-0.5 ml-2 opacity-50" />
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
