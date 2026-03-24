"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SettingsPanel } from "@/components/SettingsPanel";
import { AddProductModal } from "@/components/AddProductModal";
import { PickerPage } from "@/components/PickerPage";
import { GuidePage, ToolsPage } from "@/components/GuidePage";
import { HotPage } from "@/components/HotPage";
import { UrlImportBox } from "@/components/UrlImportBox";
import { UserBar } from "@/components/UserBar";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/lib/auth-context";
import { exportToExcel } from "@/lib/export";
import { Product, Settings, LANGUAGES, PLATFORMS, getPlatform } from "@/lib/types";
import {
  ShoppingBag, Settings2, Download, Plus, TrendingUp,
  BookOpen, Languages, Bell, BarChart2, Package, Globe, Zap, Shield, Flame
} from "lucide-react";

const DEFAULT_SETTINGS: Settings = {
  platformCode: "RUB",
  exchangeRate: 12.5,
  shippingRatePerGram: 0.025,
  platformFeeRate: 0.15,
  packagingCost: 2,
};

type Tab = "landing" | "products" | "hot" | "picker" | "guide" | "tools" | "monitor" | "analytics" | "settings";

const NAV_ITEMS = [
  { id: "landing",   label: "首页",     icon: Globe,      color: "blue" },
  { id: "products",  label: "选品列表", icon: Package,    color: "blue" },
  { id: "hot",       label: "爆品榜单", icon: Flame,      color: "red" },
  { id: "picker",    label: "选品参考", icon: TrendingUp, color: "orange" },
  { id: "guide",     label: "新手指南", icon: BookOpen,   color: "indigo" },
  { id: "tools",     label: "工具导航", icon: Zap,        color: "green" },
  { id: "monitor",   label: "价格监控", icon: Bell,       color: "yellow", badge: "即将上线" },
  { id: "analytics", label: "竞品分析", icon: BarChart2,  color: "pink",   badge: "即将上线" },
  { id: "settings",  label: "参数设置", icon: Settings2,  color: "gray" },
] as { id: Tab; label: string; icon: React.ElementType; color: string; badge?: string }[];

const COLOR_CLASSES: Record<string, { active: string; icon: string }> = {
  blue:   { active: "bg-blue-50 text-blue-700 border-l-2 border-blue-600",   icon: "text-blue-500" },
  orange: { active: "bg-orange-50 text-orange-700 border-l-2 border-orange-500", icon: "text-orange-500" },
  indigo: { active: "bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600", icon: "text-indigo-500" },
  yellow: { active: "bg-yellow-50 text-yellow-700 border-l-2 border-yellow-500", icon: "text-yellow-500" },
  pink:   { active: "bg-pink-50 text-pink-700 border-l-2 border-pink-500",   icon: "text-pink-500" },
  gray:   { active: "bg-gray-100 text-gray-800 border-l-2 border-gray-500",  icon: "text-gray-500" },
  red:    { active: "bg-red-50 text-red-700 border-l-2 border-red-500",      icon: "text-red-500" },
  green:  { active: "bg-green-50 text-green-700 border-l-2 border-green-600", icon: "text-green-500" },
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
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">Crossly</p>
              <p className="text-xs text-gray-400">跨境卖家工具箱</p>
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
            const colors = COLOR_CLASSES[item.color];
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id as Tab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? colors.active : "text-gray-600 hover:bg-gray-50 border-l-2 border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={isActive ? "" : "text-gray-400"} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{item.badge}</span>
                ) : item.id === "products" && products.length > 0 ? (
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">{products.length}</span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-gray-100 space-y-2">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download size={15} className="text-gray-400" />
            导出 Excel
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} />
            添加商品
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-56">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {NAV_ITEMS.find((n) => n.id === tab)?.label}
            </h2>
            {tab === "products" && (
              <p className="text-xs text-gray-400">共 {products.length} 个商品，{untranslatedCount} 个待翻译</p>
            )}
          </div>
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
                    免费注册即可导入最多50个商品，升级 Pro 后无限导入
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
              {/* URL导入框 */}
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
  const features = [
    { icon: <Zap size={22} className="text-blue-500" />, title: "1688一键导入", desc: "粘贴链接秒抓商品信息，无需安装插件" },
    { icon: <Globe size={22} className="text-green-500" />, title: "8国语言翻译", desc: "俄/英/泰/越/印尼/马来/西/阿拉伯一键翻译" },
    { icon: <Package size={22} className="text-purple-500" />, title: "利润自动计算", desc: "运费+佣金+汇率，一目了然算清楚每件利润" },
    { icon: <Shield size={22} className="text-orange-500" />, title: "导出上架模板", desc: "一键导出Ozon上架Excel，省去繁琐填表工作" },
    { icon: <TrendingUp size={22} className="text-pink-500" />, title: "热门选品参考", desc: "按类目整理1688热销关键词，快速找到货源" },
    { icon: <BookOpen size={22} className="text-indigo-500" />, title: "新手完整指南", desc: "从注册到运营，7大模块系统学习Ozon跨境" },
  ];

  const platforms = ["🛒 Ozon", "📦 亚马逊", "🎵 TikTok Shop", "🛍️ Lazada", "🌟 Shopee", "⚡ 速卖通"];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          🚀 专为跨境卖家打造
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          跨境选品，<span className="text-blue-600">从未如此简单</span>
        </h1>
        <p className="text-lg text-gray-500 mb-2 max-w-xl mx-auto">
          1688 找货 → 多语言翻译 → 利润计算 → 导出上架，全流程一站搞定
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {platforms.map((p) => (
            <span key={p} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{p}</span>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onStart}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            立即开始使用 →
          </button>
          <span className="text-sm text-gray-400">免费，无需注册</span>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {features.map((f) => (
          <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="mb-3">{f.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-8 mb-8">
        <h2 className="text-lg font-bold text-gray-900 text-center mb-6">3步完成选品流程</h2>
        <div className="flex items-start gap-4">
          {[
            { step: "01", title: "找货源", desc: "在1688找到心仪商品，复制链接粘贴到这里，一键抓取商品信息" },
            { step: "02", title: "算利润", desc: "填入重量，设置汇率/运费/佣金参数，自动计算最低售价和利润" },
            { step: "03", title: "导出上架", desc: "一键导出Ozon上架Excel模板，翻译好标题直接上传到Ozon卖家后台" },
          ].map((s, i) => (
            <div key={s.step} className="flex-1 text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">{s.step}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-xs text-gray-500">{s.desc}</p>
              {i < 2 && <div className="absolute text-gray-300 text-2xl">→</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onStart}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          开始选品 →
        </button>
      </div>
    </div>
  );
}
