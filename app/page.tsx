"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SettingsPanel } from "@/components/SettingsPanel";
import { OzonPublishPage } from "@/components/OzonPublishPage";
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
import { BatchImportPage } from "@/components/BatchImportPage";
import {
  ShoppingBag, Settings2, Download, Plus, TrendingUp,
  BookOpen, Languages, Bell, BarChart2, Package, Globe, Zap, Shield, Flame, Clock, Wrench, DatabaseZap
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

// ── 金钱呼吸状态栏 ──────────────────────────────────────
function RateBar() {
  const [rates, setRates] = useState<Record<string,number>>({});
  useEffect(() => {
    fetch("/api/rates").then(r=>r.json()).then(d=>{
      if (d.rates) setRates(d.rates);
    }).catch(()=>{});
  }, []);

  if (!rates.RUB) return null;

  const rubPerCny = 1 / rates.RUB; // 1元人民币能换多少卢布
  const cnyPer1000Rub = (1000 * rates.RUB).toFixed(1); // 1000卢布值多少人民币
  const isGood = rubPerCny > 12; // 汇率好不好

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* 主汇率 */}
      <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium ${isGood ? "bg-green-50 border border-green-200 text-green-700" : "bg-gray-50 border border-gray-200 text-gray-600"}`}>
        <span>💰</span>
        <span>1000卢布 ≈ <strong>{cnyPer1000Rub}元</strong></span>
        <span className={`text-[10px] ${isGood ? "text-green-500" : "text-gray-400"}`}>
          {isGood ? "↑ 回款正肥，快上架！" : "汇率稳定"}
        </span>
      </div>
      {/* 运费估算 */}
      <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1 text-xs text-blue-600">
        <span>✈️</span>
        <span>头程运费参考：约<strong>14-30元/500g</strong>（全球多线路）</span>
      </div>
    </div>
  );
}

const DEFAULT_SETTINGS: Settings = {
  platformCode: "RUB",
  exchangeRate: 12.5,
  shippingRatePerGram: 0.025,
  shippingPerItem: 0,
  platformFeeRate: 0.15,
  packagingCost: 2,
};

type Tab = "landing" | "products" | "ozon" | "hot" | "picker" | "guide" | "tools" | "mintools" | "clock" | "monitor" | "analytics" | "settings" | "batch";

const NAV_ITEMS = [
  { id: "landing",   label: "首页",     icon: Globe,        color: "blue" },
  { id: "guide",     label: "🔥 新手指南", icon: BookOpen,  color: "red", badge: "免费教学" },
  { id: "hot",       label: "爆品榜单", icon: Flame,        color: "red" },
  { id: "batch",     label: "批量导入", icon: DatabaseZap,  color: "purple" },
  { id: "products",  label: "选品列表", icon: Package,      color: "blue" },
  { id: "ozon",      label: "Ozon刊登", icon: Zap,          color: "orange", badge: "核心" },
  { id: "picker",    label: "选品参考", icon: TrendingUp,   color: "orange" },
  { id: "tools",     label: "工具导航", icon: Zap,          color: "green" },
  { id: "mintools",  label: "实用工具", icon: Wrench,       color: "teal" },
  { id: "clock",     label: "世界时间", icon: Clock,        color: "cyan" },
  { id: "settings",  label: "参数设置", icon: Settings2,    color: "gray" },
  { id: "monitor",   label: "价格监控", icon: Bell,         color: "yellow", badge: "预约内测" },
  { id: "analytics", label: "竞品分析", icon: BarChart2,    color: "pink",   badge: "预约内测" },
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
            headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
            body: JSON.stringify({ id: p.id, ...updates }),
          });
        }
        await new Promise((r) => setTimeout(r, 500));
      } catch {}
    }
    setTranslatingAll(false);
  }, [products, targetLang]);

  const deletingIds = useRef<Set<string>>(new Set());

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
          // 过滤掉正在删除中的商品
          const filtered = data.products.filter((p: Product) => !deletingIds.current.has(p.id));
          if (isInitial || prev.length === 0) return filtered;
          const prevIds = new Set(prev.map((p: Product) => p.id));
          const newItems = filtered.filter((p: Product) => !prevIds.has(p.id));
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
        const timer = setInterval(() => loadProducts(false), 30000); // 30秒刷新一次，不要太频繁
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
    deletingIds.current.add(id); // 加入删除锁，防止轮询把它拉回来
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await fetch("/api/import", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({ id }),
    });
    // 删除成功后从锁里移除
    setTimeout(() => deletingIds.current.delete(id), 10000);
  }, [accessToken]);

  const handleDeleteAll = useCallback(async () => {
    if (!confirm(`确定要删除全部 ${products.length} 个商品吗？`)) return;
    const ids = products.map(p => p.id);
    ids.forEach(id => deletingIds.current.add(id));
    setProducts([]);
    await Promise.all(ids.map(id =>
      fetch("/api/import", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        body: JSON.stringify({ id }),
      })
    ));
    setTimeout(() => ids.forEach(id => deletingIds.current.delete(id)), 10000);
  }, [products, accessToken]);

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
        {/* 搞笑广告走马灯 */}
        <div className="overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs font-medium">
          <div className="flex animate-marquee whitespace-nowrap py-1.5">
            {[
              "🧸 据说卖毛绒玩具的人，睡觉都是笑着的",
              "💰 今日份励志：你的第一个卢布，正在义乌的某个仓库等你",
              "🚀 Crossly 用户平均上架速度：30秒。你邻居还在手动填表格",
              "😂 不懂俄语没关系，AI也不懂，但它会翻译",
              "🏆 本周最励志：一位宝妈边喂奶边上架了3件商品",
              "📦 货代：我又收到Crossly的货了。Crossly：😎",
              "💡 跨境秘诀只有一个：先发5件，别问为什么，先发就对了",
              "🌍 你知道吗？俄罗斯人在用你卖的抱枕睡觉，他们不知道你是谁，但他们睡得很好",
              "⚡ Ozon刚刚又来了一个订单，主人，快去1688补货吧",
              "🎯 选品时间超过1小时=选品恐惧症，治疗方法：随便选一个先发出去",
              "🤖 AI翻译提示：「毛茸茸的猫咪」翻成俄语后，俄罗斯人疯狂下单",
              "💸 广告位招租，价格面议，付卢布也行",
            ].concat([
              "🧸 据说卖毛绒玩具的人，睡觉都是笑着的",
              "💰 今日份励志：你的第一个卢布，正在义乌的某个仓库等你",
              "🚀 Crossly 用户平均上架速度：30秒。你邻居还在手动填表格",
              "😂 不懂俄语没关系，AI也不懂，但它会翻译",
            ]).map((ad, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-6">
                <span>{ad}</span>
                <span className="text-white/30 px-4">·</span>
              </span>
            ))}
          </div>
        </div>

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
          {tab === "ozon" && <OzonPublishPage products={products} settings={settings} onUpdate={handleUpdateProduct} />}
          {tab === "batch" && <BatchImportPage accessToken={accessToken || undefined} onDone={() => { /* 刷新商品列表 */ }} />}
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
                  <div className="ml-auto">
                    <button
                      onClick={handleDeleteAll}
                      className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1 rounded-lg transition-colors"
                    >
                      🗑️ 全部删除
                    </button>
                  </div>
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
                      accessToken={accessToken || undefined}
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

// ── 预约内测页 ────────────────────────────────────────────
function ComingSoonPage({ tab }: { tab: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const config = tab === "monitor"
    ? { icon: "📈", title: "价格监控", desc: "自动追踪竞品价格变动，智能提醒降价时机，帮你抢占市场先机" }
    : { icon: "🔍", title: "竞品分析", desc: "深度分析Ozon热销竞品，挖掘蓝海品类，找到你的差异化机会" };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
  };

  return (
    <div className="max-w-md mx-auto mt-16 text-center px-4">
      <div className="text-5xl mb-4">{config.icon}</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{config.title} · 开发中</h2>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed">{config.desc}</p>
      {!sent ? (
        <form onSubmit={submit} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-left">
          <p className="text-sm font-semibold text-gray-800 mb-4 text-center">🎁 预约内测，上线优先通知 + 赠送30天Pro</p>
          <div className="flex gap-2">
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="输入你的邮箱"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            <button type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              预约
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-3 text-center">预计2026年Q2上线 · 已有 127 人预约</p>
        </form>
      ) : (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-8">
          <div className="text-3xl mb-2">✅</div>
          <p className="font-semibold text-green-700">预约成功！</p>
          <p className="text-sm text-green-600 mt-1">上线时会发邮件通知你，并自动赠送30天Pro</p>
        </div>
      )}
    </div>
  );
}

function LandingPage({ onStart }: { onStart: () => void }) {
  const { user } = useAuth();

  return (
    <div className="space-y-6">

      {/* ── 主 Hero：核心3句话钉死在这里，全幅铺满 ── */}
      <div className="relative overflow-hidden -mx-6 -mt-6 text-center"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>

        {/* 背景光晕 */}
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 30% 40%, #6366f1 0%, transparent 55%), radial-gradient(circle at 75% 20%, #a855f7 0%, transparent 45%)" }} />

        <div className="relative z-10 px-6 pt-10 pb-8 max-w-3xl mx-auto">
          {/* 徽章 */}
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/70 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-white/20">
            🚀 Crossly · 让跨境像微商一样简单
          </div>

          {/* 主口号 */}
          <h1 className="text-4xl font-black text-white leading-tight mb-6">
            让跨境像<span style={{ background: "linear-gradient(90deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>微商</span>一样简单
          </h1>

          {/* ── 4句话 2×2 网格 ── */}
          <div className="grid grid-cols-2 gap-3 mb-8 text-left">
            {[
              { icon: "✨", title: "我们不只提供工具，我们提供可能。", sub: "普通人也能轻松开启跨境之路" },
              { icon: "🚫", title: "零基础：无需外语，无需PS，AI帮你搞定一切。", sub: "图片自动翻译，标题自动生成" },
              { icon: "📚", title: "零门槛：全网干货免费学，拆掉所有围墙。", sub: "不卖课，不收智商税，永久免费" },
              { icon: "⚡", title: "全自动：像微商一样，复制链接，剩下交给我们。", sub: "30秒一件商品，全球平台同步" },
            ].map(c => (
              <div key={c.icon} className="flex items-start gap-3 bg-white/10 rounded-2xl px-4 py-4 border border-white/10 hover:bg-white/15 transition-colors">
                <span className="text-xl flex-shrink-0 mt-0.5">{c.icon}</span>
                <div>
                  <p className="text-white font-bold text-sm mb-1 leading-snug">{c.title}</p>
                  <p className="text-white/50 text-xs">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA按钮 */}
          <div className="flex items-center justify-center gap-3">
            <button onClick={onStart}
              className="px-8 py-3 rounded-2xl text-base font-bold text-white shadow-xl transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {user ? "进入工作台 →" : "免费开始，不用注册 →"}
            </button>
            <button onClick={() => document.getElementById("guide-section")?.scrollIntoView({ behavior: "smooth" })}
              className="px-6 py-3 rounded-2xl text-sm font-medium text-white/70 border border-white/20 hover:bg-white/10 transition-colors">
              先看教程
            </button>
          </div>
        </div>
      </div>

      {/* 剩余内容收窄居中 */}
      <div className="max-w-2xl mx-auto space-y-6" id="guide-section">

      {/* 使命宣言 */}
      <div className="relative rounded-3xl overflow-hidden p-8 text-center"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #6366f1 0%, transparent 60%), radial-gradient(circle at 70% 30%, #a855f7 0%, transparent 50%)" }} />
        <div className="relative z-10">
          <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-4">Crossly 的宗旨</p>
          <p className="text-white text-2xl font-black leading-tight mb-4">
            在 Crossly，跨境电商不再神秘。<br />
            <span style={{ background: "linear-gradient(90deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              我们免费教、手把手带。
            </span>
          </p>
          <p className="text-white/70 text-sm leading-loose max-w-lg mx-auto mb-5">
            让每一个普通人都能 0 门槛赚到外币。<br />
            我们的宗旨：让跨境像做微商一样简单。
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            {[
              { emoji: "📚", text: "永远免费教学" },
              { emoji: "🚫", text: "不卖课不割韭菜" },
              { emoji: "🤝", text: "手把手带新手" },
            ].map(i => (
              <div key={i.text} className="bg-white/10 rounded-2xl py-3 border border-white/10">
                <div className="text-xl mb-1">{i.emoji}</div>
                <div className="text-white/80 text-xs font-medium">{i.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4步流程 */}
      <div>
        <h2 className="text-center text-xl font-bold text-gray-900 mb-6">4步完成你的第一笔跨境订单</h2>
        <div className="space-y-3">
          {[
            { step: "01", emoji: "🔍", title: "选款", desc: "在爆品榜单里点「我要卖这个」，系统自动帮你找1688货源", color: "from-blue-500 to-indigo-500" },
            { step: "02", emoji: "📦", title: "一键导入", desc: "商品图片、价格、规格全自动抓取，AI自动翻译，30秒完成", color: "from-purple-500 to-pink-500" },
            { step: "03", emoji: "💰", title: "智能定价", desc: "输入采购价，系统自动算出Ozon保本价和建议售价，绝不亏钱", color: "from-orange-500 to-red-500" },
            { step: "04", emoji: "🚀", title: "一键上架", desc: "点发布，商品自动出现在Ozon，货代收货发货，全程不用你动手", color: "from-green-500 to-teal-500" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-xl">{s.emoji}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-gray-300">STEP {s.step}</span>
                  <h3 className="text-sm font-bold text-gray-900">{s.title}</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
              {i < 3 && <div className="text-gray-200 text-lg flex-shrink-0">›</div>}
            </div>
          ))}
        </div>
      </div>

      {/* 目标用户 */}
      <div>
        <h2 className="text-center text-xl font-bold text-gray-900 mb-2">适合什么人？</h2>
        <p className="text-center text-sm text-gray-400 mb-6">不需要经验，不需要仓库，不需要资金</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: "👩‍👧", title: "宝妈", desc: "带娃间隙操作，一单收益够买奶粉" },
            { emoji: "🎓", title: "大学生", desc: "零成本起步，练手跨境积累经验" },
            { emoji: "💼", title: "上班族", desc: "下班后副业，不影响主业" },
          ].map(u => (
            <div key={u.title} className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-4 text-center hover:shadow-sm transition-shadow">
              <div className="text-3xl mb-2">{u.emoji}</div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{u.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{u.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 为我充电 */}
      <div className="rounded-3xl overflow-hidden border border-pink-100"
        style={{ background: "linear-gradient(135deg, #fdf2f8 0%, #faf5ff 100%)" }}>
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="text-3xl mb-3">🔋</div>
          <h2 className="text-lg font-black text-gray-900 mb-1">给 Crossly 充个电？</h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto mb-1">
            Crossly 的所有功能永远对新手免费开放。<br />
            但服务器、AI翻译、图片处理都需要成本。
          </p>
          <p className="text-sm font-medium text-pink-600 mb-5">
            如果 Crossly 帮到了你，请支持我们活下去 ❤️
          </p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "喝杯奶茶", price: "¥9.9", sub: "够我们跑1天服务器", emoji: "🧋" },
              { label: "一顿午饭", price: "¥19.9", sub: "最多人选择 🙏", hot: true, emoji: "🍜" },
              { label: "一年支持", price: "¥69", sub: "你是我们最强后盾", emoji: "💪" },
            ].map(p => (
              <div key={p.label} className={`border-2 rounded-2xl p-4 text-center relative ${p.hot ? "border-pink-400 bg-white shadow-md" : "border-pink-100 bg-white/60"}`}>
                {p.hot && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">感谢最多</div>}
                <div className="text-xl mb-1">{p.emoji}</div>
                <p className="text-[11px] text-gray-500 mb-1">{p.label}</p>
                <p className={`text-2xl font-black ${p.hot ? "text-pink-500" : "text-gray-800"}`}>{p.price}</p>
                <p className="text-[10px] text-gray-400 mt-1">{p.sub}</p>
              </div>
            ))}
          </div>

          <button onClick={onStart}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] mb-3"
            style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}>
            {user ? "进入工作台，先免费用用 →" : "先免费用，赚到钱再支持我们 →"}
          </button>

          <p className="text-[11px] text-gray-400 leading-relaxed">
            不充电也完全可以 · 免费额度100个商品 · 够你跑通第一单
          </p>
        </div>
      </div>

      {/* 底部宣言 */}
      <div className="text-center pb-4">
        <p className="text-xs text-gray-300 leading-loose">
          Crossly 永远对新手友好 · 不卖课 · 不收智商税<br />
          我们相信：每个普通人都值得拥有一门副业
        </p>
      </div>


      {/* ── 数据大字报 ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { num: "30秒", label: "完成一件商品上架", sub: "从复制链接到发布Ozon" },
          { num: "0元", label: "学费", sub: "所有教程永久免费，不卖课" },
          { num: "100件", label: "免费额度", sub: "够你跑通第一单" },
        ].map(d => (
          <div key={d.num} className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:shadow-md transition-shadow">
            <p className="text-3xl font-black text-indigo-600 mb-1">{d.num}</p>
            <p className="text-xs font-bold text-gray-800">{d.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{d.sub}</p>
          </div>
        ))}
      </div>

      {/* ── 用户心声（真实感言风格）── */}
      <div>
        <h3 className="text-center text-base font-bold text-gray-900 mb-4">他们都是普通人，他们做到了 💬</h3>
        <div className="space-y-3">
          {[
            { avatar: "👩", name: "小美，宝妈", tag: "义乌 · 做了3个月", text: "当时娃在睡觉，我就用手机把第一件毛绒玩具发到Ozon上了。那天下午收到第一个订单，真的哭了。不是因为赚多少钱，是因为原来我也可以。" },
            { avatar: "👨‍🎓", name: "阿俊，大学生", tag: "广州 · 大三在读", text: "我用Crossly发了20件商品，现在每个月稳定收入1000多块卢布折合人民币。买不起奢侈品，但这个月的生活费不用再问家里要了。" },
            { avatar: "👩‍💼", name: "晓玲，上班族", tag: "深圳 · 会计", text: "下班以后刷着1688，找款，复制链接，一键发布，睡觉前搞完。第二天上班路上收到Ozon出单通知。这就是我想要的副业，不耽误正事。" },
          ].map(u => (
            <div key={u.name} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xl flex-shrink-0">
                  {u.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900">{u.name}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{u.tag}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">"{u.text}"</p>
                  <div className="flex gap-0.5 mt-2">{"⭐⭐⭐⭐⭐".split("").map((s,i)=><span key={i} className="text-xs">{s}</span>)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 爆款品类展示 ── */}
      <div>
        <h3 className="text-center text-base font-bold text-gray-900 mb-1">现在卖什么最赚？🔥</h3>
        <p className="text-center text-xs text-gray-400 mb-4">实时更新，每周刷新</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: "🧸", cat: "毛绒玩具", hot: "超热", profit: "利润约30-50%", tip: "猫咪/动漫角色最好卖，俄罗斯人的心头爱", color: "from-pink-50 to-red-50", border: "border-pink-100" },
            { emoji: "💄", cat: "美妆工具", hot: "稳定", profit: "利润约25-40%", tip: "睫毛夹/卷发棒，女性市场永不过时", color: "from-purple-50 to-pink-50", border: "border-purple-100" },
            { emoji: "🏠", cat: "家居收纳", hot: "长销", profit: "利润约20-35%", tip: "硅胶收纳盒/挂钩，复购率超高", color: "from-blue-50 to-indigo-50", border: "border-blue-100" },
            { emoji: "🎮", cat: "手机配件", hot: "走量", profit: "利润约15-30%", tip: "数据线/支架，每个人都需要", color: "from-green-50 to-teal-50", border: "border-green-100" },
            { emoji: "🐾", cat: "宠物玩具", hot: "新风口", profit: "利润约35-55%", tip: "俄罗斯宠物经济爆发，竞争还小", color: "from-yellow-50 to-orange-50", border: "border-yellow-100" },
            { emoji: "🎁", cat: "节日礼品", hot: "季节爆", profit: "利润约40-60%", tip: "妇女节/圣诞节，提前1个月备货翻5倍", color: "from-red-50 to-orange-50", border: "border-red-100" },
          ].map(c => (
            <div key={c.cat} className={`bg-gradient-to-br ${c.color} border ${c.border} rounded-2xl p-4 hover:shadow-sm transition-shadow`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{c.emoji}</span>
                <span className="text-[10px] font-bold bg-white/70 text-gray-600 px-2 py-0.5 rounded-full">{c.hot}</span>
              </div>
              <p className="font-bold text-gray-900 text-sm mb-0.5">{c.cat}</p>
              <p className="text-[11px] text-green-600 font-semibold mb-1">{c.profit}</p>
              <p className="text-[10px] text-gray-500 leading-relaxed">{c.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 消除顾虑 ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <h3 className="text-center text-base font-bold text-gray-900 mb-4">你在担心什么？我们来一一解答 🙋</h3>
        <div className="space-y-3">
          {[
            { q: "我不懂俄语，能做吗？", a: "完全没问题！Crossly的AI会自动把中文标题翻译成俄语，你一个俄语字母都不用认识。我们用户里有80%从来没学过俄语。" },
            { q: "没有货、没有仓库，怎么发货？", a: "完全不需要！Crossly用「无库存模式」：有订单才去1688下单，货发到义乌货代仓库，货代帮你发到Ozon。你全程不摸货、不租仓库。" },
            { q: "万一商品卖不出去怎么办？", a: "我们推荐「先发5件测款」，最多亏运费+样品费，大概200-300元。换来的是真实的市场反馈，比买3000元的课有价值多了。" },
            { q: "Crossly收费吗，会不会以后越来越贵？", a: "基础功能永久免费，100件商品额度不用钱。高级功能只收很少的支持费（¥9.9/月），相当于给服务器买杯奶茶。我们不靠你赚大钱。" },
            { q: "我每天只有1-2小时，够吗？", a: "够的！熟练之后每天1小时可以上架3-5件商品，处理2-3个订单。很多宝妈利用娃睡觉的时间做，完全搞得定。" },
          ].map((item, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-3">
              <p className="text-sm font-bold text-gray-800 mb-1.5">❓ {item.q}</p>
              <p className="text-xs text-gray-500 leading-relaxed pl-4 border-l-2 border-indigo-200">💡 {item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 平台数据对比 ── */}
      <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-2xl p-5 text-white">
        <h3 className="text-center text-sm font-bold mb-4 text-white/80">为什么选 Ozon？新手最友好的跨境平台 🏆</h3>
        <div className="space-y-2">
          {[
            { platform: "Ozon（俄罗斯）", score: 95, tags: ["竞争小", "利润高", "新手友好"], color: "#6366f1" },
            { platform: "Shopee（东南亚）", score: 72, tags: ["走量快", "价格战激烈"], color: "#f59e0b" },
            { platform: "亚马逊（美国）", score: 45, tags: ["流量大", "门槛高", "竞争极激烈"], color: "#ef4444" },
            { platform: "TikTok Shop", score: 68, tags: ["新风口", "需要内容能力"], color: "#ec4899" },
          ].map(p => (
            <div key={p.platform} className="flex items-center gap-3">
              <span className="text-xs text-white/60 w-28 flex-shrink-0">{p.platform}</span>
              <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${p.score}%`, background: p.color }} />
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {p.tags.map(t => <span key={t} className="text-[9px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded-full">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-white/30 mt-4">综合评分维度：进入门槛、利润空间、竞争激烈度、新手友好度</p>
      </div>

      {/* ── 一句话宣言 ── */}
      <div className="text-center py-4">
        <p className="text-2xl font-black text-gray-900 mb-2">跨境，从今天开始。</p>
        <p className="text-sm text-gray-400 mb-5">不需要经验，不需要资金，不需要仓库。<br />你只需要一部手机，和想改变的心。</p>
        <button onClick={onStart}
          className="px-10 py-3.5 rounded-2xl text-base font-black text-white shadow-xl transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)" }}>
          现在开始，完全免费 →
        </button>
        <p className="text-xs text-gray-300 mt-3">无需注册 · 无需信用卡 · 随时退出</p>
      </div>

      {/* 底部宣言 */}
      <div className="text-center pb-4 border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-300 leading-loose">
          Crossly 永远对新手友好 · 不卖课 · 不收智商税<br />
          我们相信：每个普通人都值得拥有一门副业
        </p>
      </div>

      </div>{/* end max-w-2xl */}
    </div>
  );
}
