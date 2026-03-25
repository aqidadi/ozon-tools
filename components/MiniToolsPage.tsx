"use client";
import { useState, useEffect } from "react";

// ── 汇率换算 ──────────────────────────────────────────
const CURRENCIES = [
  { code: "CNY", label: "人民币 ¥", flag: "🇨🇳" },
  { code: "RUB", label: "俄罗斯卢布 ₽", flag: "🇷🇺" },
  { code: "USD", label: "美元 $", flag: "🇺🇸" },
  { code: "GBP", label: "英镑 £", flag: "🇬🇧" },
  { code: "THB", label: "泰铢 ฿", flag: "🇹🇭" },
  { code: "IDR", label: "印尼盾 Rp", flag: "🇮🇩" },
  { code: "AED", label: "迪拉姆 د.إ", flag: "🇦🇪" },
  { code: "BRL", label: "巴西雷亚尔 R$", flag: "🇧🇷" },
];

function CurrencyConverter() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("CNY");

  useEffect(() => {
    fetch("/api/rates").then(r => r.json()).then(d => setRates(d.rates || {})).catch(() => {});
  }, []);

  const convert = (to: string) => {
    if (!rates[from] || !rates[to] || !amount) return "—";
    const inCny = parseFloat(amount) / (rates[from] || 1);
    return (inCny * (rates[to] || 1)).toLocaleString("zh-CN", { maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <h3 className="font-semibold text-sm text-gray-800 mb-3">💱 汇率换算</h3>
      <div className="flex gap-2 mb-3">
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
          className="w-28 border rounded-lg px-3 py-1.5 text-sm" placeholder="金额" />
        <select value={from} onChange={e => setFrom(e.target.value)}
          className="flex-1 border rounded-lg px-2 py-1.5 text-sm bg-white">
          {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {CURRENCIES.filter(c => c.code !== from).map(c => (
          <div key={c.code} className="bg-gray-50 rounded-xl px-3 py-2">
            <p className="text-[10px] text-gray-400">{c.flag} {c.label}</p>
            <p className="text-sm font-bold text-gray-800">{convert(c.code)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 利润计算器 ──────────────────────────────────────────
function ProfitCalc() {
  const [cost, setCost] = useState("50");
  const [ship, setShip] = useState("15");
  const [sell, setSell] = useState("150");
  const [comm, setComm] = useState("8");

  const profit = parseFloat(sell) - parseFloat(cost) - parseFloat(ship) - parseFloat(sell) * parseFloat(comm) / 100;
  const margin = (profit / parseFloat(sell) * 100);
  const roi = (profit / (parseFloat(cost) + parseFloat(ship)) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <h3 className="font-semibold text-sm text-gray-800 mb-3">📊 利润计算器</h3>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: "采购成本 ¥", val: cost, set: setCost },
          { label: "国际运费 ¥", val: ship, set: setShip },
          { label: "售价 ¥", val: sell, set: setSell },
          { label: "平台佣金 %", val: comm, set: setComm },
        ].map(f => (
          <div key={f.label}>
            <p className="text-[10px] text-gray-400 mb-0.5">{f.label}</p>
            <input type="number" value={f.val} onChange={e => f.set(e.target.value)}
              className="w-full border rounded-lg px-2 py-1.5 text-sm" />
          </div>
        ))}
      </div>
      <div className={`rounded-xl p-3 ${profit > 0 ? "bg-green-50" : "bg-red-50"}`}>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">净利润</span>
          <span className={`font-bold ${profit > 0 ? "text-green-600" : "text-red-500"}`}>¥{profit.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600">利润率</span>
          <span className="font-bold text-gray-800">{isNaN(margin) ? "—" : margin.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600">ROI</span>
          <span className="font-bold text-gray-800">{isNaN(roi) ? "—" : roi.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

// ── 国际节日日历 ──────────────────────────────────────────
const HOLIDAYS = [
  { date: "2026-01-01", name: "元旦", market: "全球", flag: "🌍" },
  { date: "2026-01-25", name: "春节", market: "中国/东南亚", flag: "🇨🇳" },
  { date: "2026-02-14", name: "情人节", market: "全球", flag: "💝" },
  { date: "2026-03-08", name: "妇女节", market: "俄罗斯（购物高峰）", flag: "🇷🇺" },
  { date: "2026-04-05", name: "复活节", market: "欧美", flag: "🐣" },
  { date: "2026-05-01", name: "劳动节", market: "全球", flag: "🌍" },
  { date: "2026-06-01", name: "儿童节", market: "中国", flag: "🇨🇳" },
  { date: "2026-06-12", name: "俄罗斯国庆", market: "俄罗斯", flag: "🇷🇺" },
  { date: "2026-09-10", name: "教师节", market: "中国", flag: "🇨🇳" },
  { date: "2026-10-01", name: "国庆节", market: "中国", flag: "🇨🇳" },
  { date: "2026-11-04", name: "俄罗斯民族统一日", market: "俄罗斯", flag: "🇷🇺" },
  { date: "2026-11-11", name: "双十一", market: "中国（备货高峰）", flag: "🛒" },
  { date: "2026-11-27", name: "黑色星期五", market: "全球", flag: "🛍️" },
  { date: "2026-12-12", name: "双十二", market: "中国", flag: "🛒" },
  { date: "2026-12-25", name: "圣诞节", market: "欧美/俄罗斯", flag: "🎄" },
  { date: "2026-12-31", name: "新年前夜", market: "俄罗斯（重要）", flag: "🎆" },
].sort((a, b) => a.date.localeCompare(b.date));

function HolidayCalendar() {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = HOLIDAYS.filter(h => h.date >= today).slice(0, 6);

  const daysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date(today).getTime();
    return Math.ceil(diff / 86400000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <h3 className="font-semibold text-sm text-gray-800 mb-3">🗓️ 节日日历</h3>
      <div className="space-y-2">
        {upcoming.map(h => {
          const days = daysUntil(h.date);
          return (
            <div key={h.date} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{h.flag}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{h.name}</p>
                  <p className="text-[10px] text-gray-400">{h.market} · {h.date}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${days <= 14 ? "bg-red-100 text-red-600" : days <= 30 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}>
                {days === 0 ? "今天" : `${days}天后`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 物流时效参考 ──────────────────────────────────────────
const LOGISTICS = [
  { route: "中国→俄罗斯", methods: [
    { name: "俄速通/中俄班列", days: "25-35天", price: "偏高", reliable: true },
    { name: "平邮EMS", days: "30-50天", price: "低", reliable: false },
    { name: "空运快递", days: "7-15天", price: "高", reliable: true },
  ]},
  { route: "中国→东南亚", methods: [
    { name: "J&T/顺丰国际", days: "5-10天", price: "中", reliable: true },
    { name: "Shopee物流", days: "7-14天", price: "低", reliable: true },
    { name: "EMS小包", days: "10-20天", price: "低", reliable: false },
  ]},
  { route: "中国→中东", methods: [
    { name: "中东专线", days: "10-20天", price: "中", reliable: true },
    { name: "DHL/FedEx", days: "5-7天", price: "很高", reliable: true },
  ]},
];

function LogisticsRef() {
  const [open, setOpen] = useState<string | null>("中国→俄罗斯");
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <h3 className="font-semibold text-sm text-gray-800 mb-3">📦 物流时效参考</h3>
      <div className="space-y-2">
        {LOGISTICS.map(l => (
          <div key={l.route}>
            <button onClick={() => setOpen(open === l.route ? null : l.route)}
              className="w-full flex justify-between items-center text-xs font-semibold text-gray-700 py-1.5 px-2 bg-gray-50 rounded-lg">
              <span>{l.route}</span>
              <span>{open === l.route ? "▲" : "▼"}</span>
            </button>
            {open === l.route && (
              <div className="mt-1 space-y-1">
                {l.methods.map(m => (
                  <div key={m.name} className="flex justify-between items-center px-2 py-1.5 text-xs text-gray-600 border-b border-gray-50">
                    <div>
                      <span className="font-medium">{m.name}</span>
                      {m.reliable && <span className="ml-1 text-[9px] bg-green-100 text-green-600 px-1 rounded">推荐</span>}
                    </div>
                    <div className="text-right">
                      <span className="text-gray-800 font-medium">{m.days}</span>
                      <span className="ml-2 text-gray-400">运费{m.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 主页面 ──────────────────────────────────────────
export function MiniToolsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🧰</span>
        <div>
          <h2 className="text-base font-bold text-gray-800">实用小工具</h2>
          <p className="text-xs text-gray-400">跨境常用工具集，随手可查</p>
        </div>
      </div>
      <CurrencyConverter />
      <ProfitCalc />
      <HolidayCalendar />
      <LogisticsRef />
    </div>
  );
}
