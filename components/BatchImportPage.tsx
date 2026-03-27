"use client";
import { useState } from "react";
import { Upload, CheckCircle, XCircle, Loader2, ClipboardPaste, Link } from "lucide-react";

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
}

export function BatchImportPage({ accessToken, apiToken, onDone }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CrawlResult[]>([]);
  const [summary, setSummary] = useState<{ total: number; success: number; failed: number } | null>(null);

  // 手机单链接快速抓取
  const [singleUrl, setSingleUrl] = useState("");
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleResult, setSingleResult] = useState<{title?: string; price?: number; images?: string[]; error?: string} | null>(null);

  const parseUrls = (raw: string): string[] => {
    const lines = raw.split(/[\n,\s]+/);
    return lines
      .map(l => l.trim())
      .filter(l => l.includes("1688.com") || l.includes("yiwugo.com"))
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .slice(0, 100);
  };

  const handleSingleCrawl = async () => {
    if (!singleUrl.trim()) return;
    setSingleLoading(true);
    setSingleResult(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      const res = await fetch("/api/crawl", {
        method: "POST", headers,
        body: JSON.stringify({ url: singleUrl.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setSingleResult(data.product);
        if (onDone) onDone();
      } else {
        setSingleResult({ error: data.error || "抓取失败" });
      }
    } catch (e) {
      setSingleResult({ error: String(e) });
    } finally {
      setSingleLoading(false);
    }
  };

  const handleImport = async () => {
    const urls = parseUrls(text);
    if (urls.length === 0) {
      alert("没有找到有效的 1688 或义乌购链接，请检查粘贴的内容");
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
        method: "POST",
        headers,
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

  const urls = parseUrls(text);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* 标题 */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-1">🚀 无插件导入商品</h2>
        <p className="text-gray-500 text-sm">手机、电脑都能用，贴链接，服务器自动抓</p>
      </div>

      {/* ── 手机专用：单链接快速抓取 ── */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Link size={16} className="text-indigo-600" />
          <p className="text-sm font-bold text-indigo-800">📱 手机用户：贴一条链接</p>
          <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">无需插件</span>
        </div>
        <div className="flex gap-2">
          <input
            value={singleUrl}
            onChange={e => setSingleUrl(e.target.value)}
            placeholder="粘贴1688商品链接..."
            className="flex-1 border border-indigo-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 min-w-0"
          />
          <button
            onClick={handleSingleCrawl}
            disabled={singleLoading || !singleUrl.trim()}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {singleLoading ? <Loader2 size={15} className="animate-spin" /> : "抓取"}
          </button>
        </div>
        <p className="text-[10px] text-indigo-400 mt-1.5">在1688复制商品链接，切回来直接粘贴</p>

        {/* 单条结果 */}
        {singleResult && (
          <div className={`mt-3 rounded-xl p-3 ${singleResult.error ? "bg-red-50 border border-red-100" : "bg-white border border-green-100"}`}>
            {singleResult.error ? (
              <p className="text-sm text-red-600">❌ {singleResult.error}</p>
            ) : (
              <div className="flex items-start gap-3">
                {singleResult.images?.[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={singleResult.images[0]} alt="" className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">{singleResult.title}</p>
                  {singleResult.price ? (
                    <p className="text-xs text-green-600 font-bold mt-1">进价 ¥{singleResult.price}</p>
                  ) : null}
                  <p className="text-[10px] text-green-500 mt-1">✅ 已导入选品列表</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 电脑批量：多链接 ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">🖥️ 批量导入（最多100条）</label>
          <button
            onClick={async () => {
              const clip = await navigator.clipboard.readText().catch(() => "");
              setText(clip);
            }}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            <ClipboardPaste size={14} />
            粘贴剪贴板
          </button>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={"https://detail.1688.com/offer/123456.html\nhttps://detail.1688.com/offer/789012.html\n..."}
          className="w-full h-36 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">
            {urls.length > 0 ? `✅ 识别到 ${urls.length} 个链接` : "每行一个链接"}
          </span>
          <button
            onClick={handleImport}
            disabled={loading || urls.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {loading ? "抓取中..." : `批量导入${urls.length > 0 ? ` ${urls.length} 个` : ""}`}
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
          <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                {r.ok
                  ? <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  : <XCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                }
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

      {/* 说明 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 space-y-1">
        <p className="font-semibold">💡 使用说明</p>
        <p>• 支持 1688 商品详情页、义乌购链接</p>
        <p>• 手机：贴一条链接点「抓取」即可，无需安装插件</p>
        <p>• 电脑：批量粘贴最多100条，一次性导入</p>
        <p>• 导入成功后自动出现在「选品列表」</p>
      </div>
    </div>
  );
}
