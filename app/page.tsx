"use client";

import { useState, useCallback, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SettingsPanel } from "@/components/SettingsPanel";
import { AddProductModal } from "@/components/AddProductModal";
import { PickerPage } from "@/components/PickerPage";
import { GuidePage } from "@/components/GuidePage";
import { exportToExcel } from "@/lib/export";
import { Product, Settings, LANGUAGES } from "@/lib/types";
import { ShoppingBag, Settings2, Download, Plus, TrendingUp, BookOpen, Languages, Bell, BarChart2, Search } from "lucide-react";

const DEFAULT_SETTINGS: Settings = {
  exchangeRate: 10,
  shippingRatePerGram: 0.025,
  platformFeeRate: 0.15,
  packagingCost: 2,
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"products" | "picker" | "guide" | "monitor" | "analytics">("products");
  const [translatingAll, setTranslatingAll] = useState(false);
  const [targetLang, setTargetLang] = useState("ru");

  // 批量翻译所有未翻译商品
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
        await new Promise((r) => setTimeout(r, 500)); // 限速
      } catch {}
    }
    setTranslatingAll(false);
  }, [products, targetLang]);

  // 从数据库加载商品
  const loadProducts = useCallback(async (isInitial = false) => {
    try {
      const res = await fetch("/api/import");
      const data = await res.json();
      if (data.products) {
        setProducts((prev) => {
          if (isInitial || prev.length === 0) return data.products;
          // 轮询时只合并新商品，不覆盖已有商品（保留用户正在编辑的数据）
          const prevIds = new Set(prev.map((p: Product) => p.id));
          const newItems = data.products.filter((p: Product) => !prevIds.has(p.id));
          return newItems.length > 0 ? [...newItems, ...prev] : prev;
        });
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 从 localStorage 恢复设置
    try {
      const savedSettings = localStorage.getItem("ozon-settings");
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch {}
    loadProducts(true);
    // 每5秒轮询一次新商品（插件推送），但不覆盖已有数据
    const timer = setInterval(() => loadProducts(false), 5000);
    return () => clearInterval(timer);
  }, [loadProducts]);

  // 设置变化时保存到 localStorage
  useEffect(() => {
    localStorage.setItem("ozon-settings", JSON.stringify(settings));
  }, [settings]);

  const handleAddProduct = useCallback((product: Product) => {
    setProducts((prev) => [product, ...prev]);
    setShowAddModal(false);
  }, []);

  const handleUpdateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
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
    if (products.length === 0) {
      alert("请先添加商品");
      return;
    }
    exportToExcel(products, settings);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-blue-600" size={24} />
            <h1 className="text-xl font-bold text-gray-900">Ozon 选品工具</h1>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              1688 → Ozon
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab(tab === "picker" ? "products" : "picker")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "picker" ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <TrendingUp size={16} />
              选品参考
            </button>
            <button
              onClick={() => setTab(tab === "guide" ? "products" : "guide")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "guide" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <BookOpen size={16} />
              新手指南
            </button>
            <button
              onClick={() => setTab(tab === "monitor" ? "products" : "monitor")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "monitor" ? "bg-yellow-100 text-yellow-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Bell size={16} />
              价格监控
            </button>
            <button
              onClick={() => setTab(tab === "analytics" ? "products" : "analytics")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "analytics" ? "bg-pink-100 text-pink-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <BarChart2 size={16} />
              竞品分析
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showSettings
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Settings2 size={16} />
              参数设置
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Download size={16} />
              导出 Excel
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              添加商品
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === "picker" ? (
          <PickerPage />
        ) : tab === "guide" ? (
          <GuidePage />
        ) : tab === "monitor" ? (
          <ComingSoon title="价格监控" icon="🔔" desc="自动监控竞品价格变动，价格下跌时及时提醒，帮你抓住调价时机。" color="yellow" />
        ) : tab === "analytics" ? (
          <ComingSoon title="竞品分析" icon="📊" desc="输入 Ozon 商品链接，查看月销量趋势、评价分析、关键词排名，知己知彼。" color="pink" />
        ) : (
          <>
        {showSettings && (
          <div className="mb-6">
            <SettingsPanel settings={settings} onChange={setSettings} />
          </div>
        )}

        {/* Stats Bar */}
        {products.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-sm text-gray-500">共</span>
              <span className="text-2xl font-bold text-gray-900 mx-1">{products.length}</span>
              <span className="text-sm text-gray-500">个商品</span>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div className="text-sm text-gray-500">
              汇率：<span className="font-medium text-gray-800">1元 = {settings.exchangeRate} 卢布</span>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div className="text-sm text-gray-500">
              运费：<span className="font-medium text-gray-800">{settings.shippingRatePerGram} 元/克</span>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div className="text-sm text-gray-500">
              平台佣金：<span className="font-medium text-gray-800">{(settings.platformFeeRate * 100).toFixed(0)}%</span>
            </div>
            {/* 批量翻译 */}
            <div className="ml-auto flex items-center gap-2">
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                ))}
              </select>
              <button
                onClick={handleTranslateAll}
                disabled={translatingAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                <Languages size={14} />
                {translatingAll ? "翻译中..." : `批量翻译 (${products.filter(p => !p.titleRu).length}个未译)`}
              </button>
            </div>
          </div>
        )}

        {/* Product List */}
        {products.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="text-blue-400" size={36} />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">还没有商品</h2>
            <p className="text-gray-400 mb-6 text-sm">
              点击「添加商品」手动录入，或安装 Chrome 插件从 1688 一键导入
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              添加第一个商品
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

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          onAdd={handleAddProduct}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// 即将上线占位页
function ComingSoon({ title, icon, desc, color }: { title: string; icon: string; desc: string; color: string }) {
  const colorMap: Record<string, string> = {
    yellow: "from-yellow-50 to-orange-50 border-yellow-200 text-yellow-800",
    pink: "from-pink-50 to-purple-50 border-pink-200 text-pink-800",
  };
  return (
    <div className={`max-w-2xl mx-auto mt-16 text-center bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-12`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl font-bold mb-3">{title}</h2>
      <p className="text-base opacity-80 mb-8 max-w-md mx-auto">{desc}</p>
      <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-6 py-3 text-sm font-medium text-gray-600 shadow-sm">
        🚧 即将上线，敬请期待
      </div>
      <p className="text-xs opacity-60 mt-4">此功能正在开发中，上线后将第一时间通知您</p>
    </div>
  );
}
