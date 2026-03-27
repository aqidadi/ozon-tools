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
import { AddToHomeScreen } from "@/components/AddToHomeScreen";
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

// ── 顶部广告位（3个并排） ────────────────────────────────
const AD_SLOTS_A = [
  "🐶 老板的狗狗没狗粮了，求大佬投广告",
  "☕ 老板第三杯咖啡了，只为让你看到这",
  "🍜 服务器靠泡面撑着，投广告让它吃饭",
  "📦 老板送外卖给服务器续命中，求救",
];
const AD_SLOTS_B = [
  "🚢 货代/物流 · 广告位招租 · 价格面议",
  "🏪 1688供货商 · 推广位空缺 · 联系我们",
  "✈️ 跨境物流广告位 · 全国卖家天天看",
  "📦 仓储货代推广位 · 卖家精准触达",
];
const AD_SLOTS_C = [
  "💸 这里放广告，比朋友圈便宜，没准还管用",
  "🚀 月活在涨 · 广告效果未知 · 价格你定",
  "🎯 精准跨境卖家流量 · 广告位招租中",
  "🤝 跨境服务商合作 · 联系 aqiliaobi@163.com",
];

function RateBar() {
  const [i] = useState(() => Math.floor(Math.random() * 4));
  return (
    <div className="border-b border-gray-100 text-[11px] font-medium">
      {/* 桌面：3列 */}
      <div className="hidden md:grid grid-cols-3 divide-x divide-gray-100">
        <div className="flex items-center justify-center gap-1 bg-yellow-50 px-3 py-1.5 text-yellow-700 cursor-pointer hover:bg-yellow-100 transition-colors whitespace-nowrap overflow-hidden"
          title="联系我们投广告：aqiliaobi@163.com">
          📣 {AD_SLOTS_A[i]}
        </div>
        <div className="flex items-center justify-center gap-1 bg-blue-50 px-3 py-1.5 text-blue-600 cursor-pointer hover:bg-blue-100 transition-colors whitespace-nowrap overflow-hidden"
          title="联系我们投广告：aqiliaobi@163.com">
          {AD_SLOTS_B[i]}
        </div>
        <div className="flex items-center justify-center gap-1 bg-purple-50 px-3 py-1.5 text-purple-600 cursor-pointer hover:bg-purple-100 transition-colors whitespace-nowrap overflow-hidden"
          title="联系我们投广告：aqiliaobi@163.com">
          {AD_SLOTS_C[i]}
        </div>
      </div>
      {/* 手机：单行轮播 */}
      <div className="md:hidden flex items-center justify-center gap-1 bg-yellow-50 px-3 py-1.5 text-yellow-700 whitespace-nowrap overflow-hidden">
        📣 {AD_SLOTS_A[i]}
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

type Tab = "landing" | "products" | "ozon" | "hot" | "picker" | "guide" | "tools" | "mintools" | "clock" | "monitor" | "analytics" | "settings" | "batch" | "course";

const NAV_ITEMS = [
  { id: "guide",     label: "🔥 新手指南", icon: BookOpen,    color: "red",    badge: "必看·免费" },
  { id: "course",    label: "📚 小学生私房课", icon: BookOpen,   color: "orange", badge: "独家" },
  { id: "landing",   label: "首页",        icon: Globe,        color: "blue" },
  { id: "hot",       label: "爆品榜单",    icon: Flame,        color: "red" },
  { id: "picker",    label: "选品参考",    icon: TrendingUp,   color: "orange" },
  { id: "batch",     label: "批量导入",    icon: DatabaseZap,  color: "purple" },
  { id: "products",  label: "选品列表",    icon: Package,      color: "blue" },
  { id: "ozon",      label: "Ozon刊登",    icon: Zap,          color: "orange", badge: "核心" },
  { id: "tools",     label: "选品流程",    icon: Zap,          color: "green" },
  { id: "mintools",  label: "实用工具",    icon: Wrench,       color: "teal" },
  { id: "clock",     label: "世界时间",    icon: Clock,        color: "cyan" },
  { id: "settings",  label: "参数设置",    icon: Settings2,    color: "gray" },
  { id: "monitor",   label: "价格监控",    icon: Bell,         color: "yellow", badge: "预约内测" },
  { id: "analytics", label: "竞品分析",    icon: BarChart2,    color: "pink",   badge: "预约内测" },
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
      <aside className="w-56 hidden md:flex flex-col fixed h-full z-20"
        style={{ background: "linear-gradient(180deg, #1e2d5a 0%, #2d1b69 50%, #1a1a2e 100%)" }}>
        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img src="/icon-192.png" alt="Crossly" className="w-9 h-9 rounded-xl shadow-lg object-cover" />
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
      <div className="flex-1 md:ml-56 overflow-x-hidden min-w-0">
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

        {/* 广告条 - 全宽3格并排 */}
        <RateBar />

        {/* Page content */}
        <main className="p-4 md:p-6 pb-24 md:pb-6">
          {tab === "landing" && <LandingPage onStart={() => setTab("products")} />}
          {tab === "hot" && <HotPage />}
          {tab === "picker" && <PickerPage />}
          {tab === "guide" && <GuidePage />}
          {tab === "course" && <CoursePage />}
          {tab === "tools" && <ToolsPage />}
          {tab === "mintools" && <MiniToolsPage />}
          {tab === "clock" && <ClockPage />}
          {tab === "ozon" && <OzonPublishPage products={products} settings={settings} onUpdate={handleUpdateProduct} />}
          {tab === "batch" && <BatchImportPage accessToken={accessToken || undefined} onDone={() => { /* 刷新商品列表 */ }} onTabChange={(t) => setTab(t as Tab)} />}
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

      {/* 添加到桌面引导 */}
      <AddToHomeScreen />

      {/* 手机底部 Tab Bar (md以上隐藏) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 flex"
        style={{ background: "linear-gradient(180deg, #1e2d5a 0%, #1a1a2e 100%)" }}>
        {[
          { id: "landing",   icon: "🏠", label: "首页" },
          { id: "guide",     icon: "📖", label: "新手" },
          { id: "hot",       icon: "🔥", label: "榜单" },
          { id: "products",  icon: "📦", label: "选品" },
          { id: "__mine__",  icon: user ? "👤" : "🔑", label: user ? "我的" : "登录" },
        ].map(item => (
          <button key={item.id}
            onClick={() => {
              if (item.id === "__mine__") {
                setShowLoginPrompt(true);
              } else {
                setTab(item.id as Tab);
              }
            }}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${tab === item.id ? "text-white" : "text-white/40"}`}>
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[9px] font-medium">{item.label}</span>
            {tab === item.id && <span className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />}
          </button>
        ))}
      </nav>
    </div>
  );
}

function ComingSoon({ title, icon, desc, color }: { title: string; icon: string; desc: string; color: string }) {
  const jokes = [
    "🧑‍💻 程序员正在义乌仓库「实地考察」，回来就上线",
    "☕ 小学生已经喝了第4杯咖啡，代码快写完了",
    "🐛 Bug太多，正在一条一条消灭，敬请期待",
    "🚀 功能已经在飞机上了，快降落了",
    "🐢 慢工出细活，磨刀不误砍柴工",
  ];
  const joke = jokes[Math.floor(Math.random() * jokes.length)];

  return (
    <div className="max-w-md mx-auto px-4 pt-8 pb-16">
      {/* 主体卡片 */}
      <div className={`text-center bg-gradient-to-br ${color === "yellow" ? "from-yellow-50 to-orange-50 border-yellow-200" : "from-pink-50 to-purple-50 border-pink-200"} border rounded-2xl p-8 mb-6`}>
        <div className="text-5xl mb-3">{icon}</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">{desc}</p>
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-medium text-gray-500 shadow-sm">
          🚧 开发中
        </div>
      </div>

      {/* 幽默状态 */}
      <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-4 text-center shadow-sm">
        <p className="text-xs text-gray-500 italic">{joke}</p>
      </div>

      {/* 等待期间推荐 */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 text-center mb-3">— 等待期间，先用这些 —</p>
        {[
          { icon: "📖", label: "新手指南", desc: "从零开始第一单，30分钟看完", tab: "guide" },
          { icon: "🔥", label: "爆品榜单", desc: "看看现在什么最好卖", tab: "hot" },
          { icon: "📦", label: "我的选品", desc: "管理已导入的商品", tab: "products" },
        ].map(r => (
          <div key={r.tab} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
            <span className="text-xl flex-shrink-0">{r.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800">{r.label}</p>
              <p className="text-[10px] text-gray-400">{r.desc}</p>
            </div>
            <span className="text-gray-300 text-sm">→</span>
          </div>
        ))}
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

// ────────────────────────────────────────────────────────────
// Chrome 插件安装教程弹窗
// ────────────────────────────────────────────────────────────
const INSTALL_STEPS = [
  {
    step: 1,
    icon: "⬇️",
    title: "点击下载插件压缩包",
    desc: "点下面的橙色按钮，浏览器会自动下载一个 .zip 文件到你电脑的「下载」文件夹",
    tip: "💡 下载完不要直接双击打开，先找到它在哪",
    action: true,
  },
  {
    step: 2,
    icon: "📂",
    title: "解压缩这个文件",
    desc: "找到刚下载的 crossly-extension-v1.8.3.zip，右键点它 → 选「解压缩」或「Extract Here」，会生成一个文件夹",
    tip: "💡 Windows用户：右键→解压到当前文件夹；Mac用户：双击自动解压",
  },
  {
    step: 3,
    icon: "🌐",
    title: "打开 Chrome 扩展管理页",
    desc: "在 Chrome 浏览器地址栏输入：chrome://extensions 然后按回车",
    tip: "💡 或者点浏览器右上角「⋮」→ 更多工具 → 扩展程序",
    copy: "chrome://extensions",
  },
  {
    step: 4,
    icon: "🔧",
    title: "开启「开发者模式」",
    desc: "在扩展管理页右上角，找到「开发者模式」开关，点一下打开它（变成蓝色就对了）",
    tip: "💡 不开这个就没法手动安装插件，必须打开",
  },
  {
    step: 5,
    icon: "📥",
    title: "加载解压后的文件夹",
    desc: "点页面左上角出现的「加载已解压的扩展程序」按钮，在弹出的窗口里选择刚才解压出来的文件夹",
    tip: "💡 选的是「文件夹」不是里面的文件！找到文件夹点确定就行",
  },
  {
    step: 6,
    icon: "✅",
    title: "安装完成！",
    desc: "扩展列表里出现「Crossly 跨境选品工具」就成功了！去 1688 打开任意商品页，点浏览器右上角的 Crossly 图标开始使用",
    tip: "🎉 遇到问题？截图发给我们：aqiliaobi@163.com 马上帮你解决",
  },
];

function ExtensionInstallModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText("chrome://extensions");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-black text-gray-900 text-base">🧩 Chrome 插件安装教程</h2>
            <p className="text-xs text-gray-400 mt-0.5">5分钟搞定，真的不难！</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">✕</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* 下载按钮 */}
          <a
            href="https://github.com/aqidadi/ozon-tools/raw/main/crossly-extension-v1.8.3.zip"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white font-black text-sm shadow-lg transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #ea580c, #dc2626)" }}>
            ⬇️ 第一步：点这里下载插件（免费）
          </a>

          {/* 步骤列表 */}
          <div className="space-y-3">
            {INSTALL_STEPS.map((s) => (
              <div key={s.step} className={`rounded-2xl border p-4 ${s.step === 6 ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5 ${s.step === 6 ? "bg-green-500 text-white" : "bg-indigo-600 text-white"}`}>
                    {s.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{s.icon}</span>
                      <p className="font-bold text-gray-900 text-sm">{s.title}</p>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-2">{s.desc}</p>
                    {s.copy && (
                      <button onClick={handleCopy}
                        className="flex items-center gap-2 bg-gray-800 text-white text-xs font-mono px-3 py-1.5 rounded-lg mb-2 hover:bg-gray-700 transition-colors">
                        <span>{s.copy}</span>
                        <span className="text-gray-400">{copied ? "✓ 已复制" : "点击复制"}</span>
                      </button>
                    )}
                    <p className="text-[11px] text-indigo-600 bg-indigo-50 rounded-lg px-2.5 py-1.5 leading-relaxed">{s.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 底部帮助 */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
            <p className="text-xs font-bold text-orange-700 mb-1">🙋 安装遇到问题？</p>
            <p className="text-[11px] text-orange-600">截图发给我们，5分钟内回复帮你搞定</p>
            <p className="text-[11px] text-orange-500 font-mono mt-1">aqiliaobi@163.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 小学生私房课页面
// ────────────────────────────────────────────────────────────
const COURSES = [
  {
    id: 1, tag: "📦 发货篇", tagColor: "bg-orange-100 text-orange-600",
    title: "《小学生带你跑遍北苑仓库：发货最后一公里》",
    desc: "我在义乌北苑，仓库就在脚下。从1688下单→货代收货→贴标→发往全球，全程手把手。",
    duration: "23分钟", type: "📖 图文详解", free: true, hot: true,
    banner: ["🛒","→","🏭","→","🏷️","→","✈️","→","💰"],
    bannerLabels: ["1688下单","","货代收货","","贴Ozon标","","发出国际","","收钱！"],
    steps: [
      { img: "🛒", title: "第1步：1688下单填货代地址", detail: "在1688找好货 → 下单时「收货地址」填货代仓库地址 → 备注写上你的客户编号，货代才知道是你的货" },
      { img: "🏭", title: "第2步：货代仓库收货贴标", detail: "货代收到货后，帮你拆包检查 → 打印Ozon/Shopee条形码贴上去 → 重新打包。你全程不用动手，一个微信截图就搞定" },
      { img: "✈️", title: "第3步：选对物流发出", detail: "Ozon选RETS跨境快线（¥25-50/500g，5-10天）；Shopee选SLS（¥2-8/500g，7-14天）。货代会帮你选最优惠线路" },
      { img: "📍", title: "第4步：平台填追踪单号", detail: "货代给你单号 → 复制到Ozon/Shopee卖家后台填入 → 买家可以自己查进度，你不用一个一个回复" },
      { img: "💰", title: "第5步：买家签收，收钱！", detail: "买家确认收货后平台打款：Ozon约14天，Shopee约7天，TikTok约3-7天。用万里汇提现到国内银行卡" },
    ],
  },
  {
    id: 2, tag: "🔍 选品篇", tagColor: "bg-blue-100 text-blue-600",
    title: "《不懂货的新手，如何在义乌1小时选出3款爆品》",
    desc: "不用去义乌，不用逛市场。用手机30分钟找出海外热卖商品，货代老板娘的选品秘诀全在这里。",
    duration: "18分钟", type: "📖 图文详解", free: true, hot: true,
    banner: ["🔥","→","📊","→","🛒","→","🧪","→","🚀"],
    bannerLabels: ["找热词","","看销量","","选3款","","测5件","","爆单"],
    steps: [
      { img: "🔥", title: "第1步：找热词（用Crossly选品参考）", detail: "打开Crossly「选品参考」→ 选品类（比如毛绒玩具）→ 点🔥热门关键词 → 点「搜」直达1688。这些词是有真实买家在搜的" },
      { img: "📊", title: "第2步：看月销量排序", detail: "1688搜索结果 → 点「销量」排序 → 找月销1000+的款 → 看买家评价里的买家秀图片（真实质量参考）" },
      { img: "🔍", title: "第3步：对比3家供货商", detail: "同款找3家比价 → 看：月销量/买家晒图/发货速度/是否支持混批。月销>1000、买家秀>50张的更可信" },
      { img: "🧪", title: "第4步：先拍5件测款", detail: "新款不要一次进太多！先拍5件 → 发货 → 出单了再加量。亏也就亏200-300元，换来真实市场数据" },
      { img: "🚀", title: "第5步：跑通后批量铺货", detail: "测款成功 → 加量20-50件 → 同款多颜色/规格 → 复制到Ozon+Shopee同步铺货 → 利润翻倍" },
    ],
  },
  {
    id: 3, tag: "💰 定价篇", tagColor: "bg-green-100 text-green-600",
    title: "《宝妈必看：第一件商品定多少钱才不亏？》",
    desc: "很多新手第一单亏了——不是货不好，是价格没算对。一个傻瓜公式搞定定价恐惧症。",
    duration: "12分钟", type: "📖 图文详解", free: true,
    banner: ["💴","+","✈️","+","📦","=","💰"],
    bannerLabels: ["进价","","运费","","平台费","","售价"],
    steps: [
      { img: "💴", title: "第1步：确认进价", detail: "1688拿货价就是进价。比如：一个毛绒玩具，1688进价¥18/件。注意最小起订量是多少件" },
      { img: "✈️", title: "第2步：加头程运费（每件）", detail: "Ozon（俄罗斯）RETS：约¥30/件；Shopee（东南亚）：约¥5/件。这是每件商品必须承担的固定成本" },
      { img: "📦", title: "第3步：算平台佣金", detail: "Ozon约10-15%；Shopee约2-6%；TikTok约2-8%。把这个比例算进去，定价要覆盖" },
      { img: "🧮", title: "📌 傻瓜公式", detail: "建议售价 = (进价 + 头程运费) × 3\n例：进价¥18 + 运费¥30 = 成本¥48 × 3 = 售价¥144（约1600卢布）\n利润率约33%，扣佣金后净利约20-25%" },
      { img: "⚠️", title: "红线：利润<20%就换款", detail: "算出来净利润低于20%就放弃这款，换进价更低的。跨境利润太薄，汇率一波动就亏了" },
    ],
  },
  {
    id: 4, tag: "🌍 平台篇", tagColor: "bg-purple-100 text-purple-600",
    title: "《Ozon vs Shopee vs TikTok Shop：新手到底选哪个？》",
    desc: "三个平台优缺点一图看懂。不同阶段选不同平台，这节课帮你做决定。",
    duration: "15分钟", type: "📖 图文详解", free: true,
    banner: ["🇷🇺","VS","🌏","VS","🎵"],
    bannerLabels: ["Ozon","","Shopee","","TikTok"],
    steps: [
      { img: "🇷🇺", title: "Ozon（俄罗斯）：新手首选 🏆", detail: "✅ 竞争小、利润高30-50%、客单价高\n⚠️ 需科学上网、物流贵¥30+/件、语言障碍（AI翻译解决）\n👉 新手第一站选Ozon，蓝海市场，最容易赚第一桶金" },
      { img: "🌏", title: "Shopee（东南亚）：走量之选", detail: "✅ 运费超便宜¥2-8/件、国内直连不需科学上网\n⚠️ 价格战激烈、利润薄15-25%、退货率高\n👉 先跑通Ozon，再加上Shopee走量" },
      { img: "🎵", title: "TikTok Shop：内容创作者选", detail: "✅ 佣金最低2-8%、爆单快\n⚠️ 必须有视频内容、流量不稳定\n👉 会拍短视频的选它；不会的先跳过" },
      { img: "📋", title: "推荐开店顺序", detail: "第1阶段：只做Ozon，跑通第一单\n第2阶段：Ozon稳定后加Shopee\n第3阶段：多平台铺开，Crossly一键同步\n❌ 不建议同时开三个，精力分散三个都做不好" },
    ],
  },
  {
    id: 5, tag: "📸 图片篇", tagColor: "bg-pink-100 text-pink-600",
    title: "《用手机拍出爆款主图：不需要摄影基础》",
    desc: "1688的图片不能直接用！教你5分钟用手机拍一张比供应商更好看的白底主图。",
    duration: "10分钟", type: "📖 图文详解", free: true,
    banner: ["📦","→","🤳","→","✂️","→","🖼️"],
    bannerLabels: ["收到货","","手机拍","","AI抠图","","完美主图"],
    steps: [
      { img: "🏠", title: "第1步：布置拍摄场景（30秒）", detail: "找一张白色A4纸铺在桌上当背景 → 靠近窗户利用自然光 → 不要开室内灯（会有黄色色差）→ 商品放纸中央" },
      { img: "📱", title: "第2步：手机拍摄技巧", detail: "开「人像模式」→ 商品占画面80%以上 → 从正面/45度/俯视各拍一张 → 选最清晰的那张" },
      { img: "✂️", title: "第3步：AI一键抠图换白底", detail: "打开 remove.bg（免费）→ 上传照片 → 5秒自动抠图换白底 → 下载。平台要求白底主图，这步必做" },
      { img: "📏", title: "第4步：裁剪压缩", detail: "手机相册「编辑」裁成正方形1:1 → 用TinyPNG.com免费压缩文件大小 → 上传更快、不影响画质" },
      { img: "🚫", title: "主图5大禁忌（必看）", detail: "❌ 不能有水印（平台降权）\n❌ 不能有促销文字（违规）\n❌ 不能直接用供应商图（可能侵权）\n❌ 背景不能有其他物品\n✅ 白底、居中、清晰、真实" },
    ],
  },
  {
    id: 6, tag: "🤝 货代篇", tagColor: "bg-teal-100 text-teal-600",
    title: "《怎么找到靠谱货代？避开黑货代的5个套路》",
    desc: "在义乌见过太多宝妈被黑货代坑：货丢了、延误了、乱收费。识别好货代的3个标准在这里。",
    duration: "20分钟", type: "📖 图文详解", free: false,
    banner: ["🔍","→","✅","→","🧪","→","🤝"],
    bannerLabels: ["找货代","","问3问题","","先发5件","","长期合作"],
    steps: [
      { img: "🔍", title: "第1步：怎么找货代", detail: "微信/抖音搜「义乌Ozon货代」或「义乌Shopee货代」→ 加微信询价 → 同时联系3-5家对比价格和服务" },
      { img: "❓", title: "第2步：必问的3个问题", detail: "① 帮不帮贴平台标签？（不贴标的不用）\n② 丢件怎么赔偿？（要书面保证）\n③ 超重从多少克开始计费？（问清楚避免后期纠纷）" },
      { img: "🚨", title: "黑货代的5个套路", detail: "① 先低价后乱加费\n② 故意称错重量多收钱\n③ 丢件说「正常损耗」不赔\n④ 贴标错误导致平台处罚\n⑤ 货代突然跑路（义乌真实案例）" },
      { img: "🧪", title: "第3步：先发5件测合作", detail: "第一次合作先发5件 → 确认：货物完好/时效准确/贴标正确 → 确认靠谱再批量合作" },
    ],
  },
  {
    id: 7, tag: "🛠️ 工具篇", tagColor: "bg-indigo-100 text-indigo-600",
    title: "《全网对比：店小秘 vs 秒手 vs 芒果店长，新手宝妈到底用哪个？》",
    desc: "把三个工具都研究了一遍，结论很简单——用Crossly选品，用秒手上货，这是新手黄金搭配。",
    duration: "25分钟", type: "📖 图文详解", free: true, hot: true,
    banner: ["🏆","🥈","🥉"],
    bannerLabels: ["秒手·新手首选","店小秘·多平台","芒果·进阶用"],
    steps: [
      { img: "⚡", title: "🏆 秒手：新手首选（力荐）", detail: "专为Ozon设计，界面最简单。1688找好商品 → 复制链接给秒手 → 一键上架Ozon，信息自动填入。新手5分钟能学会" },
      { img: "🗂️", title: "🥈 店小秘：多平台必备", detail: "支持Ozon+Shopee+Lazada+TikTok多平台管理，功能全但略复杂。建议：先用秒手跑通Ozon第一单，再升级到店小秘" },
      { img: "🥭", title: "🥉 芒果店长：进阶用户", detail: "功能最强价格也最贵，有数据分析/库存/自动补货。月流水过万、SKU超100个再考虑，新手完全不需要" },
      { img: "🎯", title: "💡 推荐搭配", detail: "✅ Crossly → 选品+算利润（免费）\n✅ 秒手 → 从1688一键上货到Ozon（免费）\n✅ 店小秘 → 做多平台后升级\n\n零成本起步，赚到钱再考虑付费工具" },
    ],
  },
];

function CoursePage() {
  const [openId, setOpenId] = useState<number | null>(null);
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="-mx-6 -mt-6 mb-6 px-6 py-8 text-white text-center"
        style={{ background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)" }}>
        <div className="text-4xl mb-2">📚</div>
        <h1 className="text-xl font-black mb-1">小学生私房课</h1>
        <p className="text-sm text-orange-100 leading-relaxed">
          我在义乌北苑，仓库就在脚下<br/>
          <span className="font-semibold text-white">你在家，就像和娘家人一起做生意</span>
        </p>
        <div className="flex justify-center gap-4 mt-4 text-xs text-orange-200">
          <span>🎬 6节课</span>
          <span>·</span>
          <span>🆓 5节免费</span>
          <span>·</span>
          <span>📍 义乌北苑实地录制</span>
        </div>
      </div>

      {/* 老师介绍 */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-2xl flex-shrink-0">👨‍💼</div>
        <div>
          <p className="font-black text-gray-900 text-sm">义乌小学生 🎒</p>
          <p className="text-xs text-gray-500 mt-0.5">常驻义乌北苑 · 跨境学徒 · 帮2000+宝妈开启第一单</p>
          <p className="text-xs text-orange-600 mt-1 font-medium">「我也是新手过来的，把踩过的坑都告诉你」</p>
        </div>
      </div>

      {/* 课程列表 */}
      <div className="space-y-3">
        {COURSES.map(course => (
          <div key={course.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <button className="w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors" onClick={() => setOpenId(openId === course.id ? null : course.id)}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${course.tagColor}`}>{course.tag}</span>
                    <span className="text-[10px] text-gray-400">{course.type}</span>
                    <span className="text-[10px] text-gray-400">⏱ {course.duration}</span>
                    {course.hot && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">🔥 热门</span>}
                    {course.free
                      ? <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-bold">🆓 免费</span>
                      : <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-bold">给Crossly充电后解锁</span>}
                  </div>
                  <p className="text-sm font-bold text-gray-900 leading-snug">{course.title}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg flex-shrink-0 mt-1 font-medium transition-colors ${openId === course.id ? "bg-gray-100 text-gray-500" : "bg-orange-50 text-orange-500"}`}>
                  {openId === course.id ? "收起▲" : "查看▼"}
                </span>
              </div>
            </button>
            {openId === course.id && (
              <div className="border-t border-gray-50">
                {/* 流程图横幅 */}
                {course.banner && (
                  <div className="flex items-center justify-center gap-1 bg-gray-50 px-4 py-2.5 overflow-x-auto">
                    {course.banner.map((icon: string, i: number) => (
                      <div key={i} className="flex flex-col items-center flex-shrink-0">
                        <span className={`${icon === "→" || icon === "+" || icon === "=" || icon === "VS" ? "text-gray-300 text-sm" : "text-xl"}`}>{icon}</span>
                        {course.bannerLabels?.[i] && <span className="text-[8px] text-gray-400 mt-0.5 whitespace-nowrap">{course.bannerLabels[i]}</span>}
                      </div>
                    ))}
                  </div>
                )}
                <div className="px-4 pb-4 pt-3 space-y-3">
                  <p className="text-xs text-gray-500 leading-relaxed bg-orange-50 rounded-xl px-3 py-2.5 border-l-2 border-orange-300">
                    💬 {course.desc}
                  </p>
                  {/* 图文步骤卡片 */}
                  {course.steps.map((s: {img: string; title: string; detail: string}, i: number) => (
                    <div key={i} className="flex gap-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 flex items-center justify-center text-xl flex-shrink-0">
                        {s.img}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 mb-1">{s.title}</p>
                        <p className="text-[11px] text-gray-500 leading-relaxed whitespace-pre-line">{s.detail}</p>
                      </div>
                    </div>
                  ))}
                  {course.free ? (
                    <button onClick={() => setOpenId(null)}
                      className="w-full py-2 rounded-xl text-xs font-medium text-gray-400 border border-gray-100 hover:bg-gray-50 transition-colors">
                      已读完 · 收起 ▲
                    </button>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-2">给 Crossly 充电 ¥9.9 解锁全部课程</p>
                      <button className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gray-800">
                        🔋 充电解锁
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center mt-6 text-xs text-gray-400">
        <p>📍 小学生常驻义乌北苑实地录制</p>
        <p className="mt-1">更多课程陆续更新中 · 永远不收学费 · 真正帮你赚到钱</p>
      </div>
    </div>
  );
}

// ── 实时战报数据 ────────────────────────────────────────────
const BATTLE_REPORTS = [
  { city: "南京", role: "宝妈", platform: "Ozon", product: "毛绒玩偶", profit: 58, time: "2分钟前" },
  { city: "义乌", role: "摆摊小哥", platform: "Shopee", product: "家居收纳盒", profit: 34, time: "5分钟前" },
  { city: "广州", role: "大学生", platform: "TikTok Shop", product: "美妆工具", profit: 92, time: "8分钟前" },
  { city: "杭州", role: "宝妈", platform: "Ozon", product: "棉花娃娃", profit: 147, time: "12分钟前" },
  { city: "深圳", role: "上班族", platform: "Lazada", product: "手机支架", profit: 41, time: "15分钟前" },
  { city: "成都", role: "宝妈", platform: "Ozon", product: "卡皮巴拉玩偶", profit: 76, time: "18分钟前" },
  { city: "温州", role: "个体户", platform: "Shopee", product: "针织手套", profit: 23, time: "22分钟前" },
  { city: "武汉", role: "宝妈", platform: "Ozon", product: "鳄鱼长条枕", profit: 88, time: "25分钟前" },
  { city: "北京", role: "自由职业", platform: "TikTok Shop", product: "宠物逗猫棒", profit: 55, time: "31分钟前" },
  { city: "苏州", role: "宝妈", platform: "Ozon", product: "睫毛夹套装", profit: 39, time: "38分钟前" },
];

function BattleReportBar() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % BATTLE_REPORTS.length), 3500);
    return () => clearInterval(t);
  }, []);
  const r = BATTLE_REPORTS[idx];
  return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-xs overflow-hidden">
      <span className="text-green-500 animate-pulse flex-shrink-0">🟢</span>
      <p className="text-green-800 flex-1 truncate">
        <span className="font-bold">恭喜{r.city}的{r.role}</span>，通过 Crossly 在 {r.platform} 卖出「{r.product}」，
        <span className="font-black text-green-600">净利 ¥{r.profit}</span> 🎉
      </p>
      <span className="text-green-400 flex-shrink-0 text-[10px]">{r.time}</span>
    </div>
  );
}

function LandingPage({ onStart }: { onStart: () => void }) {
  const { user } = useAuth();
  const [showInstall, setShowInstall] = useState(false);
  const [posterItem, setPosterItem] = useState<null | {img: string; name: string; nameEn: string; price: number; suggestRub: number; suggestUsd: number}>(null);

  const generatePoster = (item: typeof posterItem) => {
    if (!item) return;
    const canvas = document.createElement("canvas");
    canvas.width = 750; canvas.height = 1000;
    const ctx = canvas.getContext("2d")!;
    // 背景渐变
    const grad = ctx.createLinearGradient(0, 0, 0, 1000);
    grad.addColorStop(0, "#0f172a"); grad.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 750, 1000);
    // 大Emoji
    ctx.font = "200px serif"; ctx.textAlign = "center";
    ctx.fillText(item.img, 375, 320);
    // 商品名
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 42px sans-serif";
    ctx.fillText(item.name, 375, 420);
    // 英文名
    ctx.fillStyle = "#94a3b8"; ctx.font = "28px sans-serif";
    ctx.fillText(item.nameEn, 375, 470);
    // 分隔线
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(100, 510); ctx.lineTo(650, 510); ctx.stroke();
    // 价格信息
    ctx.fillStyle = "#fbbf24"; ctx.font = "bold 36px sans-serif";
    ctx.fillText(`进价 ¥${item.price}  →  建议售价 ₽${item.suggestRub}`, 375, 570);
    ctx.fillStyle = "#94a3b8"; ctx.font = "26px sans-serif";
    ctx.fillText(`约 $${item.suggestUsd} USD`, 375, 615);
    // Crossly品牌
    ctx.fillStyle = "#6366f1"; ctx.font = "bold 32px sans-serif";
    ctx.fillText("Crossly · 让跨境像微商一样简单", 375, 700);
    ctx.fillStyle = "#475569"; ctx.font = "24px sans-serif";
    ctx.fillText("crossly.cn  |  免费开始跨境", 375, 745);
    // 下载
    const link = document.createElement("a");
    link.download = `crossly-${item.name}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-5 pb-8">
    {showInstall && <ExtensionInstallModal onClose={() => setShowInstall(false)} />}

      {/* ── Hero 全幅深色 ── */}
      <div className="-mx-6 -mt-6 relative overflow-hidden text-center"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
        <div className="absolute inset-0 opacity-25 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 25% 50%, #6366f1 0%, transparent 55%), radial-gradient(circle at 75% 25%, #a855f7 0%, transparent 45%)" }} />
        <div className="relative z-10 px-6 pt-10 pb-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/70 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-white/20">
            🚀 Crossly · 让跨境像微商一样简单
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight mb-4">
            让跨境像<span style={{ background: "linear-gradient(90deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>微商</span>一样简单
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 mb-6 text-left max-w-xl mx-auto">
            {[
              { icon: "✨", t: "我们不只提供工具，我们提供可能", s: "普通人也能轻松开启跨境之路" },
              { icon: "🚫", t: "零基础：无需外语，无需PS", s: "AI帮你翻译标题、处理图片" },
              { icon: "📚", t: "零门槛：全网干货免费学", s: "不卖课，不收智商税，永久免费" },
              { icon: "⚡", t: "全自动：复制链接交给我们", s: "30秒一件商品，全球平台同步" },
            ].map(c => (
              <div key={c.t} className="flex items-start gap-3 bg-white/10 rounded-2xl px-4 py-3 border border-white/10">
                <span className="text-lg flex-shrink-0">{c.icon}</span>
                <div>
                  <p className="text-white font-bold text-xs leading-snug mb-0.5">{c.t}</p>
                  <p className="text-white/45 text-[10px]">{c.s}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3">
            <button onClick={onStart}
              className="px-8 py-3 rounded-2xl text-sm font-black text-white shadow-xl transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {user ? "进入工作台 →" : "免费开始，不用注册 →"}
            </button>
            <span className="text-white/30 text-xs">无需信用卡</span>
          </div>
          {/* 插件入口 */}
          <div className="mt-4 flex items-center justify-center">
            <button onClick={() => setShowInstall(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white/80 hover:text-white text-xs font-medium px-4 py-2.5 rounded-full transition-all">
              <span className="text-base">🧩</span>
              <span>安装Chrome插件，从1688一键搬运商品</span>
              <span className="text-white/50 text-sm">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 实时战报 ── */}
      <BattleReportBar />

      {/* ── 3大核心优势 ── */}
      <div className="space-y-3">
        <h2 className="text-center text-base font-black text-gray-900">为什么选 Crossly？</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: "📦", title: "无货源无库存", desc: "有订单才下单，货代全代办，永远不摸货不压钱", color: "from-indigo-50 to-blue-50", border: "border-indigo-100", tag: "零风险" },
            { emoji: "🆓", title: "注册不要钱", desc: "基础功能永久免费，100件商品额度，赚到钱再支持", color: "from-purple-50 to-indigo-50", border: "border-purple-100", tag: "零成本" },
            { emoji: "🛡️", title: "卖不出去没损失", desc: "先发5件测款，只花200-300元，卖不动随时换款", color: "from-pink-50 to-rose-50", border: "border-pink-100", tag: "零损失" },
          ].map(c => (
            <div key={c.title} className={`bg-gradient-to-br ${c.color} border ${c.border} rounded-2xl p-4 text-center`}>
              <div className="text-2xl mb-2">{c.emoji}</div>
              <div className="text-[10px] font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-full inline-block mb-1.5">{c.tag}</div>
              <p className="font-black text-gray-900 text-xs mb-1">{c.title}</p>
              <p className="text-[10px] text-gray-500 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 数据大字报 ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { num: "30秒", label: "完成一件商品上架", sub: "从链接到发布全自动" },
          { num: "0元", label: "学费永远免费", sub: "不卖课·不收智商税" },
          { num: "100件", label: "免费商品额度", sub: "够你跑通第一单" },
        ].map(d => (
          <div key={d.num} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-indigo-600 mb-0.5">{d.num}</p>
            <p className="text-xs font-bold text-gray-800">{d.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{d.sub}</p>
          </div>
        ))}
      </div>

      {/* ── 邀请激励 ── */}
      <div className="rounded-2xl overflow-hidden border border-indigo-100"
        style={{ background: "linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)" }}>
        <div className="px-4 py-4 flex items-center gap-3">
          <div className="text-3xl flex-shrink-0">🎁</div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-gray-900 text-sm mb-0.5">邀请好友，一起做跨境</p>
            <p className="text-xs text-gray-500 leading-relaxed">你的好友注册 Crossly，你们<span className="text-indigo-600 font-bold">各得50次AI翻译额度</span>——越多人用，你们都赚得越多</p>
          </div>
          <button onClick={() => {
            const link = `${window.location.origin}?ref=${user?.id || "friend"}`;
            navigator.clipboard.writeText(link);
            alert("✅ 邀请链接已复制！分享给宝妈群吧～");
          }} className="flex-shrink-0 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-xl transition-colors">
            复制邀请链接
          </button>
        </div>
        <div className="grid grid-cols-3 divide-x divide-indigo-100 border-t border-indigo-100 bg-white/50">
          {[
            { num: "50次", label: "AI翻译额度", sub: "你和好友各得" },
            { num: "无上限", label: "邀请人数", sub: "邀多少得多少" },
            { num: "永久有效", label: "奖励不过期", sub: "赚到就是你的" },
          ].map(d => (
            <div key={d.label} className="text-center py-2.5">
              <p className="text-sm font-black text-indigo-600">{d.num}</p>
              <p className="text-[10px] font-bold text-gray-700">{d.label}</p>
              <p className="text-[9px] text-gray-400">{d.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 全球平台对比 ── */}
      <div>
        <h2 className="text-center text-base font-black text-gray-900 mb-1">选哪个平台？🌍</h2>
        <p className="text-center text-xs text-gray-400 mb-3">没有最好，只有最适合你的</p>
        <div className="space-y-2">
          {[
            { flag: "🇷🇺", name: "Ozon", region: "俄罗斯", score: 92, color: "#6366f1", pros: "竞争小·利润高·新手友好", cons: "需科学上网", tag: "新手首选 🏆", tagBg: "bg-indigo-500" },
            { flag: "🌏", name: "Shopee", region: "东南亚·台湾", score: 75, color: "#f59e0b", pros: "走量快·物流便宜·中国卖家熟悉", cons: "价格战激烈·利润薄", tag: "走量之选", tagBg: "bg-amber-500" },
            { flag: "🎵", name: "TikTok Shop", region: "东南亚·美国·英国", score: 78, color: "#ec4899", pros: "爆单快·佣金低·年轻用户多", cons: "需要拍视频·流量不稳", tag: "内容创作者", tagBg: "bg-pink-500" },
            { flag: "🌟", name: "Lazada", region: "马来西亚·泰国", score: 65, color: "#10b981", pros: "阿里系·物流稳定·门槛低", cons: "流量不如Shopee", tag: "东南亚补充", tagBg: "bg-emerald-500" },
            { flag: "🇧🇷", name: "Mercado Libre", region: "巴西·墨西哥", score: 70, color: "#8b5cf6", pros: "竞争极少·增长快·利润高", cons: "物流复杂·语言障碍", tag: "蓝海市场", tagBg: "bg-violet-500" },
            { flag: "📦", name: "亚马逊", region: "美国·欧洲·日本", score: 45, color: "#ef4444", pros: "流量最大·品牌背书强", cons: "门槛高·竞争极激烈·封号风险", tag: "进阶再来", tagBg: "bg-red-500" },
          ].map(p => (
            <div key={p.name} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-xl flex-shrink-0">{p.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-sm">{p.name}</span>
                  <span className="text-[9px] text-gray-400">{p.region}</span>
                  <span className={`text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full flex-shrink-0 ${p.tagBg}`}>{p.tag}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="h-full rounded-full" style={{ width: `${p.score}%`, background: p.color }} />
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{p.score}分</span>
                </div>
                <p className="text-[10px] text-green-600 truncate">✅ {p.pros}</p>
                <p className="text-[10px] text-red-400 truncate">⚠️ {p.cons}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-gray-300 mt-2">Crossly 支持全平台一键上架，你选平台，我们搞定其余</p>
      </div>

      {/* 广告位1 */}
      <div className="border border-dashed border-yellow-300 rounded-xl px-4 py-3 bg-yellow-50 text-center text-xs text-yellow-700 cursor-pointer hover:bg-yellow-100 transition-colors" title="投广告：aqiliaobi@163.com">
        📣 <strong>广告位招租</strong> · 你的品牌可以出现在这里 · 每天有真实跨境卖家经过 · 价格比你想象的便宜
      </div>

      {/* ── 爆款品类 ── */}
      <div>
        <h2 className="text-center text-base font-black text-gray-900 mb-1">现在卖什么最赚？🔥</h2>
        <p className="text-center text-xs text-gray-400 mb-3">经验证的爆款品类，新手首选</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { e: "🧸", c: "毛绒玩具", p: "30-50%", h: true, t: "全球通吃" },
            { e: "💄", c: "美妆工具", p: "25-40%", t: "女性必买" },
            { e: "🏠", c: "家居收纳", p: "20-35%", t: "高复购" },
            { e: "🐾", c: "宠物玩具", p: "35-55%", h: true, t: "新风口" },
            { e: "🎮", c: "手机配件", p: "15-30%", t: "刚需走量" },
            { e: "🎁", c: "节日礼品", p: "40-60%", t: "季节爆单" },
          ].map(c => (
            <div key={c.c} className="bg-white border border-gray-100 rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{c.e}</div>
              <p className="text-xs font-bold text-gray-900">{c.c}</p>
              <p className="text-[10px] text-green-600 font-semibold">{c.p}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {c.h && <span className="text-[9px] bg-red-500 text-white px-1 py-0.5 rounded-full font-bold">热</span>}
                <span className="text-[9px] text-gray-400">{c.t}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 爆款库看板 ── */}
      <div>
        <h2 className="text-center text-base font-black text-gray-900 mb-1">🏆 小学生爆款库（全球）</h2>
        <p className="text-center text-xs text-gray-400 mb-3">真实在售商品 · AI已生成外语标题 · 点击复制搬运</p>
        <div className="columns-2 gap-2 space-y-2">
          {[
            { img: "🧸", name: "超大奶龙毛绒玩偶 60cm", nameEn: "Giant Nailong Plush Toy 60cm", price: 28, suggestRub: 1290, suggestUsd: 14.9, hot: true },
            { img: "🐱", name: "治愈系猫咪抱枕 45cm", nameEn: "Healing Cat Plush Pillow 45cm", price: 18, suggestRub: 890, suggestUsd: 9.9, hot: true },
            { img: "🐊", name: "鳄鱼长条抱枕 120cm", nameEn: "Crocodile Long Body Pillow 120cm", price: 32, suggestRub: 1490, suggestUsd: 16.9, hot: false },
            { img: "🦛", name: "卡皮巴拉水豚玩偶 35cm", nameEn: "Capybara Stuffed Animal 35cm", price: 22, suggestRub: 1090, suggestUsd: 11.9, hot: true },
            { img: "💄", name: "旋转睫毛夹 定型持久", nameEn: "Rotating Eyelash Curler Long-lasting", price: 8, suggestRub: 490, suggestUsd: 5.9, hot: true },
            { img: "🪄", name: "气垫梳 防静电按摩梳", nameEn: "Air Cushion Massage Comb Anti-static", price: 6, suggestRub: 390, suggestUsd: 4.9, hot: false },
            { img: "📦", name: "桌面收纳盒 透明叠加", nameEn: "Desktop Storage Box Clear Stackable", price: 12, suggestRub: 590, suggestUsd: 6.9, hot: false },
            { img: "🧲", name: "磁吸手机支架 360旋转", nameEn: "Magnetic Phone Holder 360° Rotation", price: 15, suggestRub: 790, suggestUsd: 8.9, hot: true },
            { img: "🐾", name: "猫咪隧道玩具 折叠", nameEn: "Cat Tunnel Toy Foldable", price: 20, suggestRub: 990, suggestUsd: 10.9, hot: true },
            { img: "🌙", name: "星空投影小夜灯 USB", nameEn: "Star Projector Night Light USB", price: 25, suggestRub: 1190, suggestUsd: 12.9, hot: false },
            { img: "🎎", name: "棉花娃娃素体 20cm", nameEn: "Cotton Doll Body Base 20cm", price: 16, suggestRub: 790, suggestUsd: 8.9, hot: true },
            { img: "✨", name: "UV树脂DIY材料包", nameEn: "UV Resin DIY Craft Kit", price: 19, suggestRub: 890, suggestUsd: 9.9, hot: false },
          ].map((item, idx) => (
            <div key={idx} className="break-inside-avoid bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-2">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-5xl py-6">
                {item.img}
              </div>
              <div className="p-3">
                {item.hot && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold mr-1">🔥 热卖</span>}
                <p className="text-xs font-bold text-gray-900 mt-1 leading-snug">{item.name}</p>
                <p className="text-[10px] text-blue-500 mt-0.5 leading-snug truncate">🌍 {item.nameEn}</p>
                <div className="mt-2 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">进价</span>
                    <span className="text-xs font-bold text-gray-700">¥{item.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">建议售价</span>
                    <span className="text-[10px] font-bold text-indigo-600">₽{item.suggestRub} / ${item.suggestUsd}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(item.name)}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                    复制标题
                  </button>
                  <button
                    onClick={() => generatePoster(item)}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-white bg-pink-500 hover:bg-pink-600 transition-colors">
                    🖼️ 生成海报
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-gray-300 mt-2">更多爆款持续更新 · 由小学生团队精选</p>
      </div>

      {/* 广告位2 */}
      <div className="border border-dashed border-blue-200 rounded-xl px-4 py-3 bg-blue-50 text-center text-xs text-blue-600 cursor-pointer hover:bg-blue-100 transition-colors" title="投广告：aqiliaobi@163.com">
        🚢 <strong>货代/物流公司广告位</strong> · 全国跨境卖家每天都在看 · 你的电话号码放这，订单自己来找你 · <span className="underline">合作联系 →</span>
      </div>

      {/* ── 用户故事 ── */}
      <div>
        <h2 className="text-center text-base font-black text-gray-900 mb-3">普通人，真的做到了 💬</h2>
        <div className="space-y-3">
          {[
            { avatar: "👩", name: "小美，宝妈", tag: "义乌·Shopee·做了3个月", text: "娃在睡觉，我用手机把第一件毛绒玩具上架到Shopee。那天下午收到第一个订单，真的哭了。原来我也可以。" },
            { avatar: "👨‍🎓", name: "阿俊，大学生", tag: "广州·东南亚市场·大三在读", text: "用Crossly把商品卖到东南亚，每月稳定赚1000多块外币。这个月生活费不用问家里要了。" },
            { avatar: "👩‍💼", name: "晓玲，上班族", tag: "深圳·TikTok Shop·会计", text: "下班刷1688找款，复制链接一键发布，AI自动翻译。第二天上班路上收到出单通知。这就是我想要的副业。" },
          ].map(u => (
            <div key={u.name} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-lg flex-shrink-0">{u.avatar}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900">{u.name}</span>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{u.tag}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">"{u.text}"</p>
                <p className="text-yellow-400 text-xs mt-1.5">⭐⭐⭐⭐⭐</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 广告位3 */}
      <div className="border border-dashed border-green-200 rounded-xl px-4 py-3 bg-green-50 text-center text-xs text-green-700 cursor-pointer hover:bg-green-100 transition-colors" title="投广告：aqiliaobi@163.com">
        🏪 <strong>1688店铺/供货商广告位</strong> · 这里的用户正在找货源 · 你的爆款在这展示，他们直接下单 · 老板这不比打广告费钱强？
      </div>

      {/* ── 消除顾虑 ── */}
      <div>
        <h2 className="text-center text-base font-black text-gray-900 mb-3">你在担心什么？🙋</h2>
        <div className="space-y-2">
          {[
            { q: "不懂外语能做吗？", a: "完全没问题！AI自动翻译标题和描述，你一个字母不用认识" },
            { q: "没仓库，货放哪？", a: "不需要仓库！有订单才去1688下单，发到义乌货代，全程不摸货" },
            { q: "卖不出去怎么办？", a: "先发5件测款，最多亏200-300元，换来真实市场反馈，随时换款" },
            { q: "每天只有1-2小时够吗？", a: "够！熟练后每天1小时能上架3-5件，很多宝妈利用娃睡觉时间做" },
            { q: "Crossly收费贵吗？", a: "基础功能永久免费，支持费¥9.9/月，相当于给服务器买杯奶茶" },
          ].map(item => (
            <div key={item.q} className="bg-white border border-gray-100 rounded-xl px-4 py-3">
              <p className="text-sm font-bold text-gray-800 mb-1">❓ {item.q}</p>
              <p className="text-xs text-gray-500 leading-relaxed pl-3 border-l-2 border-indigo-200">💡 {item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 广告位4 */}
      <div className="border border-dashed border-purple-200 rounded-xl px-4 py-3 bg-purple-50 text-center text-xs text-purple-700 cursor-pointer hover:bg-purple-100 transition-colors" title="投广告：aqiliaobi@163.com">
        🤝 <strong>跨境服务商广告位</strong> · ERP·摄影·选品·财税·运营外包 · 你家服务正是他们需要的 · 老板不投广告你等什么呢？
      </div>

      {/* ── 给Crossly充电 ── */}
      <div className="rounded-2xl overflow-hidden border border-pink-100 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="p-5 text-center">
          <div className="text-3xl mb-2">🔋</div>
          <h2 className="text-base font-black text-gray-900 mb-1">给 Crossly 充个电？</h2>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            所有功能永远免费开放。但服务器、AI翻译都需要成本。<br/>
            <span className="text-pink-600 font-semibold">如果帮到了你，请支持我们活下去 ❤️</span>
          </p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { e: "🧋", l: "喝杯奶茶", p: "¥9.9", s: "跑1天服务器" },
              { e: "🍜", l: "一顿午饭", p: "¥19.9", s: "感谢最多 🙏", hot: true },
              { e: "💪", l: "一年支持", p: "¥69", s: "最强后盾" },
            ].map(p => (
              <div key={p.l} className={`rounded-xl p-3 text-center border-2 relative bg-white ${p.hot ? "border-pink-400 shadow-md" : "border-pink-100"}`}>
                {p.hot && <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">感谢最多</div>}
                <div className="text-lg mb-0.5">{p.e}</div>
                <p className="text-[10px] text-gray-500">{p.l}</p>
                <p className={`text-lg font-black ${p.hot ? "text-pink-500" : "text-gray-800"}`}>{p.p}</p>
                <p className="text-[9px] text-gray-400">{p.s}</p>
              </div>
            ))}
          </div>
          <button onClick={onStart}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}>
            先免费用，赚到钱再支持我们 →
          </button>
          <p className="text-[10px] text-gray-400 mt-2">不充电也完全可以 · 免费额度100件</p>
        </div>
      </div>

      {/* ── 最终CTA ── */}
      <div className="text-center py-4">
        <p className="text-xl font-black text-gray-900 mb-2">跨境，从今天开始。</p>
        <p className="text-xs text-gray-400 mb-4">不需要经验，不需要资金，不需要仓库。只需要一部手机。</p>
        <button onClick={onStart}
          className="px-10 py-3 rounded-2xl text-sm font-black text-white shadow-xl transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)" }}>
          现在开始，完全免费 →
        </button>
        <p className="text-[10px] text-gray-300 mt-2">无需注册 · 无需信用卡 · 随时退出</p>
        <p className="text-[10px] text-gray-400 mt-2">
          <button onClick={() => setShowInstall(true)} className="underline hover:text-gray-600 transition-colors">
            🧩 安装Chrome插件，从1688一键搬运
          </button>
        </p>
      </div>

    </div>
  );
}
