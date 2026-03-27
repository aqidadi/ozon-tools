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
          <p className="text-xs text-gray-400 mt-0.5">找到好货？一键导入，AI翻译+改价+上架全包！</p>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3">

        {/* 1688 → 插件引导 */}
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5">
          <span className="text-xl flex-shrink-0">🛒</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-orange-800">1688商品 → 用Chrome插件导入</p>
            <p className="text-[11px] text-orange-600 mt-0.5">在1688商品页安装插件，点「导入Crossly」，秒进选品列表</p>
          </div>
          <a
            href="https://github.com/aqidadi/ozon-tools/raw/main/crossly-extension-v1.8.3.zip"
            className="flex-shrink-0 text-[11px] font-bold bg-orange-500 text-white px-2.5 py-1.5 rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
          >
            下载插件
          </a>
        </div>

        {/* 义乌购 → 单条链接 */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5 font-medium">🏪 义乌购链接直接粘贴：</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleImport()}
              placeholder="https://www.yiwugo.com/product/detail/xxxxxx.html"
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
        </div>
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
