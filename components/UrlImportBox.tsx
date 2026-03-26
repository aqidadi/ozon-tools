"use client";

import { useState, useRef } from "react";
import {
  Link2, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp,
  Upload, X, Image as ImageIcon, FileText
} from "lucide-react";
import { Product } from "@/lib/types";

interface ImportResult {
  url: string;
  success: boolean;
  title?: string;
  error?: string;
}

interface Props {
  onImport: (product: Product) => void;
}

export function UrlImportBox({ onImport, onBatchImport }: Props & { onBatchImport?: (products: Product[]) => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  // 批量导入状态
  const [batchMode, setBatchMode] = useState(false);
  const [batchUrls, setBatchUrls] = useState("");
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResults, setBatchResults] = useState<ImportResult[]>([]);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });
  const [showBatchResult, setShowBatchResult] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── 单个导入 ──
  const handleImport = async () => {
    if (!url.trim()) return;
    if (!url.includes("1688.com")) {
      setStatus("error"); setMsg("请输入1688商品链接"); return;
    }
    setLoading(true); setStatus("idle");
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!data.success) { setStatus("error"); setMsg(data.error || "抓取失败"); return; }

      const product = buildProduct(data, url.trim());
      await saveProduct(product);
      onImport(product);
      setUrl(""); setStatus("success");
      setMsg(`「${data.title?.slice(0, 20)}」已导入，主图${data.images?.length || 0}张，详情图${data.detailImages?.length || 0}张`);
      setTimeout(() => setStatus("idle"), 4000);
    } catch { setStatus("error"); setMsg("网络错误，请重试"); }
    finally { setLoading(false); }
  };

  // ── 批量导入 ──
  const handleBatchImport = async () => {
    const lines = batchUrls
      .split(/[\n,，\s]+/)
      .map(l => l.trim())
      .filter(l => l.includes("1688.com"));

    if (lines.length === 0) { alert("请粘贴至少一个1688商品链接"); return; }
    if (lines.length > 20) { alert("批量导入最多20个链接，当前已截取前20个"); lines.splice(20); }

    setBatchLoading(true);
    setBatchResults([]);
    setBatchProgress({ done: 0, total: lines.length });
    setShowBatchResult(true);

    const results: ImportResult[] = [];
    const importedProducts: Product[] = [];

    // 逐个抓取，实时更新进度
    for (let i = 0; i < lines.length; i++) {
      const u = lines[i];
      try {
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: u }),
        });
        const data = await res.json();

        if (data.success) {
          const product = buildProduct(data, u);
          await saveProduct(product);
          onImport(product);
          importedProducts.push(product);
          results.push({ url: u, success: true, title: data.title });
        } else {
          results.push({ url: u, success: false, error: data.error });
        }
      } catch {
        results.push({ url: u, success: false, error: "网络错误" });
      }

      setBatchResults([...results]);
      setBatchProgress({ done: i + 1, total: lines.length });

      // 间隔800ms，避免被封
      if (i < lines.length - 1) await new Promise(r => setTimeout(r, 800));
    }

    setBatchLoading(false);
    const ok = results.filter(r => r.success).length;
    if (onBatchImport) onBatchImport(importedProducts);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 mb-5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Link2 size={15} className="text-blue-500" />
        <div>
          <span className="text-sm font-bold text-gray-800">像发朋友圈一样简单 🚀</span>
          <p className="text-xs text-gray-400 mt-0.5">复制1688链接贴这里，AI俄化+改价+上架，我们全包！无需PS，无需俄语，30秒搞定一件跨境爆款</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => { setBatchMode(false); setBatchResults([]); }}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${!batchMode ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
          >单个</button>
          <button
            onClick={() => setBatchMode(true)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${batchMode ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <span className="flex items-center gap-1"><Upload size={10} />批量</span>
          </button>
        </div>
      </div>

      <div className="px-4 pb-4">
        {!batchMode ? (
          /* 单个模式 */
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleImport()}
                placeholder="https://detail.1688.com/offer/xxxxxxxx.html"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
              />
              <button
                onClick={handleImport}
                disabled={loading || !url.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                {loading ? "抓取中..." : "导入"}
              </button>
            </div>
            {status !== "idle" && (
              <div className={`flex items-center gap-2 mt-2 text-xs ${status === "success" ? "text-green-600" : "text-red-500"}`}>
                {status === "success" ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                {msg}
              </div>
            )}
          </>
        ) : (
          /* 批量模式 */
          <>
            <textarea
              ref={textareaRef}
              value={batchUrls}
              onChange={(e) => setBatchUrls(e.target.value)}
              placeholder={"每行一个1688链接，最多20个：\nhttps://detail.1688.com/offer/111111.html\nhttps://detail.1688.com/offer/222222.html\nhttps://detail.1688.com/offer/333333.html"}
              rows={5}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleBatchImport}
                disabled={batchLoading || !batchUrls.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {batchLoading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {batchLoading ? `抓取中 ${batchProgress.done}/${batchProgress.total}...` : "批量导入"}
              </button>
              {!batchLoading && batchUrls && (
                <button onClick={() => { setBatchUrls(""); setBatchResults([]); setShowBatchResult(false); }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                  <X size={14} />
                </button>
              )}
              <span className="text-xs text-gray-400 ml-auto">
                {batchUrls.split(/[\n,，\s]+/).filter(l => l.includes("1688.com")).length} 个有效链接
              </span>
            </div>

            {/* 进度条 */}
            {batchLoading && batchProgress.total > 0 && (
              <div className="mt-3">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500 rounded-full"
                    style={{ width: `${(batchProgress.done / batchProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* 批量结果 */}
            {showBatchResult && batchResults.length > 0 && (
              <div className="mt-3 border border-gray-100 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-600">
                    导入结果：
                    <span className="text-green-600 ml-1">{batchResults.filter(r => r.success).length} 成功</span>
                    {batchResults.filter(r => !r.success).length > 0 && (
                      <span className="text-red-500 ml-1">{batchResults.filter(r => !r.success).length} 失败</span>
                    )}
                  </span>
                  {!batchLoading && (
                    <button onClick={() => setShowBatchResult(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="max-h-40 overflow-y-auto divide-y divide-gray-50">
                  {batchResults.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 px-3 py-2">
                      {r.success
                        ? <CheckCircle size={12} className="text-green-500 flex-shrink-0 mt-0.5" />
                        : <AlertCircle size={12} className="text-red-400 flex-shrink-0 mt-0.5" />
                      }
                      <div className="min-w-0">
                        <p className={`text-xs truncate ${r.success ? "text-gray-700" : "text-red-500"}`}>
                          {r.success ? r.title : r.error}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">{r.url}</p>
                      </div>
                    </div>
                  ))}
                  {batchLoading && batchResults.length < batchProgress.total && (
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Loader2 size={12} className="animate-spin text-blue-400" />
                      <span className="text-xs text-gray-400">正在抓取中...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── 辅助函数 ──

function buildProduct(data: {
  title: string;
  price?: number;
  images?: string[];
  detailImages?: string[];
  specs?: Record<string, string>;
  shopName?: string;
  monthlySales?: number;
  moq?: number;
}, url: string): Product {
  const noteparts: string[] = [];
  if (data.shopName) noteparts.push(`店铺：${data.shopName}`);
  if (data.monthlySales) noteparts.push(`月销${data.monthlySales}`);
  if (data.moq && data.moq > 1) noteparts.push(`起订${data.moq}件`);

  return {
    id: crypto.randomUUID(),
    title: data.title,
    titleRu: "",
    price: data.price || 0,
    weight: 400,
    images: data.images || [],
    detailImages: data.detailImages || [],
    specs: data.specs || {},
    monthlySales: data.monthlySales || 0,
    moq: data.moq || 1,
    sellPrices: {},
    sellPriceRub: 0,
    note: noteparts.join(" | "),
    sourceUrl: url,
  };
}

async function saveProduct(product: Product) {
  await fetch("/api/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
}
