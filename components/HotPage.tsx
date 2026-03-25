"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Copy, Check, ExternalLink, RefreshCw } from "lucide-react";
import { AdBanner } from "@/components/AdBanner";

interface WeeklyItem {
  rank: number; name: string; category: string;
  trend: "up" | "down" | "stable"; growth: string; reason: string;
}
interface MonthlyItem {
  rank: number; name: string; category: string;
  sales: string; avgPrice: string; tip: string;
}
interface TrendingKw {
  kw: string; platform: string; hot: number;
}

export function HotPage() {
  const [data, setData] = useState<{ weekly: WeeklyItem[]; monthly: MonthlyItem[]; trending: TrendingKw[]; updatedAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"weekly" | "monthly" | "trending">("weekly");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hot").then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const search1688 = (kw: string) => {
    window.open(`https://search.1688.com/search/product.do?SearchText=${encodeURIComponent(kw)}&sortType=6`, "_blank");
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-gray-400">
      <RefreshCw size={20} className="animate-spin mr-2" />加载中...
    </div>
  );

  const tabs = [
    { id: "weekly", label: "🔥 本周爆品", desc: "近7天热销趋势" },
    { id: "monthly", label: "📊 本月榜单", desc: "月度畅销品类" },
    { id: "trending", label: "⚡ 热搜词", desc: "各平台热门关键词" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">爆品榜单</h2>
          <p className="text-sm text-gray-500 mt-0.5">热销趋势分析 · 找到下一个爆款</p>
        </div>
        <span className="text-xs text-gray-400 mt-1">
          数据更新：{data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString("zh-CN") : "-"}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors text-center ${
              tab === t.id ? "bg-blue-600 text-white shadow" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            {t.label}
            <div className="text-[10px] font-normal opacity-70">{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Weekly */}
      {tab === "weekly" && (
        <div className="space-y-2">
          {data?.weekly.map(item => (
            <div key={item.rank} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
              {/* Rank */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                item.rank <= 3 ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {item.rank}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{item.category}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{item.reason}</p>
              </div>
              {/* Trend */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className={`text-sm font-bold ${
                  item.trend === "up" ? "text-green-600" : item.trend === "down" ? "text-red-500" : "text-gray-500"
                }`}>
                  {item.growth}
                </span>
                {item.trend === "up" ? <TrendingUp size={14} className="text-green-500" /> :
                 item.trend === "down" ? <TrendingDown size={14} className="text-red-400" /> :
                 <Minus size={14} className="text-gray-400" />}
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => copy(item.name)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="复制关键词">
                  {copied === item.name ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
                <button onClick={() => search1688(item.name)}
                  className="text-xs px-2.5 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  搜1688
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Monthly */}
      {tab === "monthly" && (
        <div className="space-y-2">
          {data?.monthly.map(item => (
            <div key={item.rank} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  item.rank <= 3 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                }`}>{item.rank}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <span className="text-xs text-blue-600 font-medium">{item.sales}</span>
                    <span className="text-xs text-gray-400">均价 {item.avgPrice}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => copy(item.name)} className="p-1.5 text-gray-400 hover:text-blue-600">
                    {copied === item.name ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                  <button onClick={() => search1688(item.name)}
                    className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    搜1688
                  </button>
                </div>
              </div>
              <div className="ml-10 mt-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5">
                💡 {item.tip}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trending keywords */}
      {tab === "trending" && (
        <div className="space-y-2">
          {data?.trending.map((item, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{item.kw}</p>
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{item.platform}</span>
                </div>
                {/* Heat bar */}
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                      style={{ width: `${item.hot}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-8">{item.hot}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => copy(item.kw)} className="p-1.5 text-gray-400 hover:text-blue-600">
                  {copied === item.kw ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
                <button onClick={() => search1688(item.kw)}
                  className="text-xs px-2.5 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                  搜1688
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500">
        📌 数据来源：综合1688热销榜、Ozon平台趋势、跨境卖家社群等公开渠道，每周更新。
        点击「搜1688」可直接搜索货源。
      </div>
      <AdBanner slot="hot-bottom" size="banner" className="mt-4" />
    </div>
  );
}
