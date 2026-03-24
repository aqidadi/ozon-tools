"use client";

import { useState } from "react";
import { Settings } from "@/lib/types";
import { Save, RotateCcw } from "lucide-react";

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
}

const DEFAULT: Settings = {
  exchangeRate: 10,
  shippingRatePerGram: 0.025,
  platformFeeRate: 0.15,
  packagingCost: 2,
};

export function SettingsPanel({ settings, onChange }: Props) {
  const [local, setLocal] = useState(settings);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof Settings, value: number) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onChange(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setLocal(DEFAULT);
    onChange(DEFAULT);
  };

  const fields = [
    {
      key: "exchangeRate" as keyof Settings,
      label: "汇率",
      desc: "1 人民币 = ? 卢布",
      suffix: "卢布/元",
      step: 0.1,
      min: 1,
      display: local.exchangeRate,
    },
    {
      key: "shippingRatePerGram" as keyof Settings,
      label: "运费单价",
      desc: "每克重量的运费成本",
      suffix: "元/克",
      step: 0.001,
      min: 0,
      display: local.shippingRatePerGram,
    },
    {
      key: "platformFeeRate" as keyof Settings,
      label: "平台佣金",
      desc: "Ozon 按类目收取的佣金比例",
      suffix: "%",
      step: 0.5,
      min: 0,
      display: parseFloat((local.platformFeeRate * 100).toFixed(1)),
      toStore: (v: number) => v / 100,
    },
    {
      key: "packagingCost" as keyof Settings,
      label: "包装费",
      desc: "每件商品的包装材料成本",
      suffix: "元",
      step: 0.5,
      min: 0,
      display: local.packagingCost,
    },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">参数设置</h2>
        <p className="text-sm text-gray-500 mt-1">修改后点击「保存」，所有商品会自动重新计算利润</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {fields.map((field, i) => (
          <div key={field.key} className={`px-6 py-5 ${i < fields.length - 1 ? "border-b border-gray-100" : ""}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{field.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{field.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={field.min}
                  step={field.step}
                  value={field.display}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    const stored = field.toStore ? field.toStore(v) : v;
                    update(field.key, stored);
                  }}
                  className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-400 w-16">{field.suffix}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Example calculation */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-700 mb-2">📐 当前参数示例（进价¥10，重量300克）</p>
        <div className="text-xs text-blue-600 space-y-1">
          {(() => {
            const cost = 10;
            const weight = 300;
            const ship = local.shippingRatePerGram * weight;
            const total = cost + ship + local.packagingCost;
            const minSell = (total * local.exchangeRate) / (1 - local.platformFeeRate);
            return (
              <>
                <p>运费 = {weight}克 × {local.shippingRatePerGram}元/克 = <strong>{ship.toFixed(2)}元</strong></p>
                <p>总成本 = {cost} + {ship.toFixed(2)} + {local.packagingCost}(包装) = <strong>{total.toFixed(2)}元</strong></p>
                <p>最低售价 = {total.toFixed(2)} × {local.exchangeRate} ÷ (1-{(local.platformFeeRate*100).toFixed(0)}%) = <strong>{minSell.toFixed(0)} 卢布</strong></p>
              </>
            );
          })()}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            saved ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          <Save size={15} />
          {saved ? "✓ 已保存！" : "保存设置"}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <RotateCcw size={14} />
          恢复默认
        </button>
      </div>
    </div>
  );
}
