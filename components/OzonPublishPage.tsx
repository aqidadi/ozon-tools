"use client";

import { useState, useEffect } from "react";
import { Product, Settings, calcCost, getSellPrice } from "@/lib/types";
import { CheckCircle, XCircle, Loader2, RefreshCw, ExternalLink, Key } from "lucide-react";

interface Props {
  products: Product[];
  settings: Settings;
}

type PublishStatus = "idle" | "loading" | "ok" | "fail";

interface ProductPublishState {
  status: PublishStatus;
  msg: string;
  taskId?: number;
  productId?: number;
  price?: number;
}

export function OzonPublishPage({ products, settings }: Props) {
  const [clientId, setClientId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiOk, setApiOk] = useState<null | boolean>(null);
  const [testing, setTesting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [states, setStates] = useState<Record<string, ProductPublishState>>({});
  const [publishing, setPublishing] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(13);
  const [commission, setCommission] = useState(15);
  const [profitTarget, setProfitTarget] = useState(30);

  useEffect(() => {
    const cfg = localStorage.getItem("ozon-api-config");
    if (cfg) {
      const { clientId: c, apiKey: a } = JSON.parse(cfg);
      setClientId(c || "");
      setApiKey(a || "");
    }
  }, []);

  const testApi = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/ozon/category", {
        headers: { "x-client-id": clientId, "x-api-key": apiKey }
      });
      const data = await res.json();
      if (data.result?.length > 0) {
        setApiOk(true);
        localStorage.setItem("ozon-api-config", JSON.stringify({ clientId, apiKey }));
      } else { setApiOk(false); }
    } catch { setApiOk(false); }
    setTesting(false);
  };

  const calcPrice = (product: Product) => {
    const cost = calcCost(product, settings);
    const existingRub = getSellPrice(product, "RUB");
    if (existingRub > 0) return { sell: existingRub, old: Math.ceil(existingRub * 1.2) };
    const totalCostRub = cost.totalCost * exchangeRate;
    const sell = Math.ceil(totalCostRub / (1 - commission/100) / (1 - profitTarget/100));
    return { sell, old: Math.ceil(sell * 1.2) };
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const selectAll = () => setSelected(new Set(products.map(p => p.id)));
  const clearAll = () => setSelected(new Set());

  const publishOne = async (product: Product): Promise<void> => {
    setStates(prev => ({ ...prev, [product.id]: { status: "loading", msg: "发布中..." } }));
    try {
      const { sell, old } = calcPrice(product);
      const specs = product.specs as Record<string, string> || {};
      const color = specs["颜色"] || specs["颜色分类"] || specs["颜色/图案"] || "";
      const material = specs["材质"] || specs["面料"] || specs["材料"] || "";
      const heightMatch = (product.title || "").match(/(\d+)\s*(cm|см|厘米)/i);
      const height = heightMatch ? parseInt(heightMatch[1]) : null;

      const res = await fetch("/api/ozon/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId || undefined,
          apiKey: apiKey || undefined,
          product: {
            title: product.titleRu || product.title,
            price: sell,
            oldPrice: old,
            weight: product.weight || 400,
            images: product.images || [],
            detailImages: product.detailImages || [],
            description: product.titleRu || product.title,
            color, material, height,
            offerId: product.id,
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setStates(prev => ({ ...prev, [product.id]: { status: "ok", msg: `✅ 已发布 ₽${sell}`, taskId: data.taskId, price: sell } }));
      } else {
        setStates(prev => ({ ...prev, [product.id]: { status: "fail", msg: "❌ " + (data.error || "失败") } }));
      }
    } catch {
      setStates(prev => ({ ...prev, [product.id]: { status: "fail", msg: "❌ 网络错误" } }));
    }
  };

  const publishAll = async () => {
    const toPublish = products.filter(p => selected.has(p.id));
    if (!toPublish.length) return;
    setPublishing(true);
    for (const product of toPublish) {
      await publishOne(product);
      await new Promise(r => setTimeout(r, 600)); // 避免速率限制
    }
    setPublishing(false);
  };

  const successCount = Object.values(states).filter(s => s.status === "ok").length;
  const failCount = Object.values(states).filter(s => s.status === "fail").length;

  return (
    <div className="max-w-4xl space-y-5">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl">🚀</div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Ozon 一键刊登</h1>
          <p className="text-xs text-gray-500">从选品列表批量发布商品到你的Ozon店铺</p>
        </div>
        {successCount > 0 && (
          <div className="ml-auto bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold">
            ✅ 本次已发布 {successCount} 件
          </div>
        )}
      </div>

      {/* API配置卡 */}
      <div className={`rounded-2xl border-2 p-5 ${apiOk === true ? "border-green-300 bg-green-50" : apiOk === false ? "border-red-300 bg-red-50" : "border-blue-200 bg-blue-50"}`}>
        <div className="flex items-center gap-2 mb-3">
          <Key size={16} className="text-blue-600" />
          <span className="text-sm font-bold text-blue-800">Ozon API 连接</span>
          {apiOk === true && <span className="ml-auto flex items-center gap-1 text-green-600 text-xs font-semibold"><CheckCircle size={14}/>已连接</span>}
          {apiOk === false && <span className="ml-auto flex items-center gap-1 text-red-500 text-xs font-semibold"><XCircle size={14}/>连接失败</span>}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Client-Id</label>
            <input value={clientId} onChange={e => setClientId(e.target.value)}
              placeholder="4301277"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Api-Key</label>
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>
        <button onClick={testApi} disabled={testing || !clientId || !apiKey}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {testing ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}
          {testing ? "测试中..." : "测试连接并保存"}
        </button>
      </div>

      {/* 定价参数 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3">📊 批量定价参数</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">汇率 ¥→₽</label>
            <input type="number" value={exchangeRate} onChange={e => setExchangeRate(parseFloat(e.target.value)||13)} step={0.1}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Ozon佣金 %</label>
            <input type="number" value={commission} onChange={e => setCommission(parseFloat(e.target.value)||15)} min={0} max={50}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">目标利润率 %</label>
            <input type="number" value={profitTarget} onChange={e => setProfitTarget(parseFloat(e.target.value)||30)} min={0} max={200}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">💡 已在选品列表设置过售价的商品，直接用设置的价格，不重新计算</p>
      </div>

      {/* 商品列表 */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-gray-500 text-sm">选品列表为空</p>
          <p className="text-gray-400 text-xs mt-1">先去「选品列表」用插件从1688导入商品</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* 工具栏 */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
            <input type="checkbox"
              checked={selected.size === products.length && products.length > 0}
              onChange={e => e.target.checked ? selectAll() : clearAll()}
              className="w-4 h-4 accent-blue-600" />
            <span className="text-xs text-gray-500">
              已选 <strong className="text-gray-800">{selected.size}</strong> / {products.length} 件
            </span>
            <button onClick={selectAll} className="text-xs text-blue-500 hover:underline">全选</button>
            <button onClick={clearAll} className="text-xs text-gray-400 hover:underline">清空</button>
            <div className="ml-auto flex items-center gap-2">
              {failCount > 0 && <span className="text-xs text-red-500">{failCount}件失败</span>}
              <button
                onClick={publishAll}
                disabled={publishing || selected.size === 0 || apiOk !== true}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all"
                style={{ background: publishing ? "#9ca3af" : "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
              >
                {publishing ? <Loader2 size={14} className="animate-spin"/> : "🚀"}
                {publishing ? `发布中 ${successCount}/${selected.size}...` : `一键发布 ${selected.size} 件到 Ozon`}
              </button>
            </div>
          </div>

          {/* 商品行 */}
          <div className="divide-y divide-gray-50">
            {products.map(product => {
              const state = states[product.id];
              const { sell, old } = calcPrice(product);
              const isSelected = selected.has(product.id);

              return (
                <div key={product.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${isSelected ? "bg-blue-50/40" : "hover:bg-gray-50"}`}>
                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(product.id)}
                    className="w-4 h-4 accent-blue-600 flex-shrink-0" />
                  <img
                    src={product.images[0] ? `/api/imgproxy?url=${encodeURIComponent(product.images[0])}` : ""}
                    alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                    style={{ display: product.images[0] ? undefined : "none" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{product.title}</p>
                    {product.titleRu && <p className="text-xs text-blue-500 truncate">{product.titleRu}</p>}
                    {!product.titleRu && <p className="text-xs text-orange-400">⚠️ 无俄文标题，将用中文标题</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                    <span className="text-gray-400">¥{product.price}</span>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">₽{sell}</div>
                      <div className="text-gray-300 line-through text-[10px]">₽{old}</div>
                    </div>
                    <div className="w-28 text-right">
                      {!state && <span className="text-gray-300">未发布</span>}
                      {state?.status === "loading" && <span className="flex items-center gap-1 text-blue-500"><Loader2 size={11} className="animate-spin"/>发布中</span>}
                      {state?.status === "ok" && (
                        <div>
                          <span className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle size={11}/>已发布</span>
                          {product.sourceUrl && (
                            <a href="https://seller.ozon.ru/app/products/list" target="_blank" rel="noopener noreferrer"
                              className="text-[10px] text-blue-400 flex items-center gap-0.5 justify-end hover:underline">
                              Ozon查看<ExternalLink size={9}/>
                            </a>
                          )}
                        </div>
                      )}
                      {state?.status === "fail" && (
                        <div>
                          <span className="text-red-500 text-[10px]">{state.msg}</span>
                          <button onClick={() => publishOne(product)} className="text-[10px] text-blue-400 hover:underline block">重试</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 底部提示 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 space-y-1">
        <p className="font-semibold">⚠️ 注意事项</p>
        <p>• 建议先翻译俄文标题再发布，俄文标题在Ozon搜索权重更高</p>
        <p>• 发布后去 <a href="https://seller.ozon.ru/app/products/list" target="_blank" className="underline">Ozon卖家后台 → 商品列表</a> 查看和补充详细信息</p>
        <p>• 每件发布间隔0.6秒，避免触发Ozon速率限制</p>
      </div>
    </div>
  );
}
