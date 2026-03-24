"use client";

import { useState } from "react";
import { Product, Settings, calcCost } from "@/lib/types";
import { Trash2, ChevronDown, ChevronUp, ExternalLink, Loader2 } from "lucide-react";

// 翻译按钮组件
function TranslateButton({ product, onUpdate }: { product: Product; onUpdate: (id: string, updates: Partial<Product>) => void }) {
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!product.title || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: product.title }),
      });
      const data = await res.json();
      if (data.result) onUpdate(product.id, { titleRu: data.result });
    } catch {}
    finally { setLoading(false); }
  };

  if (product.titleRu) {
    return (
      <button
        onClick={handleTranslate}
        className="text-xs text-blue-500 hover:text-blue-700 underline"
      >
        {loading ? "翻译中..." : "重新翻译"}
      </button>
    );
  }

  return (
    <button
      onClick={handleTranslate}
      disabled={loading}
      className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2.5 py-1 rounded-full hover:bg-blue-700 disabled:opacity-60 transition-colors"
    >
      {loading ? <Loader2 size={11} className="animate-spin" /> : "🌐"}
      {loading ? "翻译中..." : "AI翻译俄语"}
    </button>
  );
}

interface Props {
  product: Product;
  settings: Settings;
  onUpdate: (id: string, updates: Partial<Product>) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, settings, onUpdate, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const cost = calcCost(product, settings);
  const isProfit = cost.profit > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Main Row */}
      <div className="flex items-start gap-4 p-4">
        {/* Image */}
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0 bg-gray-100"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 text-xs">
            无图片
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
              <p className="text-sm text-blue-600 truncate mt-0.5">{product.titleRu || "（未翻译）"}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {product.sourceUrl && (
                <a
                  href={product.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink size={15} />
                </a>
              )}
              <button
                onClick={() => onDelete(product.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
              >
                {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            </div>
          </div>

          {/* Key metrics */}
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <div className="text-sm">
              <span className="text-gray-400">进价</span>
              <span className="font-semibold text-gray-800 ml-1">¥{product.price}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">重量</span>
              <span className="font-semibold text-gray-800 ml-1">{product.weight}g</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">保本价</span>
              <span className="font-semibold text-orange-600 ml-1">₽{cost.minSellPriceRub}</span>
            </div>
            {/* 翻译按钮 */}
            <TranslateButton product={product} onUpdate={onUpdate} />

            {/* 售价输入 */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-sm text-gray-500">售价</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <span className="bg-gray-50 px-2 py-1.5 text-sm text-gray-500 border-r border-gray-300">₽</span>
                <input
                  type="number"
                  min={0}
                  value={product.sellPriceRub || ""}
                  onChange={(e) => onUpdate(product.id, { sellPriceRub: parseFloat(e.target.value) || 0 })}
                  placeholder="填售价"
                  className="w-24 px-2 py-1.5 text-sm focus:outline-none"
                />
              </div>
              {product.sellPriceRub > 0 && (
                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                  isProfit ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                }`}>
                  {isProfit ? "+" : ""}{cost.profit.toFixed(1)}元 ({cost.profitRate.toFixed(0)}%)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Cost breakdown */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">成本明细</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">进价</span>
                  <span>¥{cost.purchasePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">运费 ({product.weight}g)</span>
                  <span>¥{cost.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">包装</span>
                  <span>¥{cost.packagingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">平台佣金</span>
                  <span>¥{cost.platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-gray-100 pt-1 mt-1">
                  <span>总成本</span>
                  <span className="text-red-600">¥{cost.totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Price analysis */}
            {product.sellPriceRub > 0 && (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2">价格分析</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">售价（卢布）</span>
                    <span>₽{product.sellPriceRub}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">折合人民币</span>
                    <span>¥{cost.sellPriceCny.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">利润</span>
                    <span className={isProfit ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
                      ¥{cost.profit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">利润率</span>
                    <span className={isProfit ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
                      {cost.profitRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Edit fields */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">编辑商品</p>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500">重量（克）</label>
                  <input
                    type="number"
                    value={product.weight}
                    onChange={(e) => onUpdate(product.id, { weight: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">俄语标题</label>
                  <input
                    type="text"
                    value={product.titleRu}
                    onChange={(e) => onUpdate(product.id, { titleRu: e.target.value })}
                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">备注</label>
                  <input
                    type="text"
                    value={product.note}
                    onChange={(e) => onUpdate(product.id, { note: e.target.value })}
                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm mt-0.5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
