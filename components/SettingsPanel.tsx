"use client";

import { useState, useEffect } from "react";
import { Settings, PLATFORMS, getPlatform } from "@/lib/types";
import { Save, RotateCcw, RefreshCw, Key, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
}

const DEFAULT: Settings = {
  platformCode: "RUB",
  exchangeRate: 12.5,
  shippingRatePerGram: 0.025,
  platformFeeRate: 0.15,
  packagingCost: 2,
};

export function SettingsPanel({ settings, onChange }: Props) {
  const [local, setLocal] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [fetchingRate, setFetchingRate] = useState(false);

  // Ozon API配置
  const [ozonClientId, setOzonClientId] = useState("");
  const [ozonApiKey, setOzonApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle"|"testing"|"ok"|"fail">("idle");
  const [testMsg, setTestMsg] = useState("");

  // 加载已保存的Ozon配置
  useEffect(() => {
    const saved = localStorage.getItem("ozon-api-config");
    if (saved) {
      const cfg = JSON.parse(saved);
      setOzonClientId(cfg.clientId || "");
      setOzonApiKey(cfg.apiKey || "");
    }
  }, []);

  const saveOzonConfig = () => {
    localStorage.setItem("ozon-api-config", JSON.stringify({ clientId: ozonClientId, apiKey: ozonApiKey }));
  };

  const testOzonApi = async () => {
    setTestStatus("testing");
    setTestMsg("");
    try {
      const res = await fetch("/api/ozon/category", {
        method: "GET",
        headers: { "x-client-id": ozonClientId, "x-api-key": ozonApiKey }
      });
      const data = await res.json();
      if (data.result?.length > 0) {
        setTestStatus("ok");
        setTestMsg(`✅ 连接成功！找到 ${data.result.length} 个类目`);
        saveOzonConfig();
      } else {
        setTestStatus("fail");
        setTestMsg("❌ " + (data.error || data.message || "连接失败"));
      }
    } catch {
      setTestStatus("fail");
      setTestMsg("❌ 网络错误");
    }
  };

  const platform = getPlatform(local.platformCode);

  const update = (key: keyof Settings, value: number | string) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const handlePlatformChange = async (code: string) => {
    const p = getPlatform(code);
    setLocal(prev => ({
      ...prev,
      platformCode: code,
      platformFeeRate: p.defaultFeeRate,
    }));
    // 切换平台后自动拉取汇率
    await fetchRatesFor(code);
  };

  const fetchRatesFor = async (code: string) => {
    setFetchingRate(true);
    try {
      const res = await fetch("/api/rates");
      const data = await res.json();
      if (data.rates?.[code]) {
        const rate = parseFloat(data.rates[code].toFixed(4));
        setLocal(prev => ({ ...prev, exchangeRate: rate }));
      }
    } catch {}
    setFetchingRate(false);
  };

  const fetchRates = () => fetchRatesFor(local.platformCode);

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
      desc: `${platform.platform} 按类目收取的佣金比例`,
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

        {/* 平台选择 */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">目标平台</p>
              <p className="text-xs text-gray-400 mt-0.5">选择你要销售的平台，汇率和佣金会自动调整</p>
            </div>
            <div className="flex flex-wrap gap-2 max-w-sm justify-end">
              {PLATFORMS.map((p) => (
                <button
                  key={p.code}
                  onClick={() => handlePlatformChange(p.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    local.platformCode === p.code
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  <span>{p.flag}</span>
                  <span>{p.label}</span>
                  <span className={`text-[10px] ${local.platformCode === p.code ? "opacity-70" : "text-gray-400"}`}>
                    {p.symbol}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {local.platformCode && (
            <div className="mt-3 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
              ✅ 当前平台：<strong>{platform.flag} {platform.platform}</strong>，货币：<strong>{platform.symbol} {platform.label}</strong>，默认佣金：<strong>{(platform.defaultFeeRate * 100).toFixed(0)}%</strong>
            </div>
          )}
        </div>

        {/* 汇率 */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">汇率</p>
              <p className="text-xs text-gray-400 mt-0.5">
                1 人民币 = ? {platform.label}（{platform.symbol}）
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step={0.01}
                value={local.exchangeRate}
                onChange={(e) => update("exchangeRate", parseFloat(e.target.value) || 0)}
                className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-400 w-24 truncate">{platform.symbol}/元</span>
              <button
                onClick={fetchRates}
                disabled={fetchingRate}
                className="flex items-center gap-1 text-xs px-3 py-2 border border-gray-200 rounded-lg text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                <RefreshCw size={12} className={fetchingRate ? "animate-spin" : ""} />
                {fetchingRate ? "获取中..." : "自动获取"}
              </button>
            </div>
          </div>
        </div>

        {/* 其他字段 */}
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
        <p className="text-xs font-semibold text-blue-700 mb-2">
          📐 当前参数示例（进价¥10，重量300克）
        </p>
        <div className="text-xs text-blue-600 space-y-1">
          {(() => {
            const cost = 10;
            const weight = 300;
            const ship = local.shippingRatePerGram * weight;
            const total = cost + ship + local.packagingCost;
            const minSell = (total * local.exchangeRate) / (1 - local.platformFeeRate);
            const sym = platform.symbol;
            return (
              <>
                <p>运费 = {weight}克 × {local.shippingRatePerGram}元/克 = <strong>{ship.toFixed(2)}元</strong></p>
                <p>总成本 = {cost} + {ship.toFixed(2)} + {local.packagingCost}(包装) = <strong>{total.toFixed(2)}元</strong></p>
                <p>最低售价 = {total.toFixed(2)} × {local.exchangeRate} ÷ (1-{(local.platformFeeRate*100).toFixed(0)}%) = <strong>{sym}{minSell.toFixed(0)}</strong></p>
              </>
            );
          })()}
        </div>
      </div>

      {/* Ozon API配置 */}
      <div className="mt-6 bg-white rounded-2xl border border-blue-200 overflow-hidden">
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
          <Key size={16} className="text-blue-600" />
          <h3 className="text-sm font-bold text-blue-800">Ozon 卖家 API 配置</h3>
          <span className="ml-auto text-xs text-blue-500">配置后可一键发布商品到Ozon</span>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Client-Id（客户ID）</label>
            <input
              type="text"
              value={ozonClientId}
              onChange={e => setOzonClientId(e.target.value)}
              placeholder="例：4301277"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Api-Key（密钥）</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={ozonApiKey}
                onChange={e => setOzonApiKey(e.target.value)}
                placeholder="例：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                {showKey ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
            📍 获取方式：<a href="https://seller.ozon.ru/app/settings/api-keys" target="_blank" className="text-blue-500 underline">Ozon卖家后台 → 设置 → API密钥</a> → 生成密钥（选"供外部服务/应用使用"）
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={testOzonApi}
              disabled={!ozonClientId || !ozonApiKey || testStatus === "testing"}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {testStatus === "testing" ? <RefreshCw size={13} className="animate-spin"/> : <Key size={13}/>}
              {testStatus === "testing" ? "测试中..." : "测试并保存"}
            </button>
            {testStatus === "ok" && <CheckCircle size={16} className="text-green-500"/>}
            {testStatus === "fail" && <XCircle size={16} className="text-red-500"/>}
            {testMsg && <span className={`text-xs ${testStatus === "ok" ? "text-green-600" : "text-red-500"}`}>{testMsg}</span>}
          </div>
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
