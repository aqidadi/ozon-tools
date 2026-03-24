"use client";

import { useState } from "react";
import { Product, Settings, LANGUAGES, calcCost, getSellPrice, setSellPrice } from "@/lib/types";
import { Trash2, ChevronDown, ChevronUp, ExternalLink, Loader2, Copy, Check, Star, Tag, Image as ImageIcon, LayoutList } from "lucide-react";

const TAGS = ["待上架", "已上架", "爆款", "观察中", "已下架"];

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
  const sellPriceLocal = getSellPrice(product, settings.platformCode);
  const isProfit = sellPriceLocal > 0 && cost.profit > 0;
  const isLoss = sellPriceLocal > 0 && cost.profit <= 0;
  const sym = cost.currencySymbol;

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
        const updates: Partial<Product> = {
          [field]: data.result,
          targetLang: selectedLang,
          titleRu: selectedLang === "ru" ? data.result : product.titleRu,
        };
        onUpdate(product.id, updates);
        await fetch("/api/product-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: product.id, ...updates }),
        });
      }
    } catch {} finally { setTranslating(false); }
  };

  const handleSellPriceChange = (value: number) => {
    const updates = setSellPrice(product, settings.platformCode, value);
    onUpdate(product.id, updates);
  };

  return (
    <div className={`bg-white border rounded-lg overflow-hidden transition-shadow hover:shadow-sm ${expanded ? "border-blue-200" : "border-gray-200"}`}>
      {/* Compact single row */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Thumbnail */}
        <img
          src={product.images[0] ? `/api/imgproxy?url=${encodeURIComponent(product.images[0])}` : ""}
          alt=""
          className="w-9 h-9 object-cover rounded-md flex-shrink-0 bg-gray-100"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          style={{ display: product.images[0] ? undefined : 'none' }}
        />

        {/* Title + translation */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-800 truncate leading-tight font-medium">{product.title}</p>
          {translatedTitle
            ? <div className="flex items-center gap-0.5"><p className="text-xs text-blue-500 truncate">{translatedTitle}</p><CopyButton text={translatedTitle} /></div>
            : <p className="text-[11px] text-gray-300 italic">未翻译</p>
          }
        </div>

        {/* Price info + sell price + profit */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-gray-400 text-[11px]">¥{product.price}</span>
          <span className="text-orange-500 text-[11px] font-medium">{sym}{cost.minSellPrice}起</span>
          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden focus-within:border-blue-400">
            <span className="bg-gray-50 px-1.5 py-1 text-[11px] text-gray-400 border-r border-gray-200 font-medium">{sym}</span>
            <input
              type="number"
              min={0}
              value={sellPriceLocal || ""}
              onChange={(e) => handleSellPriceChange(parseFloat(e.target.value) || 0)}
              placeholder="售价"
              className="w-16 px-1.5 py-1 text-[11px] focus:outline-none"
            />
          </div>
          {sellPriceLocal > 0 && (
            <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${isProfit ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
              {isProfit ? "+" : ""}{cost.profit.toFixed(0)}元
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0 flex-shrink-0">
          <button onClick={() => onUpdate(product.id, { starred: !product.starred })}
            className={`p-1 transition-colors ${product.starred ? "text-yellow-400" : "text-gray-200 hover:text-yellow-400"}`}>
            <Star size={13} fill={product.starred ? "currentColor" : "none"} />
          </button>
          {product.sourceUrl && (
            <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-300 hover:text-blue-500 transition-colors">
              <ExternalLink size={13} />
            </a>
          )}
          <button onClick={() => onDelete(product.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
            <Trash2 size={13} />
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-1 text-gray-300 hover:text-gray-700 transition-colors">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <>
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
            <div className="flex justify-between text-gray-500">
              <span>保本售价</span>
              <span className="font-medium text-orange-600">{sym}{cost.minSellPrice}</span>
            </div>
            {sellPriceLocal > 0 && <>
              <div className="flex justify-between text-gray-500">
                <span>当前售价</span>
                <span>{sym}{sellPriceLocal}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>折合人民币</span>
                <span>¥{cost.sellPriceCny.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between font-bold border-t border-gray-100 pt-1 ${isProfit ? "text-green-600" : "text-red-500"}`}>
                <span>利润</span><span>¥{cost.profit.toFixed(2)} ({cost.profitRate.toFixed(0)}%)</span>
              </div>
            </>}
            {!sellPriceLocal && <p className="text-gray-300 italic">请填写售价</p>}
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
            {/* 标签 */}
            <div>
              <label className="text-gray-400 flex items-center gap-1"><Tag size={10} />状态标签</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {TAGS.map(tag => {
                  const active = product.tags?.includes(tag);
                  return (
                    <button key={tag} onClick={() => {
                      const tags = product.tags || [];
                      const next = active ? tags.filter(t => t !== tag) : [...tags, tag];
                      onUpdate(product.id, { tags: next });
                    }} className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      active ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-500 hover:border-blue-400"
                    }`}>{tag}</button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 详情图 & 规格参数 — 完整搬运区 */}
        {((product.detailImages && product.detailImages.length > 0) ||
          (product.specs && Object.keys(product.specs).length > 0)) && (
          <div className="border-t border-gray-100 px-3 py-3 bg-white space-y-3">

            {/* 规格参数 */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div>
                <p className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-2">
                  <LayoutList size={11} />规格参数
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <span key={k} className="text-[11px] text-gray-500">
                      <span className="text-gray-400">{k}：</span>{v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 详情图 */}
            {product.detailImages && product.detailImages.length > 0 && (
              <div>
                <p className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-2">
                  <ImageIcon size={11} />详情图（{product.detailImages.length}张）
                  <span className="text-gray-300 font-normal ml-1">· 可直接搬运到平台</span>
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.detailImages.map((src, i) => (
                    <a key={i} href={src} target="_blank" rel="noopener noreferrer" title="点击查看原图">
                      <img
                        src={`/api/imgproxy?url=${encodeURIComponent(src)}`}
                        alt={`详情图${i + 1}`}
                        className="h-20 w-auto object-cover rounded border border-gray-100 hover:border-blue-300 flex-shrink-0 transition-all hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </>
      )}
    </div>
  );
}
