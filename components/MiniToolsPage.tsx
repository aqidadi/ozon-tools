"use client";
import { useState, useRef } from "react";

// ─── 各工具组件 ────────────────────────────────────────

function CurrencyConverter() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("CNY");
  const [to, setTo] = useState("RUB");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const CURRENCIES = ["CNY","USD","RUB","EUR","THB","VND","IDR","MYR","AED","BRL","JPY","KRW","GBP"];
  const convert = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/rates`);
      const d = await r.json();
      const rates = d.rates || {};
      const fromRate = rates[from] ?? 1;
      const toRate = rates[to] ?? 1;
      const val = parseFloat(amount) / fromRate * toRate;
      setResult(`${amount} ${from} = ${val.toFixed(4)} ${to}`);
    } catch { setResult("获取汇率失败，请稍后重试"); }
    setLoading(false);
  };
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={amount} onChange={e=>setAmount(e.target.value)} type="number"
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="金额" />
        <select value={from} onChange={e=>setFrom(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
          {CURRENCIES.map(c=><option key={c}>{c}</option>)}
        </select>
        <button onClick={()=>{const t=from;setFrom(to);setTo(t);setResult(null)}}
          className="px-3 py-2 bg-gray-100 rounded-xl text-sm hover:bg-gray-200">⇄</button>
        <select value={to} onChange={e=>setTo(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
          {CURRENCIES.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <button onClick={convert} disabled={loading}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
        style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)"}}>
        {loading ? "换算中..." : "立即换算"}
      </button>
      {result && <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center font-bold text-indigo-700">{result}</div>}
    </div>
  );
}

function ProfitCalc() {
  const [cost, setCost] = useState("25");
  const [sell, setSell] = useState("8.99");
  const [ship, setShip] = useState("2.5");
  const [comm, setComm] = useState("15");
  const [rate, setRate] = useState("12");
  const p = parseFloat(cost)||0, s = parseFloat(sell)||0, sh = parseFloat(ship)||0, c = parseFloat(comm)||0, r = parseFloat(rate)||1;
  const sellCny = s * r;
  const commAmt = sellCny * c / 100;
  const profit = sellCny - p - sh - commAmt;
  const margin = sellCny > 0 ? (profit / sellCny * 100).toFixed(1) : "0";
  const color = profit > 0 ? "text-green-600" : "text-red-500";
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[
          ["进货价(¥)", cost, setCost],
          ["售价($)", sell, setSell],
          ["运费(¥)", ship, setShip],
          ["平台佣金(%)", comm, setComm],
          ["汇率(×)", rate, setRate],
        ].map(([label, val, setter]) => (
          <div key={label as string}>
            <label className="text-xs text-gray-500 mb-1 block">{label as string}</label>
            <input value={val as string} onChange={e=>(setter as any)(e.target.value)} type="number"
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs">
        <div className="flex justify-between text-gray-500"><span>售价折合人民币</span><span>¥{sellCny.toFixed(2)}</span></div>
        <div className="flex justify-between text-gray-500"><span>平台佣金</span><span>-¥{commAmt.toFixed(2)}</span></div>
        <div className="flex justify-between text-gray-500"><span>运费</span><span>-¥{sh.toFixed(2)}</span></div>
        <div className="flex justify-between text-gray-500"><span>进货成本</span><span>-¥{p.toFixed(2)}</span></div>
        <div className={`flex justify-between font-bold text-sm pt-1 border-t border-gray-200 ${color}`}>
          <span>净利润</span><span>¥{profit.toFixed(2)} ({margin}%)</span>
        </div>
      </div>
    </div>
  );
}

function UnitConverter() {
  const [val, setVal] = useState("1");
  const [type, setType] = useState("weight");
  const [from, setFrom] = useState("kg");
  const [to, setTo] = useState("lb");
  const UNITS: Record<string, Record<string, number>> = {
    weight: { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495, t: 1000 },
    length: { m: 1, cm: 0.01, mm: 0.001, inch: 0.0254, ft: 0.3048, yard: 0.9144 },
    area: { "m²": 1, "cm²": 0.0001, "ft²": 0.092903, "inch²": 0.00064516 },
  };
  const types = Object.keys(UNITS);
  const units = Object.keys(UNITS[type]);
  const result = ((parseFloat(val)||0) * UNITS[type][from] / UNITS[type][to]).toFixed(6).replace(/\.?0+$/, "");
  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {types.map(t=>(
          <button key={t} onClick={()=>{setType(t);setFrom(Object.keys(UNITS[t])[0]);setTo(Object.keys(UNITS[t])[1]);}}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${type===t?"bg-indigo-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {{weight:"重量",length:"长度",area:"面积"}[t]}
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <input value={val} onChange={e=>setVal(e.target.value)} type="number"
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        <select value={from} onChange={e=>setFrom(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
          {units.map(u=><option key={u}>{u}</option>)}
        </select>
        <span className="text-gray-400">→</span>
        <select value={to} onChange={e=>setTo(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
          {units.map(u=><option key={u}>{u}</option>)}
        </select>
      </div>
      <div className="bg-indigo-50 rounded-xl p-3 text-center">
        <span className="text-sm text-gray-500">{val} {from} = </span>
        <span className="text-lg font-bold text-indigo-700">{result} {to}</span>
      </div>
    </div>
  );
}

function EmojiPicker() {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string|null>(null);
  const EMOJIS = [
    {cat:"常用", items:["✅","❌","⭐","🔥","💯","📦","🚀","💰","🎁","📸","🔑","💡","❤️","👍","😊","🎯","💎","🏆","✨","🌟"]},
    {cat:"物品", items:["📱","💻","⌚","🎮","🎧","📷","🖥️","⌨️","🖱️","🔋","💾","📺","📻","🔭","🔬","⚙️","🔧","🔨","🪛","🗂️"]},
    {cat:"运输", items:["✈️","🚢","🚂","🚚","🏭","📦","🏗️","⛵","🚁","🛸","🚠","🛳️","🚀","🛩️","🚤","⚓","🗺️","🌍","🌏","🌎"]},
    {cat:"节日", items:["🎄","🎃","🎆","🎇","🧨","🎉","🎊","🎋","🎍","🎎","🎏","🎐","🎑","🧧","🎀","🎁","🏮","🧸","🪅","🎠"]},
    {cat:"标记", items:["🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","🔶","🔷","🔸","🔹","🔺","🔻","💠","🔘","🔲","🔳","▪️"]},
  ];
  const allItems = EMOJIS.flatMap(g=>g.items);
  const filtered = search ? allItems.filter(e=>e.includes(search)) : null;
  const copy = (e:string) => { navigator.clipboard.writeText(e); setCopied(e); setTimeout(()=>setCopied(null),1500); };
  return (
    <div className="space-y-3">
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索 emoji..."
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
      {copied && <div className="text-center text-xs text-green-600 font-medium">✅ 已复制 {copied}</div>}
      <div className="space-y-2 max-h-52 overflow-y-auto">
        {(filtered ? [{cat:"搜索结果",items:filtered}] : EMOJIS).map(g=>(
          <div key={g.cat}>
            <p className="text-xs text-gray-400 mb-1">{g.cat}</p>
            <div className="flex flex-wrap gap-1">
              {g.items.map(e=>(
                <button key={e} onClick={()=>copy(e)}
                  className={`text-xl hover:bg-indigo-50 rounded-lg p-1 transition-all ${copied===e?"bg-green-50 scale-125":""}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextTools() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("upper");
  const transforms: Record<string,()=>string> = {
    upper: ()=>text.toUpperCase(),
    lower: ()=>text.toLowerCase(),
    title: ()=>text.replace(/\b\w/g,c=>c.toUpperCase()),
    count: ()=>`字数: ${text.length} | 词数: ${text.trim().split(/\s+/).filter(Boolean).length} | 行数: ${text.split("\n").length}`,
    trim: ()=>text.trim().replace(/\s+/g," "),
  };
  const result = transforms[mode]?.() ?? text;
  return (
    <div className="space-y-3">
      <div className="flex gap-1 flex-wrap">
        {[["upper","全大写"],["lower","全小写"],["title","首字母大写"],["count","字数统计"],["trim","去空格"]].map(([m,l])=>(
          <button key={m} onClick={()=>setMode(m)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${mode===m?"bg-indigo-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {l}
          </button>
        ))}
      </div>
      <textarea value={text} onChange={e=>setText(e.target.value)} rows={3} placeholder="输入文字..."
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
      {text && (
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-700 flex-1">{result}</p>
            <button onClick={()=>navigator.clipboard.writeText(result)}
              className="ml-2 text-xs text-indigo-600 hover:underline flex-shrink-0">复制</button>
          </div>
        </div>
      )}
    </div>
  );
}

function HolidayCalendar() {
  const year = new Date().getFullYear();
  const HOLIDAYS = [
    {date:`${year}-01-01`,name:"元旦",market:"🌍全球"},
    {date:`${year}-02-14`,name:"情人节",market:"🌍欧美"},
    {date:`${year}-03-08`,name:"妇女节",market:"🇷🇺俄罗斯"},
    {date:`${year}-03-17`,name:"圣帕特里克节",market:"🇺🇸美国"},
    {date:`${year}-04-01`,name:"愚人节",market:"🌍全球"},
    {date:`${year}-04-20`,name:"复活节",market:"🌍欧美"},
    {date:`${year}-05-12`,name:"母亲节",market:"🌍欧美"},
    {date:`${year}-06-16`,name:"父亲节",market:"🌍欧美"},
    {date:`${year}-07-04`,name:"美国独立日",market:"🇺🇸美国"},
    {date:`${year}-10-31`,name:"万圣节",market:"🌍欧美"},
    {date:`${year}-11-28`,name:"感恩节",market:"🇺🇸美国"},
    {date:`${year}-11-29`,name:"黑色星期五",market:"🌍全球"},
    {date:`${year}-12-02`,name:"网络星期一",market:"🌍全球"},
    {date:`${year}-12-25`,name:"圣诞节",market:"🌍全球"},
    {date:`${year}-12-31`,name:"新年前夜",market:"🌍全球"},
  ];
  const today = new Date();
  const upcoming = HOLIDAYS.filter(h=>new Date(h.date)>=today).slice(0,6);
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400">接下来的重要节日（备货参考）</p>
      {upcoming.map(h=>{
        const d = new Date(h.date);
        const days = Math.ceil((d.getTime()-today.getTime())/(1000*60*60*24));
        return (
          <div key={h.date} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="text-center w-10">
                <p className="text-xs text-gray-400">{d.getMonth()+1}月</p>
                <p className="text-sm font-bold text-gray-800">{d.getDate()}日</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">{h.name}</p>
                <p className="text-[10px] text-gray-400">{h.market}</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${days<=30?"bg-red-100 text-red-600":days<=60?"bg-orange-100 text-orange-600":"bg-gray-100 text-gray-500"}`}>
              {days}天后
            </span>
          </div>
        );
      })}
    </div>
  );
}

function AIPrompts() {
  const [product, setProduct] = useState("");
  const [platform, setPlatform] = useState("Ozon");
  const [lang, setLang] = useState("俄语");
  const [task, setTask] = useState("title");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const TASKS = [
    { id: "title", label: "🏷️ 写商品标题", desc: "生成5个平台标题" },
    { id: "keywords", label: "🔍 关键词挖掘", desc: "生成20个搜索词" },
    { id: "description", label: "✨ 写卖点文案", desc: "3条精炼卖点" },
    { id: "reply", label: "💬 回复差评", desc: "专业回复模板" },
  ];
  const PLATFORMS = ["Ozon", "Shopee", "TikTok Shop", "Amazon", "速卖通", "Lazada"];
  const LANGS = ["俄语", "英语", "泰语", "越南语", "印尼语", "马来语", "阿拉伯语", "中文"];

  const generate = async () => {
    if (!product.trim()) return;
    setLoading(true); setResult(""); setError(""); setCopied(false);
    try {
      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: product.trim(), platform, lang, task }),
      });
      const data = await resp.json();
      if (!data.ok) throw new Error(data.error ?? "生成失败");
      setResult(data.content);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-3">
      {/* 任务选择 */}
      <div className="grid grid-cols-2 gap-1.5">
        {TASKS.map(t => (
          <button key={t.id} onClick={() => { setTask(t.id); setResult(""); }}
            className={`text-left p-2 rounded-xl border text-xs transition-all ${task === t.id ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-gray-100 hover:border-indigo-200 text-gray-600"}`}>
            <div className="font-semibold">{t.label}</div>
            <div className="text-[10px] opacity-60 mt-0.5">{t.desc}</div>
          </button>
        ))}
      </div>

      {/* 输入区 */}
      <div className="space-y-2">
        <input value={product} onChange={e => setProduct(e.target.value)}
          placeholder="输入商品名，如：草编遮阳帽、蓝牙耳机..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50" />
        <div className="flex gap-2">
          <select value={platform} onChange={e => setPlatform(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs bg-white focus:outline-none">
            {PLATFORMS.map(p => <option key={p}>{p}</option>)}
          </select>
          <select value={lang} onChange={e => setLang(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs bg-white focus:outline-none">
            {LANGS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <button onClick={generate} disabled={loading || !product.trim()}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          {loading ? (
            <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> AI 生成中...</>
          ) : "🤖 立即生成"}
        </button>
      </div>

      {/* 结果 */}
      {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600">⚠️ {error}</div>}
      {result && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700">生成结果</span>
            <button onClick={copyResult}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${copied ? "bg-green-100 text-green-600" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
              {copied ? "✅ 已复制" : "复制全部"}
            </button>
          </div>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-sans">{result}</pre>
          <button onClick={generate} className="text-[11px] text-indigo-500 hover:underline">🔄 重新生成</button>
        </div>
      )}
    </div>
  );
}

function FBACalc() {
  const [price, setPrice] = useState("19.99");
  const [weight, setWeight] = useState("0.3");
  const [size, setSize] = useState("standard");
  const p = parseFloat(price)||0, w = parseFloat(weight)||0;
  // 简化版FBA费用估算
  const refFee = p * 0.15;
  const fbaFee = size === "standard" ? (w<=0.25?3.22:w<=0.5?4.17:w<=1?5.14:5.48+Math.max(0,w-1)*0.47) : 
    (w<=1?8.96:w<=2?10.89:w<=3?13.48:15.07+Math.max(0,w-3)*0.24);
  const storageFee = 0.68; // 月均
  const total = refFee + fbaFee + storageFee;
  const profit = p - total;
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">亚马逊美国站FBA费用估算（仅供参考）</p>
      <div className="grid grid-cols-3 gap-2">
        <div><label className="text-xs text-gray-500 mb-1 block">售价($)</label>
          <input value={price} onChange={e=>setPrice(e.target.value)} type="number"
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/></div>
        <div><label className="text-xs text-gray-500 mb-1 block">重量(lb)</label>
          <input value={weight} onChange={e=>setWeight(e.target.value)} type="number"
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/></div>
        <div><label className="text-xs text-gray-500 mb-1 block">尺寸</label>
          <select value={size} onChange={e=>setSize(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none">
            <option value="standard">标准</option>
            <option value="oversize">大件</option>
          </select></div>
      </div>
      <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs">
        <div className="flex justify-between text-gray-500"><span>平台佣金(15%)</span><span>-${refFee.toFixed(2)}</span></div>
        <div className="flex justify-between text-gray-500"><span>FBA配送费</span><span>-${fbaFee.toFixed(2)}</span></div>
        <div className="flex justify-between text-gray-500"><span>月仓储费(估)</span><span>-${storageFee.toFixed(2)}</span></div>
        <div className={`flex justify-between font-bold text-sm pt-1 border-t border-gray-200 ${profit>0?"text-green-600":"text-red-500"}`}>
          <span>预估利润</span><span>${profit.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── 主页面 ────────────────────────────────────────────

const TOOLS = [
  { id: "currency", emoji: "💱", title: "汇率换算", desc: "13种货币实时换算", tag: "实时", component: <CurrencyConverter /> },
  { id: "profit", emoji: "💰", title: "利润计算器", desc: "含运费佣金汇率", tag: "内置", component: <ProfitCalc /> },
  { id: "unit", emoji: "📏", title: "单位换算", desc: "重量/长度/面积互换", tag: "免费", component: <UnitConverter /> },
  { id: "emoji", emoji: "😊", title: "Emoji大全", desc: "一键复制，Listing必备", tag: "免费", component: <EmojiPicker /> },
  { id: "text", emoji: "📝", title: "文字工具", desc: "大小写/字数/去空格", tag: "免费", component: <TextTools /> },
  { id: "holiday", emoji: "📅", title: "节日日历", desc: "欧美/俄罗斯重要节日", tag: "内置", component: <HolidayCalendar /> },
  { id: "ai", emoji: "🤖", title: "AI文案生成", desc: "DeepSeek驱动，真实生成", tag: "独家", component: <AIPrompts /> },
  { id: "fba", emoji: "📦", title: "FBA费用估算", desc: "亚马逊美国站快速测算", tag: "内置", component: <FBACalc /> },
];

const TAG_COLORS: Record<string,string> = {
  "实时": "bg-green-100 text-green-700",
  "内置": "bg-indigo-100 text-indigo-700",
  "免费": "bg-gray-100 text-gray-600",
  "独家": "bg-purple-100 text-purple-700",
};

export function MiniToolsPage() {
  const [active, setActive] = useState("currency");
  const current = TOOLS.find(t=>t.id===active)!;

  return (
    <div className="flex gap-4">
      {/* 左侧工具列表 */}
      <div className="w-40 flex-shrink-0 space-y-1">
        <p className="text-[10px] text-gray-400 font-medium px-2 pb-1">选择工具</p>
        {TOOLS.map(t=>(
          <button key={t.id} onClick={()=>setActive(t.id)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${active===t.id?"bg-indigo-600 text-white shadow":"hover:bg-gray-100 text-gray-700"}`}>
            <span className="text-base">{t.emoji}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{t.title}</p>
              {active===t.id && <p className="text-[10px] text-indigo-200 truncate">{t.desc}</p>}
            </div>
          </button>
        ))}
      </div>

      {/* 右侧工具内容 */}
      <div className="flex-1 bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {/* 工具头部 */}
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3"
          style={{background:"linear-gradient(135deg,#f8f9ff,#f0f4ff)"}}>
          <span className="text-2xl">{current.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">{current.title}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[current.tag]??""}`}>{current.tag}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{current.desc}</p>
          </div>
        </div>

        {/* 工具主体 */}
        <div className="p-5">
          {current.component}
        </div>
      </div>
    </div>
  );
}
