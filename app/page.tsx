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
// 幽默广告位（固定，不滚动，随机切换）
const AD_SLOTS = [
  "📦 广告位招租 · 老板还在送外卖给服务器续命，有没有好心人搭把手？",
  "🍜 广告位招租 · 我们的服务器靠一碗泡面撑着，你来投广告它就能吃上饭",
  "💸 广告位招租 · 这里可以放你的广告，比朋友圈转发便宜，效果不一定更差",
  "🐶 广告位招租 · 老板的狗狗说：主人又没钱买狗粮了，求大佬投广告",
  "🚀 广告位招租 · 月活数量 = 在涨 · 广告效果 = 未知 · 价格 = 你说了算",
  "☕ 广告位招租 · 老板今天第三杯咖啡了，只为让你看到这行字",
];

function RateBar() {
  const [adIdx] = useState(() => Math.floor(Math.random() * AD_SLOTS.length));
  return (
    <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5 text-xs text-yellow-700 font-medium max-w-md cursor-pointer hover:bg-yellow-100 transition-colors"
      title="联系我们投广告：aqiliaobi@163.com">
      {AD_SLOTS[adIdx]}
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

  return (
    <div className="space-y-5 pb-8">

      {/* ── Hero 全幅深色 ── */}
      <div className="-mx-6 -mt-6 relative overflow-hidden text-center"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
        <div className="absolute inset-0 opacity-25 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 25% 50%, #6366f1 0%, transparent 55%), radial-gradient(circle at 75% 25%, #a855f7 0%, transparent 45%)" }} />
        <div className="relative z-10 px-6 pt-10 pb-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/70 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-white/20">
            🚀 Crossly · 让跨境像微商一样简单
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            让跨境像<span style={{ background: "linear-gradient(90deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>微商</span>一样简单
          </h1>
          <div className="grid grid-cols-2 gap-3 mb-6 text-left max-w-xl mx-auto">
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
        </div>
      </div>

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
      </div>

    </div>
  );
}
