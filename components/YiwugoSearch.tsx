"use client";
import { useState } from "react";
import { Search, ShoppingBag, ExternalLink, Plus, Loader2, Package } from "lucide-react";

interface YiwugoProduct {
  source: "yiwugo";
  yiwugoId: string;
  yiwugoShopId: string;
  title: string;
  price: number;
  priceUnit: string;
  images: string[];
  moq: number;
  monthlySales: number;
  totalSales: number;
  shopName: string;
  location: string;
  url: string;
}

interface Props {
  onImport: (product: any) => void;
}

export function YiwugoSearch({ onImport }: Props) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<YiwugoProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [importing, setImporting] = useState<Set<string>>(new Set());
  const [imported, setImported] = useState<Set<string>>(new Set());

  const search = async (p = 1) => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setPage(p);
    try {
      const resp = await fetch(`/api/scrape?source=yiwugo&keyword=${encodeURIComponent(keyword)}&page=${p}&pageSize=20`);
      const data = await resp.json();
      if (!data.ok) throw new Error(data.error ?? "搜索失败");
      setResults(p === 1 ? data.products : [...results, ...data.products]);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleImport = async (p: YiwugoProduct) => {
    setImporting(prev => new Set(prev).add(p.yiwugoId));
    try {
      const product = {
        id: `yiwugo_${p.yiwugoId}_${Date.now()}`,
        sourceUrl: p.url,
        title: p.title,
        titleRu: "",
        price: p.price,
        weight: 300, // 默认值，用户可手动改
        images: p.images,
        detailImages: [],
        specs: { "起订量": `${p.moq}${p.priceUnit}`, "月销量": `${p.monthlySales}`, "店铺": p.shopName, "产地": p.location },
        monthlySales: p.monthlySales,
        moq: p.moq,
        sellPrices: {},
        sellPriceRub: 0,
        tags: [],
        starred: false,
        note: "",
      };
      await onImport(product);
      setImported(prev => new Set(prev).add(p.yiwugoId));
    } catch (e) {
      //
    }
    setImporting(prev => { const s = new Set(prev); s.delete(p.yiwugoId); return s; });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* 头部 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50"
        style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)" }}>
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <ShoppingBag size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">义乌购货源搜索</p>
          <p className="text-xs text-gray-500">500万+ 小商品，直连服务端搜索，无需插件</p>
        </div>
        <span className="ml-auto text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">可直连</span>
      </div>

      {/* 搜索框 */}
      <div className="p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search(1)}
              placeholder="搜索商品关键词，如：草帽、手机壳、毛绒玩具..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 bg-gray-50"
            />
          </div>
          <button
            onClick={() => search(1)}
            disabled={loading || !keyword.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : "搜索"}
          </button>
        </div>

        {error && <p className="text-xs text-red-500 mt-2 px-1">⚠️ {error}</p>}

        {/* 结果列表 */}
        {results.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">找到 <strong className="text-gray-700">{total.toLocaleString()}</strong> 条结果，显示前 {results.length} 条</p>
              <a href={`https://www.yiwugo.com/product_list/i_0_0.html?keyword=${encodeURIComponent(keyword)}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs text-green-600 hover:underline flex items-center gap-1">
                在义乌购查看全部 <ExternalLink size={10} />
              </a>
            </div>

            {results.map(p => (
              <div key={p.yiwugoId}
                className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all">
                {/* 图片 */}
                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {p.images[0] ? (
                    <img src={p.images[0]} alt={p.title}
                      className="w-full h-full object-cover"
                      onError={e => (e.currentTarget.style.display = "none")} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={20} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-relaxed">{p.title}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-sm font-bold text-green-600">¥{p.price.toFixed(2)}/{p.priceUnit}</span>
                    <span className="text-[10px] text-gray-400">起订 {p.moq}{p.priceUnit}</span>
                    {p.monthlySales > 0 && (
                      <span className="text-[10px] text-gray-400">月销 {p.monthlySales.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-400 truncate">{p.shopName}</span>
                    {p.location && <span className="text-[10px] text-gray-300">·</span>}
                    {p.location && <span className="text-[10px] text-gray-400 truncate">{p.location}</span>}
                  </div>
                </div>

                {/* 操作 */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleImport(p)}
                    disabled={importing.has(p.yiwugoId) || imported.has(p.yiwugoId)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      imported.has(p.yiwugoId)
                        ? "bg-green-100 text-green-600 cursor-default"
                        : importing.has(p.yiwugoId)
                        ? "bg-gray-100 text-gray-400 cursor-wait"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}>
                    {importing.has(p.yiwugoId) ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : imported.has(p.yiwugoId) ? (
                      "✓ 已加入"
                    ) : (
                      <><Plus size={10} /> 加入</>
                    )}
                  </button>
                  <a href={p.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                    <ExternalLink size={10} /> 查看
                  </a>
                </div>
              </div>
            ))}

            {/* 加载更多 */}
            {results.length < total && (
              <button
                onClick={() => search(page + 1)}
                disabled={loading}
                className="w-full py-2.5 text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl hover:border-green-300 hover:text-green-600 transition-all">
                {loading ? "加载中..." : `加载更多（还有 ${(total - results.length).toLocaleString()} 条）`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
