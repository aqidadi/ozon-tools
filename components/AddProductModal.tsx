"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { X, Loader2 } from "lucide-react";

interface Props {
  onAdd: (product: Product) => void;
  onClose: () => void;
}

export function AddProductModal({ onAdd, onClose }: Props) {
  const [form, setForm] = useState({
    title: "",
    price: "",
    weight: "",
    sourceUrl: "",
    image: "",
  });
  const [translating, setTranslating] = useState(false);
  const [titleRu, setTitleRu] = useState("");

  const handleTranslate = async () => {
    if (!form.title.trim()) return;
    setTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: form.title }),
      });
      const data = await res.json();
      setTitleRu(data.result || "");
    } catch {
      setTitleRu("翻译失败，请手动输入");
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = () => {
    if (!form.title || !form.price || !form.weight) {
      alert("请填写商品名称、进价和重量");
      return;
    }
    const product: Product = {
      id: crypto.randomUUID(),
      title: form.title,
      titleRu: titleRu,
      price: parseFloat(form.price),
      weight: parseFloat(form.weight),
      images: form.image ? [form.image] : [],
      sellPriceRub: 0,
      note: "",
      sourceUrl: form.sourceUrl,
    };
    onAdd(product);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">添加商品</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* 商品名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品名称（中文）<span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="从1688复制商品标题"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleTranslate}
                disabled={translating || !form.title}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 flex-shrink-0"
              >
                {translating ? <Loader2 size={14} className="animate-spin" /> : null}
                AI翻译
              </button>
            </div>
          </div>

          {/* 俄语标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              俄语标题
            </label>
            <input
              type="text"
              value={titleRu}
              onChange={(e) => setTitleRu(e.target.value)}
              placeholder="点击「AI翻译」自动生成，也可手动填写"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 进价 + 重量 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                1688进价（元）<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="例：6.5"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                重量（克）<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                placeholder="例：400"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 图片URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              图片链接（选填）
            </label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="粘贴1688商品图片URL"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 1688链接 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              1688链接（选填）
            </label>
            <input
              type="url"
              value={form.sourceUrl}
              onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
              placeholder="https://detail.1688.com/offer/..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            添加商品
          </button>
        </div>
      </div>
    </div>
  );
}
