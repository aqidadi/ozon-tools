"use client";

import { Settings } from "@/lib/types";

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
}

export function SettingsPanel({ settings, onChange }: Props) {
  const update = (key: keyof Settings, value: number) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-4">⚙️ 全局参数设置</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            汇率（1元 = X卢布）
          </label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={settings.exchangeRate}
            onChange={(e) => update("exchangeRate", parseFloat(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            运费单价（元/克）
          </label>
          <input
            type="number"
            min={0}
            step={0.001}
            value={settings.shippingRatePerGram}
            onChange={(e) => update("shippingRatePerGram", parseFloat(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            平台佣金（%）
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={(settings.platformFeeRate * 100).toFixed(1)}
            onChange={(e) => update("platformFeeRate", (parseFloat(e.target.value) || 0) / 100)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            包装费（元）
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={settings.packagingCost}
            onChange={(e) => update("packagingCost", parseFloat(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        * 修改后所有商品自动重新计算，不影响已保存的单品参数覆盖
      </p>
    </div>
  );
}
