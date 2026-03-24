"use client";

import { useState } from "react";
import { Product, Settings, LANGUAGES, calcCost } from "@/lib/types";
import { Trash2, ChevronDown, ChevronUp, ExternalLink, Loader2, Copy, Check } from "lucide-react";

const LANG_FIELD: Record<string, keyof Product> = {
  ru: "titleRu", en: "titleEn", th: "titleTh",
  vi: "titleVi", id: "titleId", ms: "titleMs", es: "titleEn", ar: "titleEn",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-0.5 text-gray-400 hover:text-blue-600 flex-shrink-0" title="复制">
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
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
  const [selectedLang, setSelectedLang] = useState(product.targetLang || "ru");
  const [translating, setTranslating] = useState(false);
  const cost = calcCost(product, settings);
  const isProfit = product.sellPriceRub > 0 && cost.profit > 0;
  const isLoss = product.sellPriceRub > 0 && cost.profit <= 0;

  const field = LANG_FIELD[selectedLang] || "titleRu";
  const translatedTitle = (product[field] as string) || product.titleRu || "";

  const handleTranslate = async () => {
    if (!product.title || translating) return;
    setTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: product.title, to: selectedLang }),
      });
      const data = await res.json();
      if (data.result) {
        const updates: Partial<Product> = { [field]: data.result, targetLang: selectedLang, titleRu: selectedLang === "ru" ? data.result : product.titleRu };
        onUpdate(product.id, updates);
        await fetch("/api/product-update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: product.id, ...updates }) });
      }
    } catch {} finally { setTranslating(false); }
  };

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-shadow hover:shadow-sm ${expanded ? "border-blue-200" : "border-gray-200"}`}>
      {/* Compact row */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Thumbnail */}
        {product.images[0]
          ? <img src={product.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0 bg-gray-100" />
          : <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 text-[10px]">无图</div>
        }

        {/* Title + translation */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 truncate leading-tight">{product.title}</p>
          {translatedTitle
            ? <div className="flex items-center gap-1"><p className="text-xs text-blue-500 truncate">{translatedTitle}</p><CopyButton text={translatedTitle} /></div>
            : <p className="text-xs text-gray-300 italic">未翻译</p>
          }
        </div>

        {/* Price + cost */}
        <div className="flex items-center gap-3 flex-shrink-0 text-sm">
          <span className="text-gray-400 text-xs">¥{product.price}</span>
          <span className="text-orange-500 text-xs font-medium">₽{cost.minSellPriceRub}起</span>

          {/* 售价输入 */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-400">
            <span className="bg-gray-50 px-1.5 py-1 text-xs text-gray-400 border-r border-gray-200">₽</span>
            <input
              type="number" min={0}
              value={product.sellPriceRub || ""}
              onChange={(e) => onUpdate(product.id, { sellPriceRub: parseFloat(e.target.value) || 0 })}
              placeholder="售价"
              className="w-16 px-1.5 py-1 text-xs focus:outline-none"
            />
          </div>

          {/* 利润 badge */}
          {product.sellPriceRub > 0 && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${isProfit ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
              {isProfit ? "+" : ""}{cost.profit.toFixed(0)}元
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {product.sourceUrl && (
            <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors">
              <ExternalLink size={14} />
            </a>
          )}
          <button onClick={() => onDelete(product.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 text-gray-300 hover:text-gray-700 transition-colors">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 px-3 py-3 bg-gray-50 grid grid-cols-3 gap-3">
          {/* 成本 */}
          <div className="bg-white rounded-lg p-3 border border-gray-100 text-xs space-y-1">
            <p className="font-semibold text-gray-600 mb-1.5">成本明细</p>
            {[
              ["进价", `¥${cost.purchasePrice.toFixed(2)}`],
              [`运费 (${product.weight}g)`, `¥${cost.shippingCost.toFixed(2)}`],
              ["包装", `¥${cost.packagingCost.toFixed(2)}`],
              ["平台佣金", `¥${cost.platformFee.toFixed(2)}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-gray-500"><span>{k}</span><span>{v}</span></div>
            ))}
            <div className="flex justify-between font-bold border-t border-gray-100 pt-1 text-red-600">
              <span>合计</span><span>¥{cost.totalCost.toFixed(2)}</span>
            </div>
          </div>

          {/* 利润 */}
          <div className="bg-white rounded-lg p-3 border border-gray-100 text-xs space-y-1">
            <p className="font-semibold text-gray-600 mb-1.5">利润分析</p>
            <div className="flex justify-between text-gray-500"><span>保本售价</span><span className="font-medium text-orange-600">₽{cost.minSellPriceRub}</span></div>
            {product.sellPriceRub > 0 && <>
              <div className="flex justify-between text-gray-500"><span>当前售价</span><span>₽{product.sellPriceRub}</span></div>
              <div className="flex justify-between text-gray-500"><span>折合人民币</span><span>¥{cost.sellPriceCny.toFixed(2)}</span></div>
              <div className={`flex justify-between font-bold border-t border-gray-100 pt-1 ${isProfit ? "text-green-600" : "text-red-500"}`}>
                <span>利润</span><span>¥{cost.profit.toFixed(2)} ({cost.profitRate.toFixed(0)}%)</span>
              </div>
            </>}
            {!product.sellPriceRub && <p className="text-gray-300 italic">请填写售价</p>}
          </div>

          {/* 编辑 */}
          <div className="bg-white rounded-lg p-3 border border-gray-100 text-xs space-y-2">
            <p className="font-semibold text-gray-600 mb-1.5">编辑 / 翻译</p>
            <div className="flex gap-1">
              <select value={selectedLang} onChange={e => setSelectedLang(e.target.value)}
                className="flex-1 border border-gray-200 rounded px-1 py-1 text-xs bg-white focus:outline-none">
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
              </select>
              <button onClick={handleTranslate} disabled={translating}
                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1">
                {translating ? <Loader2 size={10} className="animate-spin" /> : "🌐"}
                {translating ? "..." : translatedTitle ? "重译" : "翻译"}
              </button>
            </div>
            {translatedTitle && (
              <div className="flex items-center gap-1">
                <input type="text" value={translatedTitle}
                  onChange={e => onUpdate(product.id, { [field]: e.target.value })}
                  className="flex-1 border border-gray-200 rounded px-1.5 py-1 text-xs" />
                <CopyButton text={translatedTitle} />
              </div>
            )}
            <div>
              <label className="text-gray-400">重量(克)</label>
              <input type="number" value={product.weight}
                onChange={e => onUpdate(product.id, { weight: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-200 rounded px-1.5 py-1 text-xs mt-0.5" />
            </div>
            <div>
              <label className="text-gray-400">备注</label>
              <input type="text" value={product.note}
                onChange={e => onUpdate(product.id, { note: e.target.value })}
                className="w-full border border-gray-200 rounded px-1.5 py-1 text-xs mt-0.5" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
