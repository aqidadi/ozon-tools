"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SettingsPanel } from "@/components/SettingsPanel";
import { AddProductModal } from "@/components/AddProductModal";
import { PickerPage } from "@/components/PickerPage";
import { GuidePage } from "@/components/GuidePage";
import { ToolsPage } from "@/components/ToolsPage";
import { ClockPage } from "@/components/ClockPage";
import { MiniToolsPage } from "@/components/MiniToolsPage";
import { AdBanner } from "@/components/AdBanner";
import { HotPage } from "@/components/HotPage";
import { UrlImportBox } from "@/components/UrlImportBox";
import { YiwugoSearch } from "@/components/YiwugoSearch";
import { UserBar } from "@/components/UserBar";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/lib/auth-context";
import { exportToExcel } from "@/lib/export";
import { Product, Settings, LANGUAGES, PLATFORMS, getPlatform } from "@/lib/types";
import {
  ShoppingBag, Settings2, Download, Plus, TrendingUp,
  BookOpen, Languages, Bell, BarChart2, Package, Globe, Zap, Shield, Flame, Clock, Wrench
} from "lucide-react";

// ── 实时汇率挂件 hook ──────────────────────────────────
function useRateBar() {
  const [rates, setRates] = useState<{RUB:number;USD:number;THB:number} | null>(null);
  useEffect(() => {
    fetch("/api/rates").then(r=>r.json()).then(d=>{
      if (d.rates) setRates({ RUB: d.rates.RUB??12.5, USD: d.rates.USD??7.2, THB: d.rates.THB??0.2 });
    }).catch(()=>{});
  }, []);
  return rates;
}

// ── 实时汇率挂件 ──────────────────────────────────────
function RateBar() {
  const [rates, setRates] = useState<Record<string,number>>({});
  const [time, setTime] = useState("");
  useEffect(() => {
    fetch("/api/rates").then(r=>r.json()).then(d=>{
      if (d.rates) setRates(d.rates);
    }).catch(()=>{});
    const tick = () => setTime(new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"}));
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, []);
  const pairs = [
    { code: "RUB", symbol: "₽", label: "卢布" },
    { code: "USD", symbol: "$", label: "美元" },
    { code: "THB", symbol: "฿", label: "泰铢" },
  ];
  if (!rates.RUB) return null;
  return (
    <div className="flex items-center gap-3">
      {pairs.map(p => (
        <div key={p.code} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
          <span className="text-xs text-gray-400">{p.label}</span>
          <span className="text-xs font-semibold text-gray-800">{p.symbol}{rates[p.code] ? (1/rates[p.code]).toFixed(4) : "--"}</span>
          <span className="text-[10px] text-gray-300">¥</span>
        </div>
      ))}
      {time && <span className="text-[11px] text-gray-300">{time}更新</span>}
    </div>
  );
}

const DEFAULT_SETTINGS: Settings = {
  platformCode: "RUB",
  exchangeRate: 12.5,
  shippingRatePerGram: 0.025,
  platformFeeRate: 0.15,
  packagingCost: 2,
};

type Tab = "landing" | "products" | "hot" | "picker" | "guide" | "tools" | "mintools" | "clock" | "monitor" | "analytics" | "settings";

const NAV_ITEMS = [
  { id: "landing",   label: "首页",     icon: Globe,      color: "blue" },
  { id: "products",  label: "选品列表", icon: Package,    color: "blue" },
  { id: "hot",       label: "爆品榜单", icon: Flame,      color: "red" },
  { id: "picker",    label: "选品参考", icon: TrendingUp, color: "orange" },
  { id: "guide",     label: "新手指南", icon: BookOpen,   color: "indigo" },
  { id: "tools",     label: "工具导航", icon: Zap,        color: "green" },
  { id: "mintools",  label: "实用工具", icon: Wrench,     color: "teal" },
  { id: "clock",     label: "世界时间", icon: Clock,      color: "cyan" },
  { id: "monitor",   label: "价格监控", icon: Bell,       color: "yellow", badge: "即将上线" },
  { id: "analytics", label: "竞品分析", icon: BarChart2,  color: "pink",   badge: "即将上线" },
  { id: "settings",  label: "参数设置", icon: Settings2,  color: "gray" },
] as { id: Tab; label: string; icon: React.ElementType; color: string; badge?: string }[];

// 深色侧边栏下，所有激活态统一用白色高亮
const COLOR_CLASSES: Record<string, { active: string; icon: string }> = {
  blue:   { active: "bg-white/15 text-white",   icon: "text-white" },
  orange: { active: "bg-white/15 text-white",   icon: "text-white" },
  indigo: { active: "bg-white/15 text-white",   icon: "text-white" },
  yellow: { active: "bg-white/15 text-white",   icon: "text-white" },
  pink:   { active: "bg-white/15 text-white",   icon: "text-white" },
  gray:   { active: "bg-white/15 text-white",   icon: "text-white" },
  red:    { active: "bg-white/15 text-white",   icon: "text-white" },
  teal:   { active: "bg-white/15 text-white",   icon: "text-white" },
  cyan:   { active: "bg-white/15 text-white",   icon: "text-white" },
  purple: { active: "bg-white/15 text-white",   icon: "text-white" },
  green:  { active: "bg-white/15 text-white",   icon: "text-white" },
};

export default function Home() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("landing");
  const [translatingAll, setTranslatingAll] = useState(false);
  const [targetLang, setTargetLang] = useState("ru");

  const handleTranslateAll = useCallback(async () => {
    const untranslated = products.filter((p) => !p.titleRu);
    if (untranslated.length === 0) { alert("所有商品已翻译完成！"); return; }
    setTranslatingAll(true);
    for (const p of untranslated) {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: p.title, to: targetLang }),
        });
        const data = await res.json();
        if (data.result) {
          const updates = { titleRu: data.result, targetLang };
          setProducts((prev) => prev.map((item) => item.id === p.id ? { ...item, ...updates } : item));
          await fetch("/api/product-update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: p.id, ...updates }),
          });
        }
        await new Promise((r) => setTimeout(r, 500));
      } catch {}
    }
    setTranslatingAll(false);
  }, [products, targetLang]);

  const loadProducts = useCallback(async (isInitial = false) => {
    if (!accessToken) { setLoading(false); return; }
    try {
      const res = await fetch("/api/import", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.status === 401) { setLoading(false); return; }
      const data = await res.json();
      if (data.products) {
        setProducts((prev) => {
          if (isInitial || prev.length === 0) return data.products;
          const prevIds = new Set(prev.map((p: Product) => p.id));
          const newItems = data.products.filter((p: Product) => !prevIds.has(p.id));
          return newItems.length > 0 ? [...newItems, ...prev] : prev;
        });
      }
    } catch {} finally { setLoading(false); }
  }, [accessToken]);

  useEffect(() => {
    try {
      const s = localStorage.getItem("ozon-settings");
      if (s) setSettings(JSON.parse(s));
    } catch {}
    if (!authLoading) {
      loadProducts(true);
      if (accessToken) {
        const timer = setInterval(() => loadProducts(false), 5000);
        return () => clearInterval(timer);
      }
    }
  }, [loadProducts, authLoading, accessToken]);

  useEffect(() => {
    localStorage.setItem("ozon-settings", JSON.stringify(settings));
  }, [settings]);

  const handleAddProduct = useCallback((product: Product) => {
    setProducts((prev) => [product, ...prev]);
    setShowAddModal(false);
  }, []);

  const handleUpdateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const handleDeleteProduct = useCallback(async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await fetch("/api/import", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }, []);

  const handleExport = () => {
    if (products.length === 0) { alert("请先添加商品"); return; }
    exportToExcel(products, settings);
  };

  const untranslatedCount = products.filter((p) => !p.titleRu).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - 深色渐变 */}
      <aside className="w-56 flex flex-col fixed h-full z-20"
        style={{ background: "linear-gradient(180deg, #1e2d5a 0%, #2d1b69 50%, #1a1a2e 100%)" }}>
        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
              <ShoppingBag size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Crossly</p>
              <p className="text-[10px] text-white/50">跨境卖家工具箱</p>
            </div>
          </div>
          {/* 用户信息 */}
          <div className="mt-3">
            <UserBar />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = tab === item.id;
            const colors = COLOR_CLASSES[item.color] ?? COLOR_CLASSES.gray;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id as Tab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? colors.active : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={isActive ? "text-white" : "text-white/40"} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="text-[9px] bg-white/20 text-white/70 px-1.5 py-0.5 rounded-full">{item.badge}</span>
                ) : item.id === "products" && products.length > 0 ? (
                  <span className="text-[10px] bg-indigo-400/30 text-indigo-200 px-1.5 py-0.5 rounded-full font-semibold">{products.length}</span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Download size={15} className="text-white/40" />
            导出 Excel
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-white transition-all shadow-lg hover:shadow-xl"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
          >
            <Plus size={15} />
            添加商品
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-56">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur border-b border-gray-200/80 px-4 py-2.5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {NAV_ITEMS.find((n) => n.id === tab)?.label}
            </h2>
            {tab === "products" && (
              <p className="text-xs text-gray-400">共 {products.length} 个商品，{untranslatedCount} 个待翻译</p>
            )}
          </div>
          {/* 实时汇率挂件 */}
          <RateBar />
          {tab === "products" && products.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                ))}
              </select>
              <button
                onClick={handleTranslateAll}
                disabled={translatingAll || untranslatedCount === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Languages size={13} />
                {translatingAll ? "翻译中..." : `批量翻译 (${untranslatedCount})`}
              </button>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="p-6">
          {tab === "landing" && <LandingPage onStart={() => setTab("products")} />}
          {tab === "hot" && <HotPage />}
          {tab === "picker" && <PickerPage />}
          {tab === "guide" && <GuidePage />}
          {tab === "tools" && <ToolsPage />}
          {tab === "mintools" && <MiniToolsPage />}
          {tab === "clock" && <ClockPage />}
          {tab === "settings" && <SettingsPanel settings={settings} onChange={setSettings} />}
          {tab === "monitor" && (
            <ComingSoon title="价格监控" icon="🔔" desc="自动监控竞品价格变动，价格下跌时及时提醒，帮你抓住调价时机。" color="yellow" />
          )}
          {tab === "analytics" && (
            <ComingSoon title="竞品分析" icon="📊" desc="输入 Ozon 商品链接，查看月销量趋势、评价分析、关键词排名，知己知彼。" color="pink" />
          )}
          {tab === "products" && (
            <>
              {/* 未登录提示 */}
              {!user && !authLoading && (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">🔐</div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">登录后开始使用</h2>
                  <p className="text-gray-400 mb-6 text-sm max-w-sm mx-auto">
                    免费注册即可导入最多100个商品，升级 Pro 后无限导入
                  </p>
                  <button
                    onClick={() => setShowLoginPrompt(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    免费注册 / 登录
                  </button>
                  {showLoginPrompt && <AuthModal onClose={() => setShowLoginPrompt(false)} />}
                </div>
              )}

              {/* 已登录内容 */}
              {user && (
                <>
              {/* 义乌购货源搜索 */}
              <YiwugoSearch onImport={handleAddProduct} />
              {/* 1688 URL导入框（需插件，服务端被封） */}
              <UrlImportBox onImport={handleAddProduct} onBatchImport={(ps) => setProducts(prev => [...ps, ...prev])} />
              {/* Stats — compact bar */}
              {products.length > 0 && (
                <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-4 text-sm">
                  <span className="text-gray-500">共 <strong className="text-gray-900">{products.length}</strong> 个商品</span>
                  <span className="text-gray-200">|</span>
                  <span className="text-gray-500">{getPlatform(settings.platformCode).flag} {getPlatform(settings.platformCode).platform}</span>
                  <span className="text-gray-200">|</span>
                  <span className="text-gray-500">汇率 <strong className="text-gray-800">{settings.exchangeRate}</strong> {getPlatform(settings.platformCode).symbol}/元</span>
                  <span className="text-gray-200">|</span>
                  <span className="text-gray-500">运费 <strong className="text-gray-800">{settings.shippingRatePerGram}</strong> 元/克</span>
                  <span className="text-gray-200">|</span>
                  <span className="text-gray-500">佣金 <strong className="text-gray-800">{(settings.platformFeeRate * 100).toFixed(0)}%</strong></span>
                </div>
              )}

              {/* Product list */}
              {products.length === 0 ? (
                <div className="text-center py-24">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="text-blue-300" size={36} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">还没有商品</h2>
                  <p className="text-gray-400 mb-6 text-sm max-w-sm mx-auto">
                    点击「添加商品」手动录入，或安装 Chrome 插件从 1688 一键导入
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={18} />添加第一个商品
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      settings={settings}
                      onUpdate={handleUpdateProduct}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </div>
              )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {showAddModal && (
        <AddProductModal onAdd={handleAddProduct} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

function ComingSoon({ title, icon, desc, color }: { title: string; icon: string; desc: string; color: string }) {
  const colorMap: Record<string, string> = {
    yellow: "from-yellow-50 to-orange-50 border-yellow-200",
    pink: "from-pink-50 to-purple-50 border-pink-200",
  };
  return (
    <div className={`max-w-2xl mx-auto mt-16 text-center bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-12`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
      <p className="text-base text-gray-600 mb-8 max-w-md mx-auto">{desc}</p>
      <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-6 py-3 text-sm font-medium text-gray-600 shadow-sm">
        🚧 即将上线，敬请期待
      </div>
    </div>
  );
}

function LandingPage({ onStart }: { onStart: () => void }) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden p-8 text-center"
        style={{ background: "linear-gradient(135deg, #1e2d5a 0%, #2d1b69 60%, #0f172a 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%)" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-4 border border-white/20">
            🚀 专为跨境卖家打造 · 支持Ozon/Shopee/TikTok/亚马逊
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">
            1688 找货，一键导入<br />
            <span style={{ background: "linear-gradient(90deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              自动算利润，直接上架
            </span>
          </h1>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
            Chrome插件在1688商品页一键抓取主图+详情图+规格，秒算多平台利润，支持8国语言翻译
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={onStart}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              免费开始使用 →
            </button>
            <a href="https://www.crossly.cn/crossly-extension.zip?v=20260325"
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white/80 border border-white/20 hover:bg-white/10 transition-colors">
              下载插件
            </a>
          </div>
        </div>
      </div>

      {/* 核心卖点 3列 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { emoji: "🔌", title: "1688插件直抓", tag: "独家功能", tagColor: "bg-purple-100 text-purple-700",
            desc: "Chrome插件在1688商品页运行，抓取主图/详情图/规格/月销量，竞品没有这个功能" },
          { emoji: "💰", title: "多平台利润计算", tag: "一站搞定", tagColor: "bg-blue-100 text-blue-700",
            desc: "Ozon/Shopee/TikTok/亚马逊10个平台，自动换算汇率，扣完运费佣金看净利润" },
          { emoji: "🌍", title: "8国语言翻译", tag: "省时省力", tagColor: "bg-green-100 text-green-700",
            desc: "俄/英/泰/越/印尼/马来/阿拉伯，一键批量翻译标题，不用再手动逐个翻" },
        ].map(f => (
          <div key={f.title} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{f.emoji}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${f.tagColor}`}>{f.tag}</span>
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* 竞品对比表 */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-900 text-sm">为什么选 Crossly？</h2>
          <p className="text-xs text-gray-400 mt-0.5">和主流工具横向对比</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 font-medium">功能</th>
                <th className="px-4 py-3 text-center font-bold text-indigo-600">Crossly</th>
                <th className="px-4 py-3 text-center text-gray-400 font-medium">卖家精灵</th>
                <th className="px-4 py-3 text-center text-gray-400 font-medium">知虾</th>
                <th className="px-4 py-3 text-center text-gray-400 font-medium">店小秘</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                ["1688商品直接导入", true, false, false, false],
                ["多平台利润计算", true, false, false, true],
                ["8国语言翻译", true, false, false, false],
                ["主图+详情图全抓", true, false, false, false],
                ["价格（/月）", "¥9.9起", "¥299+", "¥199+", "¥99+"],
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-gray-700 font-medium">{row[0]}</td>
                  {[1,2,3,4].map(j => (
                    <td key={j} className="px-4 py-3 text-center">
                      {typeof row[j] === "boolean"
                        ? row[j] ? <span className="text-green-500 font-bold">✓</span> : <span className="text-gray-300">✗</span>
                        : <span className={j === 1 ? "font-bold text-indigo-600" : "text-gray-400"}>{row[j]}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 定价 */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="font-bold text-gray-900 text-sm mb-1 text-center">简单透明的定价</h2>
        <p className="text-xs text-gray-400 text-center mb-4">免费可用100个商品，升级无限制</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "月度", price: "¥9.9", sub: "推广价", color: "border-gray-200" },
            { label: "季度", price: "¥19.9", sub: "3个月", color: "border-indigo-300 bg-indigo-50", hot: true },
            { label: "年度", price: "¥69", sub: "365天", color: "border-gray-200" },
          ].map(p => (
            <div key={p.label} className={`border-2 rounded-xl p-3 text-center relative ${p.color}`}>
              {p.hot && <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">推荐</div>}
              <p className="text-[10px] text-gray-500 font-medium">{p.label}</p>
              <p className={`text-lg font-extrabold mt-1 ${p.hot ? "text-indigo-600" : "text-gray-900"}`}>{p.price}</p>
              <p className="text-[10px] text-gray-400">{p.sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button onClick={onStart}
            className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            免费注册，立即体验 →
          </button>
        </div>
      </div>

      <AdBanner slot="landing-bottom" size="banner" />
    </div>
  );
}

