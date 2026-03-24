"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SettingsPanel } from "@/components/SettingsPanel";
import { AddProductModal } from "@/components/AddProductModal";
import { PickerPage } from "@/components/PickerPage";
import { GuidePage } from "@/components/GuidePage";
import { exportToExcel } from "@/lib/export";
import { Product, Settings, LANGUAGES } from "@/lib/types";
import {
  ShoppingBag, Settings2, Download, Plus, TrendingUp,
  BookOpen, Languages, Bell, BarChart2, Package, ChevronRight
} from "lucide-react";

const DEFAULT_SETTINGS: Settings = {
  exchangeRate: 10,
  shippingRatePerGram: 0.025,
  platformFeeRate: 0.15,
  packagingCost: 2,
};

type Tab = "products" | "picker" | "guide" | "monitor" | "analytics" | "settings";

const NAV_ITEMS = [
  { id: "products", label: "选品列表", icon: Package, color: "blue" },
  { id: "picker", label: "选品参考", icon: TrendingUp, color: "orange" },
  { id: "guide", label: "新手指南", icon: BookOpen, color: "indigo" },
  { id: "monitor", label: "价格监控", icon: Bell, color: "yellow", badge: "即将上线" },
  { id: "analytics", label: "竞品分析", icon: BarChart2, color: "pink", badge: "即将上线" },
  { id: "settings", label: "参数设置", icon: Settings2, color: "gray" },
] as { id: Tab; label: string; icon: React.ElementType; color: string; badge?: string }[];

const COLOR_CLASSES: Record<string, { active: string; icon: string }> = {
  blue:   { active: "bg-blue-50 text-blue-700 border-l-2 border-blue-600",   icon: "text-blue-500" },
  orange: { active: "bg-orange-50 text-orange-700 border-l-2 border-orange-500", icon: "text-orange-500" },
  indigo: { active: "bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600", icon: "text-indigo-500" },
  yellow: { active: "bg-yellow-50 text-yellow-700 border-l-2 border-yellow-500", icon: "text-yellow-500" },
  pink:   { active: "bg-pink-50 text-pink-700 border-l-2 border-pink-500",   icon: "text-pink-500" },
  gray:   { active: "bg-gray-100 text-gray-800 border-l-2 border-gray-500",  icon: "text-gray-500" },
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("products");
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
    try {
      const res = await fetch("/api/import");
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
  }, []);

  useEffect(() => {
    try {
      const s = localStorage.getItem("ozon-settings");
      if (s) setSettings(JSON.parse(s));
    } catch {}
    loadProducts(true);
    const timer = setInterval(() => loadProducts(false), 5000);
    return () => clearInterval(timer);
  }, [loadProducts]);

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
              <p className="text-sm font-bold text-gray-900 leading-tight">Ozon 选品工具</p>
              <p className="text-xs text-gray-400">1688 → Ozon</p>
            </div>
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
          {tab === "picker" && <PickerPage />}
          {tab === "guide" && <GuidePage />}
          {tab === "settings" && <SettingsPanel settings={settings} onChange={setSettings} />}
          {tab === "monitor" && (
            <ComingSoon title="价格监控" icon="🔔" desc="自动监控竞品价格变动，价格下跌时及时提醒，帮你抓住调价时机。" color="yellow" />
          )}
          {tab === "analytics" && (
            <ComingSoon title="竞品分析" icon="📊" desc="输入 Ozon 商品链接，查看月销量趋势、评价分析、关键词排名，知己知彼。" color="pink" />
          )}
          {tab === "products" && (
            <>
              {/* Stats */}
              {products.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "商品数量", value: products.length, unit: "个" },
                    { label: "汇率", value: settings.exchangeRate, unit: "卢/元" },
                    { label: "运费", value: `${settings.shippingRatePerGram}`, unit: "元/克" },
                    { label: "平台佣金", value: `${(settings.platformFeeRate * 100).toFixed(0)}`, unit: "%" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{s.value}<span className="text-sm font-normal text-gray-400 ml-1">{s.unit}</span></p>
                    </div>
                  ))}
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
                <div className="space-y-4">
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
