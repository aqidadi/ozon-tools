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
        <span>1000卢布 ≈ <strong>{cnyPer1000Rub}元</strong> · $1≈¥7.2</span>
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
      <div className="flex-1 ml-56 overflow-x-hidden">
        {/* 搞笑广告走马灯 */}
        <div className="overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs font-medium">
          <div className="flex animate-marquee whitespace-nowrap py-1.5">
            {[
              "🧸 据说卖毛绒玩具的人，睡觉都是笑着的",
              "💰 今日份励志：你的第一笔外币，正在义乌的某个仓库等你",
              "🚀 Crossly 用户平均上架速度：30秒。你邻居还在手动填表格",
              "😂 不懂俄语没关系，AI也不懂，但它会翻译",
              "🏆 本周最励志：一位宝妈边喂奶边上架了3件商品",
              "📦 货代：我又收到Crossly的货了。Crossly：😎",
              "💡 跨境秘诀只有一个：先发5件，别问为什么，先发就对了",
              "🌍 你知道吗？俄罗斯人在用你卖的抱枕睡觉，他们不知道你是谁，但他们睡得很好",
              "⚡ Ozon刚刚又来了一个订单，主人，快去1688补货吧",
              "🎯 选品时间超过1小时=选品恐惧症，治疗方法：随便选一个先发出去",
              "🤖 AI翻译提示：「毛茸茸的猫咪」翻成俄语后，俄罗斯人疯狂下单",
              "💸 广告位招租，价格面议，付人民币/美元/泰铢均可",
            ].concat([
              "🧸 据说卖毛绒玩具的人，睡觉都是笑着的",
              "💰 今日份励志：你的第一笔外币，正在义乌的某个仓库等你",
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
  const [slide, setSlide] = useState(0);

  const SLIDES = [
    {
      id: "hero",
      label: "我们是谁",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/70 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-white/20">
            🚀 Crossly · 跨境工具箱
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            让跨境像<span style={{ background: "linear-gradient(90deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>微商</span>一样简单
          </h1>
          <p className="text-white/60 text-sm mb-6 max-w-md leading-relaxed">
            在 Crossly，我们不只提供工具，我们提供可能。<br/>
            让每一个普通人都能 0 门槛赚到外币。
          </p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-6">
            {[
              { icon: "🚫", t: "零基础", s: "无需外语，无需PS，AI全搞定" },
              { icon: "📚", t: "零门槛", s: "全网干货免费学，不卖课" },
              { icon: "⚡", t: "全自动", s: "复制链接，剩下交给我们" },
              { icon: "🌍", t: "全世界", s: "Ozon/Shopee/TikTok全平台" },
            ].map(c => (
              <div key={c.t} className="bg-white/10 rounded-2xl p-3 text-left border border-white/10">
                <p className="text-base mb-1">{c.icon}</p>
                <p className="text-white font-bold text-sm">{c.t}</p>
                <p className="text-white/50 text-xs">{c.s}</p>
              </div>
            ))}
          </div>
          <button onClick={onStart}
            className="px-8 py-3 rounded-2xl text-base font-black text-white shadow-xl transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            {user ? "进入工作台 →" : "免费开始，不用注册 →"}
          </button>
        </div>
      ),
    },
    {
      id: "why",
      label: "为什么选我们",
      content: (
        <div className="flex flex-col justify-center h-full px-6 py-4">
          <h2 className="text-white text-xl font-black text-center mb-2">为什么选 Crossly？</h2>
          <p className="text-white/50 text-xs text-center mb-6">三个理由，打消你所有顾虑</p>

          {/* 3大核心卖点 */}
          <div className="space-y-3 mb-6">
            <div className="rounded-2xl p-5 border border-white/20 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(99,102,241,0.1))" }}>
              <div className="absolute right-4 top-3 text-5xl opacity-20">📦</div>
              <p className="text-indigo-300 text-xs font-bold mb-1">第一条</p>
              <p className="text-white text-lg font-black mb-1">无货源，无库存</p>
              <p className="text-white/60 text-sm leading-relaxed">
                有订单才去1688下单，货发义乌货代，货代帮你发全球。<br/>
                <span className="text-white/80 font-medium">你永远不摸货、不租仓库、不压钱。</span>
              </p>
            </div>

            <div className="rounded-2xl p-5 border border-white/20 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(168,85,247,0.1))" }}>
              <div className="absolute right-4 top-3 text-5xl opacity-20">🆓</div>
              <p className="text-purple-300 text-xs font-bold mb-1">第二条</p>
              <p className="text-white text-lg font-black mb-1">注册不要钱</p>
              <p className="text-white/60 text-sm leading-relaxed">
                Crossly 基础功能永久免费，100件商品免费发。<br/>
                <span className="text-white/80 font-medium">赚到钱了再支持我们，赚不到你一分不亏。</span>
              </p>
            </div>

            <div className="rounded-2xl p-5 border border-white/20 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.3), rgba(236,72,153,0.1))" }}>
              <div className="absolute right-4 top-3 text-5xl opacity-20">🛡️</div>
              <p className="text-pink-300 text-xs font-bold mb-1">第三条</p>
              <p className="text-white text-lg font-black mb-1">卖不出去也没损失</p>
              <p className="text-white/60 text-sm leading-relaxed">
                先发5件测试，只花运费样品费约200-300元。<br/>
                <span className="text-white/80 font-medium">卖不动就换款，反正没压库存，不怕亏。</span>
              </p>
            </div>
          </div>

          <button onClick={onStart}
            className="w-full py-3 rounded-2xl text-sm font-black text-white transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            0风险开始，现在就试试 →
          </button>
        </div>
      ),
    },
    {
      id: "stories",
      label: "他们做到了",
      content: (
        <div className="flex flex-col justify-center h-full px-6 py-4">
          <h2 className="text-white text-xl font-black text-center mb-5">普通人，真的做到了 💬</h2>
          <div className="space-y-3">
            {[
              { avatar: "👩", name: "小美", tag: "宝妈 · 义乌 · Shopee · 做了3个月", text: "娃在睡觉，我用手机把第一件毛绒玩具上架到Shopee。那天下午收到第一个订单，真的哭了。原来我也可以。" },
              { avatar: "👨‍🎓", name: "阿俊", tag: "大学生 · 广州 · 东南亚市场 · 大三在读", text: "用Crossly把商品卖到东南亚，每月稳定赚1000多块外币。这个月生活费不用问家里要了，那种感觉没法形容。" },
              { avatar: "👩‍💼", name: "晓玲", tag: "上班族 · 深圳 · TikTok Shop · 会计", text: "下班刷1688找款，复制链接一键发布，AI自动翻译。第二天上班路上收到TikTok Shop出单通知。这就是我想要的副业。" },
            ].map(u => (
              <div key={u.name} className="flex items-start gap-3 bg-white/8 rounded-xl p-3 border border-white/10">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg flex-shrink-0">{u.avatar}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold text-sm">{u.name}</span>
                    <span className="text-white/30 text-[10px]">{u.tag}</span>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed">"{u.text}"</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={onStart}
            className="mt-5 w-full py-3 rounded-2xl text-sm font-black text-white transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #6366f1, #ec4899)" }}>
            我也要开始 →
          </button>
        </div>
      ),
    },
    {
      id: "platforms",
      label: "选平台",
      content: (
        <div className="flex flex-col h-full px-5 py-4 overflow-y-auto">
          <h2 className="text-white text-xl font-black text-center mb-1">全球平台怎么选？🌍</h2>
          <p className="text-white/40 text-xs text-center mb-4">没有最好，只有最适合你的</p>
          <div className="space-y-2.5">
            {[
              {
                flag: "🇷🇺", name: "Ozon", region: "俄罗斯",
                score: 92, color: "#6366f1",
                pros: ["竞争极小，中国卖家少", "溢价高，利润丰厚", "无需库存直接发货", "新手最友好"],
                cons: ["汇率有波动", "需要科学上网操作后台"],
                best: "新手首选 🏆",
                bestColor: "bg-indigo-500",
              },
              {
                flag: "🌏", name: "Shopee", region: "东南亚·台湾",
                score: 75, color: "#f59e0b",
                pros: ["体量大，用户多", "物流便宜", "中国卖家熟悉"],
                cons: ["价格战激烈", "买家很会砍价", "利润相对薄"],
                best: "走量选这里",
                bestColor: "bg-amber-500",
              },
              {
                flag: "🎵", name: "TikTok Shop", region: "东南亚·美国·英国",
                score: 78, color: "#ec4899",
                pros: ["爆单快，内容驱动", "佣金低（2-8%）", "年轻用户消费力强"],
                cons: ["需要会拍视频", "流量不稳定", "退货率较高"],
                best: "会拍视频选这",
                bestColor: "bg-pink-500",
              },
              {
                flag: "🌟", name: "Lazada", region: "东南亚·马来/泰国",
                score: 65, color: "#10b981",
                pros: ["阿里系，物流稳定", "马来西亚/泰国市场强", "入驻门槛低"],
                cons: ["竞争日趋激烈", "流量不如Shopee", "部分品类饱和"],
                best: "东南亚补充战场",
                bestColor: "bg-emerald-500",
              },
              {
                flag: "🇧🇷", name: "Mercado Libre", region: "拉美·巴西/墨西哥",
                score: 70, color: "#8b5cf6",
                pros: ["竞争最少", "市场增长快", "利润高"],
                cons: ["物流复杂", "葡萄牙语/西班牙语", "退款纠纷多"],
                best: "冒险家的蓝海",
                bestColor: "bg-violet-500",
              },
              {
                flag: "📦", name: "亚马逊", region: "美国·欧洲·日本",
                score: 45, color: "#ef4444",
                pros: ["流量最大", "品牌背书强", "全球最大电商"],
                cons: ["门槛极高", "竞争极激烈", "FBA仓储费贵", "封号风险大"],
                best: "有经验再来",
                bestColor: "bg-red-500",
              },
            ].map(p => (
              <div key={p.name} className="bg-white/8 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.flag}</span>
                    <div>
                      <span className="text-white font-black text-sm">{p.name}</span>
                      <span className="text-white/40 text-xs ml-1.5">{p.region}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${p.bestColor}`}>{p.best}</span>
                </div>
                {/* 进度条 */}
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.score}%`, background: p.color }} />
                  </div>
                  <span className="text-white/40 text-[10px] w-6 flex-shrink-0">{p.score}</span>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <p className="text-green-400 text-[10px] font-bold mb-1">✅ 优势</p>
                    {p.pros.map(t => <p key={t} className="text-white/50 text-[10px] leading-relaxed">· {t}</p>)}
                  </div>
                  <div className="flex-1">
                    <p className="text-red-400 text-[10px] font-bold mb-1">⚠️ 注意</p>
                    {p.cons.map(t => <p key={t} className="text-white/50 text-[10px] leading-relaxed">· {t}</p>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-white/20 text-[10px] text-center mt-3 pb-2">Crossly 支持全平台上架，你选好平台，我们帮你搞定</p>
        </div>
      ),
    },
    {
      id: "faq",
      label: "你在担心什么",
      content: (
        <div className="flex flex-col justify-center h-full px-6 py-4">
          <h2 className="text-white text-xl font-black text-center mb-4">你在担心什么？🙋</h2>
          <div className="space-y-2.5 mb-5">
            {[
              { q: "不懂外语能做吗？", a: "完全可以！AI自动翻译标题和描述，你一个字母不用认识" },
              { q: "没仓库，货放哪？", a: "不需要仓库！有订单才去1688下单，发到义乌货代，货代帮你搞定一切" },
              { q: "卖不出去怎么办？", a: "先发5件测款，最多亏200-300元，换来真实市场反馈，比买课划算" },
              { q: "每天只有1-2小时够吗？", a: "够！熟练后每天1小时能上架3-5件，很多宝妈利用娃睡觉时间做" },
              { q: "Crossly收费贵吗？", a: "基础功能永久免费，支持费只要¥9.9/月，相当于给服务器买杯奶茶" },
            ].map(item => (
              <div key={item.q} className="bg-white/8 rounded-xl px-4 py-2.5 border border-white/10">
                <p className="text-white font-semibold text-xs mb-1">❓ {item.q}</p>
                <p className="text-white/50 text-xs leading-relaxed">💡 {item.a}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={onStart}
              className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              消除顾虑，免费开始 →
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "support",
      label: "支持我们",
      content: (
        <div className="flex flex-col justify-center h-full px-6 py-4 text-center">
          <div className="text-4xl mb-3">🔋</div>
          <h2 className="text-white text-xl font-black mb-2">给 Crossly 充个电？</h2>
          <p className="text-white/60 text-sm mb-1">Crossly 所有功能永远对新手免费。</p>
          <p className="text-white/60 text-sm mb-5">但服务器、AI翻译都需要成本。<br/>
            <span className="text-pink-400 font-semibold">如果我们帮到了你，请支持我们活下去 ❤️</span>
          </p>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { emoji: "🧋", label: "喝杯奶茶", price: "¥9.9", sub: "跑1天服务器" },
              { emoji: "🍜", label: "一顿午饭", price: "¥19.9", sub: "感谢最多 🙏", hot: true },
              { emoji: "💪", label: "一年支持", price: "¥69", sub: "你是最强后盾" },
            ].map(p => (
              <div key={p.label} className={`rounded-2xl p-4 border-2 relative ${p.hot ? "border-pink-400 bg-white/15" : "border-white/10 bg-white/8"}`}>
                {p.hot && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">感谢最多</div>}
                <div className="text-xl mb-1">{p.emoji}</div>
                <p className="text-white/60 text-[11px]">{p.label}</p>
                <p className={`text-xl font-black ${p.hot ? "text-pink-400" : "text-white"}`}>{p.price}</p>
                <p className="text-white/30 text-[10px]">{p.sub}</p>
              </div>
            ))}
          </div>
          <button onClick={onStart}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}>
            先免费用，赚到钱再支持我们 →
          </button>
          <p className="text-white/30 text-xs mt-2">不充电也完全可以 · 免费额度100件商品</p>
        </div>
      ),
    },
  ];

  const current = SLIDES[slide];

  return (
    <div className="-mx-6 -mt-6 flex flex-col overflow-hidden" style={{ height: "calc(100vh - 88px)" }}>
      {/* 深色背景全屏 */}
      <div className="flex-1 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 55%), radial-gradient(circle at 80% 20%, #a855f7 0%, transparent 45%)" }} />

        {/* 内容区 */}
        <div className="relative z-10 h-full overflow-y-auto">
          {current.content}
        </div>
      </div>

      {/* 底部Tab导航 */}
      <div className="bg-white border-t border-gray-100 flex">
        {SLIDES.map((s, i) => (
          <button key={s.id} onClick={() => setSlide(i)}
            className={`flex-1 py-2 text-[10px] font-semibold transition-colors ${slide === i ? "text-indigo-600 border-t-2 border-indigo-600 -mt-px bg-indigo-50/50" : "text-gray-400 hover:text-gray-600"}`}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
