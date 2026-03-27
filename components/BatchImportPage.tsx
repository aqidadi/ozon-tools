"use client";
import { useState } from "react";
import { CheckCircle, XCircle, Loader2, ClipboardPaste, Package, ArrowRight } from "lucide-react";

interface CrawlResult {
  url: string;
  ok: boolean;
  title?: string;
  error?: string;
}

interface Props {
  accessToken?: string;
  apiToken?: string;
  onDone?: () => void;
  onTabChange?: (tab: string) => void;
}

export function BatchImportPage({ accessToken, apiToken, onDone, onTabChange }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CrawlResult[]>([]);
  const [summary, setSummary] = useState<{ total: number; success: number; failed: number } | null>(null);

  const parseYiwuUrls = (raw: string): string[] => {
    const lines = raw.split(/[\n,\s]+/);
    return lines
      .map(l => l.trim())
      .filter(l => l.includes("yiwugo.com"))
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .slice(0, 100);
  };

  const handleImport = async () => {
    const urls = parseYiwuUrls(text);
    if (urls.length === 0) {
      alert("没有找到有效的义乌购链接，1688请使用Chrome插件导入哦～");
      return;
    }
    setLoading(true);
    setResults([]);
    setSummary(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      if (apiToken) headers["X-Api-Token"] = apiToken;
      const res = await fetch("/api/batch-crawl", {
        method: "POST", headers,
        body: JSON.stringify({ urls }),
      });
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
        setSummary({ total: data.total, success: data.success, failed: data.failed });
        if (data.success > 0 && onDone) onDone();
      }
    } catch (e) {
      alert("导入失败：" + String(e));
    } finally {
      setLoading(false);
    }
  };

  const yiwuUrls = parseYiwuUrls(text);

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* ── 1688 → 只能用插件 ── */}
      <div className="rounded-2xl overflow-hidden border-2 border-orange-200"
        style={{ background: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)" }}>
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🛒</span>
            <p className="font-black text-orange-900 text-sm">1688 商品导入</p>
            <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">推荐方式</span>
          </div>
          <p className="text-xs text-orange-700 leading-relaxed mb-3">
            1688有防采集保护，服务器无法直接抓取。<br />
            <strong>用Chrome插件导入</strong>——在1688商品页直接点「导入Crossly」，一键搞定！
          </p>
          {/* 步骤 */}
          <div className="flex items-center gap-2 text-xs text-orange-800 flex-wrap">
            <div className="flex items-center gap-1 bg-white/60 rounded-lg px-2 py-1">
              <span>1️⃣</span><span>下载插件</span>
            </div>
            <ArrowRight size={12} className="text-orange-400 flex-shrink-0" />
            <div className="flex items-center gap-1 bg-white/60 rounded-lg px-2 py-1">
              <span>2️⃣</span><span>打开1688商品页</span>
            </div>
            <ArrowRight size={12} className="text-orange-400 flex-shrink-0" />
            <div className="flex items-center gap-1 bg-white/60 rounded-lg px-2 py-1">
              <span>3️⃣</span><span>点「导入Crossly」</span>
            </div>
            <ArrowRight size={12} className="text-orange-400 flex-shrink-0" />
            <div className="flex items-center gap-1 bg-white/60 rounded-lg px-2 py-1">
              <span>✅</span><span>自动出现在选品列表</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 px-4 pb-4">
          <a
            href="https://github.com/aqidadi/ozon-tools/raw/main/crossly-extension-v1.8.3.zip"
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors"
          >
            下载Chrome插件
          </a>
          <button
            onClick={() => onTabChange?.("products")}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-orange-700 border border-orange-200 rounded-xl text-xs font-bold hover:bg-orange-50 transition-colors"
          >
            <Package size={13} />
            查看已导入商品
          </button>
        </div>
      </div>

      {/* ── 义乌购 → 服务器抓取 ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🏪</span>
          <p className="font-black text-gray-800 text-sm">义乌购链接导入</p>
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">直接粘贴</span>
        </div>
        <p className="text-xs text-gray-400 mb-3">义乌购支持服务器直接抓取，粘贴链接即可，无需插件</p>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">每行一个义乌购链接，最多100条</span>
          <button
            onClick={async () => {
              const clip = await navigator.clipboard.readText().catch(() => "");
              setText(clip);
            }}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            <ClipboardPaste size={13} />
            粘贴剪贴板
          </button>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={"https://www.yiwugo.com/product/detail/xxxxxx.html\nhttps://www.yiwugo.com/product/detail/xxxxxx.html\n..."}
          className="w-full h-32 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
        />

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">
            {yiwuUrls.length > 0
              ? <span className="text-green-600 font-semibold">✅ 识别到 {yiwuUrls.length} 个义乌购链接</span>
              : "支持 yiwugo.com 链接"}
          </span>
          <button
            onClick={handleImport}
            disabled={loading || yiwuUrls.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {loading ? "抓取中..." : `导入${yiwuUrls.length > 0 ? ` ${yiwuUrls.length} 个` : ""}`}
          </button>
        </div>
      </div>

      {/* 结果汇总 */}
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">{summary.total}</div>
            <div className="text-xs text-blue-500 mt-1">总链接数</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{summary.success}</div>
            <div className="text-xs text-green-500 mt-1">成功导入</div>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-700">{summary.failed}</div>
            <div className="text-xs text-red-500 mt-1">失败</div>
          </div>
        </div>
      )}

      {/* 详细结果 */}
      {results.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">抓取详情</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                {r.ok
                  ? <CheckCircle size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                  : <XCircle size={15} className="text-red-400 mt-0.5 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {r.ok ? r.title : <span className="text-red-500">{r.error}</span>}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{r.url}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${r.ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {r.ok ? "成功" : "失败"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
