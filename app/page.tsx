"use client";

import { useState, useCallback, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SettingsPanel } from "@/components/SettingsPanel";
import { AddProductModal } from "@/components/AddProductModal";
import { PickerPage } from "@/components/PickerPage";
import { exportToExcel } from "@/lib/export";
import { Product, Settings } from "@/lib/types";
import { ShoppingBag, Settings2, Download, Plus, TrendingUp } from "lucide-react";

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
  const [tab, setTab] = useState<"products" | "picker">("products");

  // 从数据库加载商品
  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/import");
      const data = await res.json();
      if (data.products) setProducts(data.products);
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
    loadProducts();
    // 每5秒轮询一次新商品（插件推送）
    const timer = setInterval(loadProducts, 5000);
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
        ) : (
          <>
        {showSettings && (
          <div className="mb-6">
            <SettingsPanel settings={settings} onChange={setSettings} />
          </div>
        )}

        {/* Stats Bar */}
        {products.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center gap-6">
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
