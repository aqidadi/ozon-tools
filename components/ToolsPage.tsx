"use client";
import { ExternalLink } from "lucide-react";

const CATEGORIES = [
  { emoji: "📚", title: "学习平台", tools: [
    { name: "AMZ123", desc: "东南亚卖家导航，整合常用工具", url: "https://www.amz123.com" },
    { name: "雨果网", desc: "跨境综合资讯平台", url: "https://www.cifnews.com" },
    { name: "Shopee大学", desc: "Shopee官方免费课程", url: "https://sellercenter.shopee.cn" },
    { name: "卖家精灵", desc: "亚马逊选品、关键词优化", url: "https://www.sellersprite.com" },
  ]},
  { emoji: "🌐", title: "翻译工具", tools: [
    { name: "DeepL", desc: "效果最自然的翻译工具", url: "https://www.deepl.com" },
    { name: "沉浸式翻译", desc: "网页翻译插件，原译文对照", url: "https://immersivetranslate.com" },
    { name: "Google翻译", desc: "支持100+语言在线翻译", url: "https://translate.google.com" },
    { name: "百度翻译", desc: "国内可用，多语言支持", url: "https://fanyi.baidu.com" },
  ]},
  { emoji: "📊", title: "数据分析", tools: [
    { name: "知虾", desc: "Shopee/Lazada电商数据平台", url: "https://www.zhi-xia.com" },
    { name: "EchoTik", desc: "TikTok Shop销量/KOL排名", url: "https://echotik.live" },
    { name: "Jungle Scout", desc: "亚马逊选品数据工具", url: "https://www.junglescout.com" },
    { name: "飞瓜数据", desc: "抖音/快手电商数据分析", url: "https://www.feigua.io" },
  ]},
  { emoji: "🎨", title: "图片工具", tools: [
    { name: "Removebg", desc: "一键抠图，替换背景", url: "https://www.remove.bg" },
    { name: "创客贴", desc: "在线设计产品海报主图", url: "https://www.chuangkit.com" },
    { name: "Pixabay", desc: "百万张免费商用图片", url: "https://pixabay.com" },
    { name: "TinyPNG", desc: "图片压缩，减小文件体积", url: "https://tinypng.com" },
  ]},
  { emoji: "⚙️", title: "ERP工具", tools: [
    { name: "店小秘", desc: "产品刊登/打单发货/数据采集", url: "https://www.dianxiaomi.com" },
    { name: "妙手ERP", desc: "Shopee/Lazada主流ERP", url: "https://www.miaoshousoft.com" },
    { name: "通途Ton", desc: "订单/发货/仓库一站式管理", url: "https://www.tongtool.com" },
    { name: "领星ERP", desc: "亚马逊卖家专属ERP系统", url: "https://www.lingxing.com" },
  ]},
  { emoji: "🚢", title: "物流海关", tools: [
    { name: "ImportYeti", desc: "美国进口提单数据查询", url: "https://www.importyeti.com" },
    { name: "Trade Map", desc: "国际贸易地图，ITC出品免费", url: "https://www.trademap.org" },
    { name: "易仓物流", desc: "跨境物流整合平台", url: "https://www.eccang.com" },
    { name: "运通天下", desc: "小包/专线/海运报价查询", url: "https://www.transrush.com" },
  ]},
];

export function ToolsPage() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🧰</span>
        <div>
          <h2 className="text-base font-bold text-gray-800">工具导航</h2>
          <p className="text-xs text-gray-400">跨境电商常用工具，点击直达</p>
        </div>
      </div>
      {CATEGORIES.map(cat => (
        <div key={cat.title} className="border border-gray-100 rounded-xl overflow-hidden bg-white">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
            <span>{cat.emoji}</span>
            <span className="text-sm font-semibold text-gray-800">{cat.title}</span>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{cat.tools.length}</span>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            {cat.tools.map(tool => (
              <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer"
                className="flex items-start justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 group">
                <div>
                  <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-600">{tool.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{tool.desc}</p>
                </div>
                <ExternalLink size={11} className="flex-shrink-0 mt-0.5 ml-1 text-gray-300 group-hover:text-blue-400" />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
