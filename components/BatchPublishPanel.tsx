"use client";
import { useState, useCallback } from "react";
import { ProductCard } from "./ProductCard";
import { Product, Settings } from "@/lib/types";
import { Rocket, CheckSquare, Square, Loader2, CheckCircle, XCircle, X } from "lucide-react";

interface Props {
  products: Product[];
  settings: Settings;
  accessToken?: string;
  onUpdate: (id: string, updates: Partial<Product>) => void;
  onDelete: (id: string) => void;
}

interface PublishResult {
  id: string;
  title: string;
  success: boolean;
  taskId?: number;
  titleRu?: string;
  error?: string;
}

export function BatchPublishPanel({ products, settings, accessToken, onUpdate, onDelete }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [publishing, setPublishing] = useState(false);
  const [results, setResults] = useState<PublishResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const toggleOne = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map(p => p.id)));
    }
  }, [selected.size, products]);

  const handleBatchPublish = async () => {
    if (selected.size === 0) return;

    // 从 localStorage 读取 Ozon Key（插件存储在 crossly_ozon_client_id/api_key）
    const clientId = localStorage.getItem("crossly_ozon_client_id") || "";
    const apiKey = localStorage.getItem("crossly_ozon_api_key") || "";
    if (!clientId || !apiKey) {
      alert("请先在「参数设置」→「Ozon API」里填写 Client-Id 和 Api-Key");
      return;
    }

    setPublishing(true);
    setShowResults(false);
    setResults([]);

    const toPublish = products.filter(p => selected.has(p.id));

    try {
      const res = await fetch("/api/ozon/batch-publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          clientId,
          apiKey,
          products: toPublish.map(p => {
            // 用定价参数计算建议价格
            const cost = (p.price || 0) + (settings.shippingPerItem || 25);
            const suggestRub = Math.ceil(cost / (1 - (settings.platformFeeRate || 0.15)) * (settings.exchangeRate || 12) * 1.15);
            return {
              id: p.id,
              title: p.title,
              titleRu: p.titleRu,
              price: Math.max(suggestRub, 100),
              oldPrice: Math.ceil(suggestRub * 1.2),
              weight: p.weight || 400,
              images: p.images || [],
              detailImages: p.detailImages || [],
              color: p.specs?.["颜色"] || p.specs?.["颜色分类"] || "",
              material: p.specs?.["材质"] || p.specs?.["面料"] || "",
              specs: p.specs || {},
            };
          }),
        }),
      });

      const data = await res.json();

      if (data.results) {
        const mapped: PublishResult[] = data.results.map((r: { id: string; success: boolean; taskId?: number; titleRu?: string; error?: string }) => {
          const product = products.find(p => p.id === r.id);
          return {
            id: r.id,
            title: product?.title || r.id,
            success: r.success,
            taskId: r.taskId,
            titleRu: r.titleRu,
            error: r.error,
          };
        });
        setResults(mapped);
        setShowResults(true);

        // 更新成功的商品的titleRu
        for (const r of mapped) {
          if (r.success && r.titleRu) {
            onUpdate(r.id, { titleRu: r.titleRu });
          }
        }

        // 清空选择
        setSelected(new Set());
      }
    } catch (e) {
      alert("批量刊登失败：" + String(e));
    } finally {
      setPublishing(false);
    }
  };

  const allSelected = selected.size === products.length && products.length > 0;
  const someSelected = selected.size > 0;

  return (
    <div>
      {/* 批量操作栏 */}
      <div className="flex items-center gap-2 mb-3 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
        {/* 全选 */}
        <button
          onClick={toggleAll}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
        >
          {allSelected
            ? <CheckSquare size={18} className="text-indigo-600" />
            : <Square size={18} className="text-gray-400" />}
          <span className="text-xs font-medium">
            {allSelected ? "取消全选" : `全选 (${products.length})`}
          </span>
        </button>

        <span className="text-gray-200">|</span>

        {someSelected && (
          <span className="text-xs text-indigo-600 font-semibold">
            已选 {selected.size} 个
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {someSelected && (
            <button
              onClick={handleBatchPublish}
              disabled={publishing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {publishing
                ? <><Loader2 size={13} className="animate-spin" />刊登中...</>
                : <><Rocket size={13} />一键刊登到Ozon ({selected.size}个)</>}
            </button>
          )}
        </div>
      </div>

      {/* 刊登结果 */}
      {showResults && results.length > 0 && (
        <div className="mb-3 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-gray-700">刊登结果</span>
              <span className="text-green-600 font-bold">✅ {results.filter(r => r.success).length} 成功</span>
              {results.filter(r => !r.success).length > 0 && (
                <span className="text-red-500 font-bold">❌ {results.filter(r => !r.success).length} 失败</span>
              )}
            </div>
            <button onClick={() => setShowResults(false)} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
          <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
            {results.map((r) => (
              <div key={r.id} className="flex items-start gap-2 px-4 py-2.5">
                {r.success
                  ? <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                  : <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{r.title}</p>
                  {r.success
                    ? <p className="text-[10px] text-green-600 mt-0.5">task:{r.taskId} · {r.titleRu?.slice(0, 40)}</p>
                    : <p className="text-[10px] text-red-500 mt-0.5">{r.error?.slice(0, 80)}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 商品列表（带checkbox） */}
      <div className="space-y-1">
        {products.map((product) => (
          <div key={product.id} className="flex items-start gap-2">
            {/* Checkbox */}
            <button
              onClick={() => toggleOne(product.id)}
              className="mt-3 flex-shrink-0 p-1"
            >
              {selected.has(product.id)
                ? <CheckSquare size={18} className="text-indigo-600" />
                : <Square size={18} className="text-gray-300 hover:text-gray-500" />}
            </button>
            {/* 商品卡片 */}
            <div className={`flex-1 min-w-0 rounded-xl transition-all ${selected.has(product.id) ? "ring-2 ring-indigo-300" : ""}`}>
              <ProductCard
                product={product}
                settings={settings}
                onUpdate={onUpdate}
                onDelete={onDelete}
                accessToken={accessToken}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
