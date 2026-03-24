"use client";

import { useState } from "react";
import { Link2, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Product } from "@/lib/types";

interface Props {
  onImport: (product: Product) => void;
}

export function UrlImportBox({ onImport }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleImport = async () => {
    if (!url.trim()) return;
    if (!url.includes("1688.com")) {
      setStatus("error");
      setMsg("请输入1688商品链接");
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();

      if (!data.success) {
        setStatus("error");
        setMsg(data.error || "抓取失败，请检查链接");
        return;
      }

      const product: Product = {
        id: crypto.randomUUID(),
        title: data.title,
        titleRu: "",
        price: data.price || 0,
        weight: 400,
        images: data.images || [],
        sellPriceRub: 0,
        note: data.shopName ? `店铺：${data.shopName}` : "",
        sourceUrl: url.trim(),
      };

      // 保存到Redis
      await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      onImport(product);
      setUrl("");
      setStatus("success");
      setMsg(`「${data.title.slice(0, 20)}...」已导入`);
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setMsg("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Link2 size={15} className="text-blue-500" />
        <span className="text-sm font-medium text-gray-700">粘贴1688商品链接直接导入</span>
        <span className="text-xs text-gray-400">无需安装插件</span>
      </div>
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
        <div className={`flex items-center gap-2 mt-2 text-sm ${status === "success" ? "text-green-600" : "text-red-500"}`}>
          {status === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {msg}
        </div>
      )}
    </div>
  );
}
