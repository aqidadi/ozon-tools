"use client";
import { useState, useRef, useCallback, useEffect } from "react";

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
  const [ship, setShip] = useState("2.5");
  const [comm, setComm] = useState("15");
  const [targetMargin, setTargetMargin] = useState("30");
  const [rate, setRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const CURRENCIES = [
    { code: "USD", symbol: "$", name: "美元" },
    { code: "RUB", symbol: "₽", name: "卢布" },
    { code: "THB", symbol: "฿", name: "泰铢" },
    { code: "VND", symbol: "₫", name: "越南盾" },
    { code: "IDR", symbol: "Rp", name: "印尼盾" },
    { code: "MYR", symbol: "RM", name: "马来西亚令吉" },
    { code: "AED", symbol: "د.إ", name: "迪拉姆" },
    { code: "BRL", symbol: "R$", name: "巴西雷亚尔" },
    { code: "EUR", symbol: "€", name: "欧元" },
    { code: "GBP", symbol: "£", name: "英镑" },
  ];
  const cur = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const fetchRate = useCallback(async (cur: string) => {
    setRateLoading(true); setRateError(false);
    try {
      const r = await fetch("/api/rates");
      const d = await r.json();
      const rates = d.rates || {};
      const cnyCnyRate = rates["CNY"] ?? 1;
      const currRate = rates[cur] ?? 1;
      setRate(cnyCnyRate / currRate);
    } catch {
      setRateError(true);
    }
    setRateLoading(false);
  }, []);

  useEffect(() => { fetchRate(currency); }, [currency, fetchRate]);

  const p = parseFloat(cost) || 0;
  const sh = parseFloat(ship) || 0;
  const c = (parseFloat(comm) || 0) / 100;
  const m = (parseFloat(targetMargin) || 0) / 100;
  const r = rate || 1;

  // Recommended sell price: sell_cny = (cost + ship) / (1 - comm% - margin%)
  const denom = 1 - c - m;
  const valid = denom > 0.01 && r > 0;
  const sellCny = valid ? (p + sh) / denom : 0;
  const sellForeign = valid ? sellCny / r : 0;
  const commAmt = sellCny * c;
  const profit = sellCny - p - sh - commAmt;
  const actualMargin = sellCny > 0 ? (profit / sellCny * 100).toFixed(1) : "0";

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

  return (
    <div className="space-y-3">
      {/* 货币选择 */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">售价货币</label>
        <div className="flex flex-wrap gap-1.5">
          {CURRENCIES.map(cc => (
            <button key={cc.code} onClick={() => setCurrency(cc.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${currency === cc.code ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {cc.symbol} {cc.code}
            </button>
          ))}
        </div>
      </div>

      {/* 汇率显示（自动获取） */}
      <div className="flex items-center justify-between bg-indigo-50 rounded-xl px-3 py-2">
        <span className="text-xs text-indigo-600 font-medium">
          实时汇率：1 {cur.symbol} =
          {rateLoading ? " 获取中..." : rateError ? " 获取失败" : ` ¥${r.toFixed(4)}`}
        </span>
        <button onClick={() => fetchRate(currency)} disabled={rateLoading}
          className="text-xs text-indigo-500 hover:text-indigo-700 disabled:opacity-40 transition-colors">
          🔄 刷新
        </button>
      </div>

      {/* 输入项 */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">进货价 (¥)</label>
          <input value={cost} onChange={e => setCost(e.target.value)} type="number" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">运费 (¥)</label>
          <input value={ship} onChange={e => setShip(e.target.value)} type="number" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">平台佣金 (%)</label>
          <input value={comm} onChange={e => setComm(e.target.value)} type="number" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">目标利润率 (%)</label>
          <input value={targetMargin} onChange={e => setTargetMargin(e.target.value)} type="number" className={inputCls} />
        </div>
      </div>

      {/* 推荐售价 */}
      {valid ? (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-3 text-white text-center">
          <p className="text-xs opacity-80 mb-0.5">推荐售价</p>
          <p className="text-2xl font-bold">{cur.symbol}{sellForeign.toFixed(2)}</p>
          <p className="text-xs opacity-70 mt-0.5">≈ ¥{sellCny.toFixed(2)}</p>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center text-xs text-red-500">
          佣金 + 利润率不能超过 100%，请调整参数
        </div>
      )}

      {/* 明细 */}
      {valid && (
        <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-gray-500"><span>进货成本</span><span>-¥{p.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-500"><span>运费</span><span>-¥{sh.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-500"><span>平台佣金</span><span>-¥{commAmt.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-200 text-green-600">
            <span>净利润</span><span>¥{profit.toFixed(2)} ({actualMargin}%)</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Translator() {
  const [text, setText] = useState("");
  const [to, setTo] = useState("ru");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const LANGS = [
    { code: "ru", label: "俄语", flag: "🇷🇺" },
    { code: "en", label: "英语", flag: "🇺🇸" },
    { code: "th", label: "泰语", flag: "🇹🇭" },
    { code: "vi", label: "越南语", flag: "🇻🇳" },
    { code: "id", label: "印尼语", flag: "🇮🇩" },
    { code: "ms", label: "马来语", flag: "🇲🇾" },
    { code: "es", label: "西班牙语", flag: "🇪🇸" },
    { code: "ar", label: "阿拉伯语", flag: "🇸🇦" },
  ];
  const translate = async () => {
    if (!text.trim()) return;
    setLoading(true); setResult(""); setCopied(false);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), to, from: "zh" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result || data.text || "");
    } catch (e: unknown) {
      setResult("翻译失败，请稍后重试");
    }
    setLoading(false);
  };
  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {LANGS.map(l => (
          <button key={l.code} onClick={() => { setTo(l.code); setResult(""); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${to === l.code ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {l.flag} {l.label}
          </button>
        ))}
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
        placeholder="输入中文，翻译成目标语言（适合写商品标题/描述）"
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300" />
      <button onClick={translate} disabled={loading || !text.trim()}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
        {loading ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> 翻译中...</> : "🌐 立即翻译"}
      </button>
      {result && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700">{LANGS.find(l => l.code === to)?.flag} 翻译结果</span>
            <button onClick={copy} className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${copied ? "bg-green-100 text-green-600" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
              {copied ? "✅ 已复制" : "复制"}
            </button>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">{result}</p>
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

// ─── Ozon 上品模板 ───────────────────────────────────────
type OzonTag = { ru: string; zh: string };
const OZON_CATS = [
  {
    id: "plush", emoji: "🧸", zh: "毛绒玩具", ru: "Мягкие игрушки",
    path: "Детские товары > Игрушки > Мягкие игрушки",
    defaults: {
      nameRu: "Мягкая плюшевая игрушка Мишка, 30 см, белый",
      nameZh: "软毛绒小熊玩具，30厘米，白色",
      sku: "PLU-001", brand: "Нет бренда", color: "Белый / 白色",
      size: "30 см", material: "Плюш / 毛绒",
      descRu: "Мягкая плюшевая игрушка из высококачественного гипоаллергенного плюша. Наполнитель — холофайбер, безопасный для детей от 3 лет. Приятная на ощупь, идеально подходит для сна, игры и в качестве подарка. Доступны разные размеры и цвета.",
      descZh: "高品质防过敏毛绒玩具，中空纤维填充，适合3岁以上儿童。手感柔软，适合睡觉、玩耍或送礼。有多种尺寸和颜色可选。",
      l: "320", w: "220", h: "220", wt: "400",
    },
    tags: [
      {ru:"мягкая игрушка",zh:"软玩具"},{ru:"плюшевая игрушка",zh:"毛绒玩具"},{ru:"игрушка медведь",zh:"小熊玩具"},{ru:"игрушка кролик",zh:"兔子玩具"},{ru:"игрушка кот",zh:"猫咪玩具"},
      {ru:"игрушка собака",zh:"狗狗玩具"},{ru:"игрушка панда",zh:"熊猫玩具"},{ru:"игрушка единорог",zh:"独角兽玩具"},{ru:"игрушка для детей",zh:"儿童玩具"},{ru:"подарок ребёнку",zh:"儿童礼物"},
      {ru:"мягкий медвежонок",zh:"软小熊"},{ru:"плюш",zh:"毛绒布料"},{ru:"детская игрушка",zh:"童玩具"},{ru:"аниме игрушка",zh:"动漫玩具"},{ru:"мягкий котик",zh:"软猫咪"},
      {ru:"игрушка обнимашка",zh:"抱枕玩具"},{ru:"подарок на день рождения",zh:"生日礼物"},{ru:"антистресс игрушка",zh:"解压玩具"},{ru:"мягкая кукла",zh:"软布偶"},{ru:"декор комнаты",zh:"房间装饰"},
      {ru:"мягкий зверь",zh:"软动物"},{ru:"игрушка 30 см",zh:"30厘米玩具"},{ru:"игрушка 50 см",zh:"50厘米玩具"},{ru:"плюшевый заяц",zh:"毛绒兔子"},{ru:"подарок девочке",zh:"女孩礼物"},
      {ru:"подарок мальчику",zh:"男孩礼物"},{ru:"мягкий дракон",zh:"软龙玩具"},{ru:"коллекционная игрушка",zh:"收藏玩具"},{ru:"мягкая игрушка большая",zh:"大型软玩具"},{ru:"гипоаллергенная игрушка",zh:"无过敏原玩具"},
    ] as OzonTag[],
  },
  {
    id: "phone", emoji: "📱", zh: "手机壳", ru: "Чехол для телефона",
    path: "Электроника > Аксессуары для телефонов > Чехлы",
    defaults: {
      nameRu: "Силиконовый прозрачный чехол для iPhone 15, противоударный",
      nameZh: "苹果15透明硅胶防摔手机壳",
      sku: "CASE-001", brand: "Нет бренда", color: "Прозрачный / 透明",
      size: "iPhone 15", material: "Силикон / 硅胶",
      descRu: "Надёжный силиконовый чехол с защитой от ударов и царапин. Тонкий профиль не утяжеляет телефон. Точные вырезы для кнопок, камеры и разъёмов. Материал — высококачественный TPU, не желтеет со временем.",
      descZh: "可靠的硅胶防摔手机壳，防震防划。超薄不增重。按键摄像头开孔精准。高品质TPU材料，不发黄。",
      l: "165", w: "85", h: "12", wt: "60",
    },
    tags: [
      {ru:"чехол для телефона",zh:"手机壳"},{ru:"силиконовый чехол",zh:"硅胶手机壳"},{ru:"прозрачный чехол",zh:"透明手机壳"},{ru:"чехол iPhone",zh:"苹果手机壳"},{ru:"чехол Samsung",zh:"三星手机壳"},
      {ru:"чехол Xiaomi",zh:"小米手机壳"},{ru:"защитный чехол",zh:"防摔手机壳"},{ru:"чехол книжка",zh:"翻盖手机壳"},{ru:"противоударный чехол",zh:"防震手机壳"},{ru:"чехол с рисунком",zh:"印花手机壳"},
      {ru:"чехол аниме",zh:"动漫手机壳"},{ru:"мягкий чехол",zh:"软壳"},{ru:"накладка на телефон",zh:"手机贴壳"},{ru:"чехол с принтом",zh:"印刷壳"},{ru:"чехол для девушки",zh:"女生手机壳"},
      {ru:"тонкий чехол",zh:"超薄手机壳"},{ru:"матовый чехол",zh:"哑光手机壳"},{ru:"цветной чехол",zh:"彩色手机壳"},{ru:"чехол кошелёк",zh:"钱包手机壳"},{ru:"чехол для карт",zh:"卡包手机壳"},
      {ru:"магнитный чехол",zh:"磁吸手机壳"},{ru:"чехол с ремешком",zh:"带绳手机壳"},{ru:"дизайнерский чехол",zh:"设计师手机壳"},{ru:"чехол Huawei",zh:"华为手机壳"},{ru:"чехол OPPO",zh:"OPPO手机壳"},
      {ru:"чехол Redmi",zh:"红米手机壳"},{ru:"защита от падений",zh:"防摔保护"},{ru:"чехол зеркало",zh:"镜面手机壳"},{ru:"чехол с подставкой",zh:"支架手机壳"},{ru:"TPU чехол",zh:"TPU材质手机壳"},
    ] as OzonTag[],
  },
  {
    id: "digital", emoji: "🔌", zh: "数码配件", ru: "Цифровые аксессуары",
    path: "Электроника > Аксессуары > Кабели и зарядные устройства",
    defaults: {
      nameRu: "Кабель USB Type-C, быстрая зарядка 120 Вт, нейлон, 1 м",
      nameZh: "USB-C快充线120W尼龙编织1米",
      sku: "CBL-001", brand: "Нет бренда", color: "Чёрный / 黑色",
      size: "1 м", material: "Нейлон / 尼龙编织",
      descRu: "Прочный нейлоновый кабель для быстрой зарядки 120 Вт и передачи данных. Усиленные коннекторы выдерживают более 20 000 изгибов. Совместим с большинством устройств USB-C. Встроенный чип защиты от перегрева и перегрузки.",
      descZh: "耐用尼龙编织120W快充数据线。加固接头耐弯折超2万次。兼容大多数USB-C设备。内置防过热过载保护芯片。",
      l: "150", w: "80", h: "15", wt: "50",
    },
    tags: [
      {ru:"USB кабель",zh:"USB数据线"},{ru:"кабель для зарядки",zh:"充电线"},{ru:"беспроводная зарядка",zh:"无线充电"},{ru:"наушники TWS",zh:"TWS耳机"},{ru:"bluetooth наушники",zh:"蓝牙耳机"},
      {ru:"powerbank",zh:"移动电源"},{ru:"внешний аккумулятор",zh:"充电宝"},{ru:"кардридер",zh:"读卡器"},{ru:"USB хаб",zh:"USB集线器"},{ru:"переходник",zh:"转接头"},
      {ru:"кабель Type-C",zh:"Type-C数据线"},{ru:"Lightning кабель",zh:"苹果数据线"},{ru:"зарядное устройство",zh:"充电器"},{ru:"быстрая зарядка",zh:"快速充电"},{ru:"USB-C адаптер",zh:"USB-C转接器"},
      {ru:"аккумулятор для телефона",zh:"手机电池"},{ru:"держатель для телефона",zh:"手机支架"},{ru:"автодержатель",zh:"车载支架"},{ru:"аксессуары для гаджетов",zh:"数码配件"},{ru:"кабель 2 м",zh:"2米数据线"},
      {ru:"кабель 3 м",zh:"3米数据线"},{ru:"зарядка 65 Вт",zh:"65W充电器"},{ru:"зарядка 120 Вт",zh:"120W充电器"},{ru:"шнур плетёный",zh:"编织线"},{ru:"защита кабеля",zh:"护线套"},
      {ru:"аксессуары Android",zh:"安卓配件"},{ru:"магнитный кабель",zh:"磁吸数据线"},{ru:"Type-C на Lightning",zh:"Type-C转苹果"},{ru:"USB хаб 4 порта",zh:"四口USB集线器"},{ru:"сетевой адаптер",zh:"网络适配器"},
    ] as OzonTag[],
  },
  {
    id: "clothes", emoji: "👕", zh: "服装", ru: "Одежда",
    path: "Одежда, обувь и аксессуары > Женская одежда > Футболки",
    defaults: {
      nameRu: "Футболка женская оверсайз с принтом аниме, хлопок, унисекс",
      nameZh: "女款宽松动漫印花纯棉T恤，男女通用",
      sku: "TEE-001", brand: "Нет бренда", color: "Белый / 白色",
      size: "S / M / L / XL / XXL", material: "Хлопок 100% / 纯棉",
      descRu: "Стильная футболка оверсайз из мягкого 100% хлопка. Воздухопроницаемый материал, приятный на ощупь. Принт нанесён методом прямой цифровой печати, не выцветает после стирки. Универсальный унисекс крой подходит как женщинам, так и мужчинам.",
      descZh: "宽松款100%纯棉T恤，透气柔软。数码直印工艺，洗后不褪色。男女通用版型。",
      l: "350", w: "280", h: "20", wt: "250",
    },
    tags: [
      {ru:"футболка",zh:"T恤"},{ru:"толстовка",zh:"卫衣"},{ru:"худи",zh:"连帽卫衣"},{ru:"кофта",zh:"上衣"},{ru:"платье",zh:"连衣裙"},
      {ru:"брюки",zh:"裤子"},{ru:"куртка",zh:"外套"},{ru:"ветровка",zh:"风衣"},{ru:"спортивный костюм",zh:"运动套装"},{ru:"одежда оверсайз",zh:"宽松版型"},
      {ru:"стильная одежда",zh:"时尚服装"},{ru:"одежда аниме",zh:"动漫服装"},{ru:"летняя одежда",zh:"夏季服装"},{ru:"зимняя одежда",zh:"冬季服装"},{ru:"женская одежда",zh:"女装"},
      {ru:"мужская одежда",zh:"男装"},{ru:"детская одежда",zh:"童装"},{ru:"хлопковая одежда",zh:"棉质服装"},{ru:"повседневная одежда",zh:"日常服装"},{ru:"модная одежда",zh:"时髦服装"},
      {ru:"одежда с принтом",zh:"印花服装"},{ru:"корейский стиль",zh:"韩系风格"},{ru:"японский стиль",zh:"日系风格"},{ru:"уличный стиль",zh:"街头风格"},{ru:"одежда унисекс",zh:"男女通用"},
      {ru:"мягкая ткань",zh:"柔软面料"},{ru:"цветная одежда",zh:"彩色服装"},{ru:"новая коллекция",zh:"新品系列"},{ru:"оверсайз футболка",zh:"宽松T恤"},{ru:"принт аниме",zh:"动漫印花"},
    ] as OzonTag[],
  },
  {
    id: "home", emoji: "🏠", zh: "家居", ru: "Товары для дома",
    path: "Дом и сад > Интерьер > Декоративные подушки",
    defaults: {
      nameRu: "Декоративная подушка с принтом аниме, 45×45 см, хлопок",
      nameZh: "动漫印花装饰抱枕，45×45厘米，棉质",
      sku: "PIL-001", brand: "Нет бренда", color: "Бежевый / 米色",
      size: "45×45 см", material: "Хлопок / 棉布",
      descRu: "Мягкая декоративная подушка с ярким принтом. Наволочка на молнии, съёмная для стирки. Наполнитель — силиконизированное волокно, сохраняет форму. Украсит диван, кресло или кровать.",
      descZh: "带鲜艳印花的软装饰抱枕。枕套带拉链可拆洗。硅化纤维填充，保持形状。适合沙发、椅子或床铺装饰。",
      l: "480", w: "480", h: "150", wt: "600",
    },
    tags: [
      {ru:"декоративная подушка",zh:"装饰抱枕"},{ru:"плед",zh:"毯子"},{ru:"одеяло",zh:"被子"},{ru:"постельное бельё",zh:"床上用品"},{ru:"полотенце",zh:"毛巾"},
      {ru:"органайзер",zh:"收纳盒"},{ru:"подставка",zh:"支架"},{ru:"светильник",zh:"灯具"},{ru:"ночник",zh:"夜灯"},{ru:"диффузор",zh:"香薰扩散器"},
      {ru:"аромасвечи",zh:"香薰蜡烛"},{ru:"декор дома",zh:"家居装饰"},{ru:"интерьерная игрушка",zh:"室内摆件"},{ru:"вазон",zh:"花瓶"},{ru:"рамка для фото",zh:"相框"},
      {ru:"коврик",zh:"地毯"},{ru:"занавески",zh:"窗帘"},{ru:"корзина",zh:"收纳篮"},{ru:"контейнер для хранения",zh:"储物盒"},{ru:"крючок",zh:"挂钩"},
      {ru:"полка",zh:"置物架"},{ru:"зеркало",zh:"镜子"},{ru:"часы настенные",zh:"挂钟"},{ru:"гирлянда",zh:"彩灯串"},{ru:"домашний текстиль",zh:"家用纺织品"},
      {ru:"кухонные аксессуары",zh:"厨房用品"},{ru:"уют дома",zh:"居家舒适"},{ru:"скандинавский стиль",zh:"北欧风格"},{ru:"японский декор",zh:"日式装饰"},{ru:"аниме декор",zh:"动漫装饰"},
    ] as OzonTag[],
  },
  {
    id: "beauty", emoji: "💄", zh: "美妆护肤", ru: "Косметика и уход",
    path: "Красота и здоровье > Уход за лицом > Кремы",
    defaults: {
      nameRu: "Увлажняющий крем для лица с гиалуроновой кислотой, 50 мл",
      nameZh: "玻尿酸保湿面霜，50毫升",
      sku: "CRM-001", brand: "Нет бренда", color: "—",
      size: "50 мл", material: "—",
      descRu: "Лёгкий увлажняющий крем с гиалуроновой кислотой для глубокого увлажнения кожи. Подходит для всех типов кожи, в том числе чувствительной. Без парабенов и искусственных красителей. Быстро впитывается, не оставляет жирного блеска. Эффект заметен уже после первого применения.",
      descZh: "含玻尿酸的轻盈保湿面霜，深层补水。适合所有肤质，包括敏感肌。无防腐剂无人工色素，吸收快不油腻，首次使用即见效。",
      l: "70", w: "70", h: "90", wt: "120",
    },
    tags: [
      {ru:"крем для лица",zh:"面霜"},{ru:"сыворотка",zh:"精华液"},{ru:"тональный крем",zh:"粉底液"},{ru:"помада",zh:"口红"},{ru:"тушь для ресниц",zh:"睫毛膏"},
      {ru:"тени для век",zh:"眼影"},{ru:"консилер",zh:"遮瑕膏"},{ru:"хайлайтер",zh:"高光"},{ru:"румяна",zh:"腮红"},{ru:"маска для лица",zh:"面膜"},
      {ru:"патч под глаза",zh:"眼膜贴"},{ru:"уходовая косметика",zh:"护肤品"},{ru:"корейская косметика",zh:"韩国护肤"},{ru:"японская косметика",zh:"日本护肤"},{ru:"натуральная косметика",zh:"天然护肤"},
      {ru:"увлажняющий крем",zh:"保湿霜"},{ru:"SPF крем",zh:"防晒霜"},{ru:"ночной крем",zh:"晚霜"},{ru:"дневной крем",zh:"日霜"},{ru:"эссенция",zh:"精萃"},
      {ru:"тонер",zh:"爽肤水"},{ru:"мицеллярная вода",zh:"卸妆水"},{ru:"пенка для умывания",zh:"洁面泡沫"},{ru:"скраб для лица",zh:"磨砂膏"},{ru:"бальзам для губ",zh:"润唇膏"},
      {ru:"карандаш для глаз",zh:"眼线笔"},{ru:"лак для ногтей",zh:"指甲油"},{ru:"блеск для губ",zh:"唇彩"},{ru:"набор косметики",zh:"化妆套装"},{ru:"гиалуроновая кислота",zh:"玻尿酸"},
    ] as OzonTag[],
  },
];

function OzonTemplate() {
  const [cat, setCat] = useState("plush");
  const [form, setForm] = useState<Record<string,string>>({});
  const [copied, setCopied] = useState(false);
  const [tagsCopied, setTagsCopied] = useState(false);

  const selected = OZON_CATS.find(c => c.id === cat)!;
  const d = selected.defaults;
  const val = (key: string) => form[`${cat}_${key}`] ?? d[key as keyof typeof d] ?? "";
  const set = (key: string, v: string) => setForm(f => ({...f, [`${cat}_${key}`]: v}));

  const SIMPLE_FIELDS: {key: string; zh: string; ru: string}[] = [
    { key: "sku",      zh: "货号",           ru: "Артикул" },
    { key: "brand",    zh: "品牌",           ru: "Бренд" },
    { key: "color",    zh: "颜色",           ru: "Цвет" },
    { key: "size",     zh: "尺寸/规格",      ru: "Размер" },
    { key: "material", zh: "材质",           ru: "Материал" },
    { key: "l",        zh: "包装长度 (mm)",  ru: "Длина упаковки (мм)" },
    { key: "w",        zh: "包装宽度 (mm)",  ru: "Ширина упаковки (мм)" },
    { key: "h",        zh: "包装高度 (mm)",  ru: "Высота упаковки (мм)" },
    { key: "wt",       zh: "含包装重量 (g)", ru: "Вес с упаковкой (г)" },
  ];

  const nameRu = form[`${cat}_nameRu`] ?? d.nameRu;
  const descRu = form[`${cat}_descRu`] ?? d.descRu;

  const copyAll = () => {
    const lines = [
      `Название товара / 商品名称:\n${nameRu}`,
      "",
      ...SIMPLE_FIELDS.map(f => `${f.ru} / ${f.zh}:\n${val(f.key)}`),
      "",
      `Описание / 商品描述:\n${descRu}`,
      "",
      `Теги / 标签 (${selected.tags.length}):\n${selected.tags.map(t => t.ru).join(", ")}`,
    ].join("\n");
    navigator.clipboard.writeText(lines);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const copyTags = () => {
    navigator.clipboard.writeText(selected.tags.map(t => t.ru).join("\n"));
    setTagsCopied(true); setTimeout(() => setTagsCopied(false), 2000);
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";
  const hintCls = "mt-1 text-xs text-orange-500 bg-orange-50 rounded-lg px-2.5 py-1.5 leading-relaxed";

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        {OZON_CATS.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${cat === c.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {c.emoji} {c.zh}
          </button>
        ))}
      </div>

      {/* Category path */}
      <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 font-mono">
        📂 {selected.path}
      </div>

      {/* 商品名称 */}
      <div>
        <label className="text-xs font-medium mb-1 flex items-center gap-1.5">
          <span className="text-gray-700">商品名称</span>
          <span className="text-gray-300">/</span>
          <span className="text-blue-500">Название товара</span>
        </label>
        <textarea value={nameRu} onChange={e => setForm(f => ({...f, [`${cat}_nameRu`]: e.target.value}))} rows={2}
          className={`${inputCls} resize-none`} />
        <p className={hintCls}>中文参考：{d.nameZh}</p>
      </div>

      {/* Simple fields */}
      <div className="grid grid-cols-2 gap-2">
        {SIMPLE_FIELDS.map(f => (
          <div key={f.key}>
            <label className="text-xs font-medium mb-1 flex items-center gap-1">
              <span className="text-gray-700">{f.zh}</span>
              <span className="text-gray-300">/</span>
              <span className="text-blue-500 truncate">{f.ru}</span>
            </label>
            <input value={val(f.key)} onChange={e => set(f.key, e.target.value)} className={inputCls} />
          </div>
        ))}
      </div>

      {/* 商品描述 */}
      <div>
        <label className="text-xs font-medium mb-1 flex items-center gap-1.5">
          <span className="text-gray-700">商品描述</span>
          <span className="text-gray-300">/</span>
          <span className="text-blue-500">Описание</span>
        </label>
        <textarea value={descRu} onChange={e => setForm(f => ({...f, [`${cat}_descRu`]: e.target.value}))} rows={4}
          className={`${inputCls} resize-none`} />
        <p className={hintCls}>中文参考：{d.descZh}</p>
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-700">
            #主题标签 / Теги <span className="text-blue-500">({selected.tags.length}个)</span>
          </label>
          <button onClick={copyTags}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${tagsCopied ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>
            {tagsCopied ? "✅ 已复制" : "一键复制俄文标签"}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {selected.tags.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs whitespace-nowrap">
              #{tag.ru} <span className="text-gray-400">({tag.zh})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Copy all Russian */}
      <button onClick={copyAll}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
        style={{background:"linear-gradient(135deg,#3b82f6,#6366f1)"}}>
        {copied ? "✅ 已复制俄文内容" : "📋 一键复制俄文"}
      </button>
    </div>
  );
}

const TOOLS = [
  { id: "currency", emoji: "💱", title: "汇率换算", desc: "13种货币实时换算", tag: "实时", component: <CurrencyConverter /> },
  { id: "translate", emoji: "🌐", title: "文字翻译", desc: "中文→俄/英/泰等8种语言", tag: "实时", component: <Translator /> },
  { id: "profit", emoji: "💰", title: "利润计算器", desc: "含运费佣金汇率", tag: "内置", component: <ProfitCalc /> },
  { id: "holiday", emoji: "📅", title: "节日日历", desc: "欧美/俄罗斯重要节日", tag: "内置", component: <HolidayCalendar /> },
  { id: "ai", emoji: "🤖", title: "AI文案生成", desc: "DeepSeek驱动，真实生成", tag: "独家", component: <AIPrompts /> },
  { id: "fba", emoji: "📦", title: "FBA费用估算", desc: "亚马逊美国站快速测算", tag: "内置", component: <FBACalc /> },
  { id: "imgru", emoji: "🖼️", title: "图片俄化", desc: "一键加俄文+适配Ozon尺寸", tag: "新功能", component: <ImageRussify /> },
  { id: "imgconv", emoji: "🔄", title: "图片格式转换", desc: "批量转JPG/PNG/WebP/AVIF", tag: "新功能", component: <ImageConverter /> },
  { id: "ozontemplate", emoji: "📋", title: "Ozon上品模板", desc: "6大类目字段+30个标签", tag: "实用", component: <OzonTemplate /> },
];

const TAG_COLORS: Record<string,string> = {
  "实时": "bg-green-100 text-green-700",
  "内置": "bg-indigo-100 text-indigo-700",
  "免费": "bg-gray-100 text-gray-600",
  "独家": "bg-purple-100 text-purple-700",
  "新功能": "bg-orange-100 text-orange-700",
  "实用": "bg-blue-100 text-blue-700",
};

// ─── 批量图片格式转换 ────────────────────────────────────
type ConvertItem = {
  id: string;
  name: string;
  originalSize: number;
  status: "waiting" | "converting" | "done" | "error";
  outputUrl?: string;
  outputSize?: number;
  outputName?: string;
};

// formats handled by Canvas (client-side) vs Sharp API (server-side)
const SERVER_FORMATS = ["avif", "tiff"];

function ImageConverter() {
  const [items, setItems] = useState<ConvertItem[]>([]);
  const [format, setFormat] = useState<"jpeg" | "png" | "webp" | "avif" | "tiff">("jpeg");
  const [quality, setQuality] = useState(80);
  const [converting, setConverting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!arr.length) return;
    const newItems: ConvertItem[] = arr.map(f => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      originalSize: f.size,
      status: "waiting",
      _file: f,
    } as ConvertItem & { _file: File }));
    setItems(prev => [...prev, ...newItems]);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const convertAll = async () => {
    setConverting(true);
    const extMap: Record<string, string> = { jpeg: "jpg", png: "png", webp: "webp", avif: "avif", tiff: "tiff" };
    const ext = extMap[format] ?? format;
    const mime = `image/${format}`;
    const q = quality / 100;
    const useServer = SERVER_FORMATS.includes(format);

    setItems(prev => prev.map(it => it.status === "done" ? it : { ...it, status: "converting" }));

    const current = items;
    const results: Partial<ConvertItem>[] = await Promise.all(
      current.map(async (it) => {
        if (it.status === "done") return {};
        try {
          const file = (it as ConvertItem & { _file: File })._file;
          const baseName = it.name.replace(/\.[^.]+$/, "");
          const outputName = `${baseName}.${ext}`;

          let outputUrl: string;
          let outputSize: number;

          if (useServer) {
            // server-side: send file to /api/img-convert
            const fd = new FormData();
            fd.append("file", file);
            fd.append("format", format);
            fd.append("quality", String(quality));
            const res = await fetch("/api/img-convert", { method: "POST", body: fd });
            if (!res.ok) throw new Error(await res.text());
            const blob = await res.blob();
            outputSize = blob.size;
            outputUrl = URL.createObjectURL(blob);
          } else {
            // client-side canvas
            const dataUrl: string = await new Promise((res, rej) => {
              const reader = new FileReader();
              reader.onload = ev => res(ev.target!.result as string);
              reader.onerror = rej;
              reader.readAsDataURL(file);
            });
            outputUrl = await new Promise(res => {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext("2d")!;
                if (format !== "png") {
                  ctx.fillStyle = "#ffffff";
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.drawImage(img, 0, 0);
                res(canvas.toDataURL(mime, q));
              };
              img.src = dataUrl;
            });
            const base64 = outputUrl.split(",")[1];
            outputSize = Math.round(base64.length * 0.75);
          }

          return { id: it.id, status: "done" as const, outputUrl, outputSize, outputName };
        } catch {
          return { id: it.id, status: "error" as const };
        }
      })
    );

    setItems(prev => prev.map(it => {
      const r = results.find(r => r.id === it.id);
      return r && r.status ? { ...it, ...r } : it;
    }));
    setConverting(false);
  };

  const download = (item: ConvertItem) => {
    if (!item.outputUrl || !item.outputName) return;
    const a = document.createElement("a");
    a.href = item.outputUrl;
    a.download = item.outputName;
    a.click();
  };

  const downloadAll = () => {
    items.filter(it => it.status === "done").forEach(it => download(it));
  };

  const fmtSize = (b: number) =>
    b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)}MB` : `${Math.round(b / 1024)}KB`;

  const doneCount = items.filter(it => it.status === "done").length;

  return (
    <div className="space-y-3">
      {/* 拖拽上传区 */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all select-none
          ${dragging ? "border-indigo-400 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"}`}
      >
        <div className="text-2xl mb-1">🖼️</div>
        <p className="text-sm font-semibold text-gray-700">点击或拖拽上传图片</p>
        <p className="text-xs text-gray-400 mt-0.5">支持 JPG / PNG / WebP / GIF · 可批量选择</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {/* 转换设置 */}
      <div className="space-y-2">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">输出格式</label>
          <div className="flex gap-1 flex-wrap">
            {(["jpeg","png","webp","avif","tiff"] as const).map(f => (
              <button key={f} onClick={() => setFormat(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all
                  ${format === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {f === "jpeg" ? "JPG" : f.toUpperCase()}
                {SERVER_FORMATS.includes(f) && <span className="ml-1 text-[9px] opacity-70">服务端</span>}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            质量 {format === "png" ? "（PNG 无损）" : `${quality}%`}
          </label>
          <input type="range" min={10} max={100} step={5} value={quality}
            onChange={e => setQuality(parseInt(e.target.value))}
            disabled={format === "png"}
            className="w-full disabled:opacity-40" />
        </div>
      </div>

      {/* 文件列表 */}
      {items.length > 0 && (
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {items.map((it, i) => (
            <div key={it.id}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs border transition-all
                ${it.status === "done" ? "bg-green-50 border-green-100"
                : it.status === "error" ? "bg-red-50 border-red-100"
                : it.status === "converting" ? "bg-indigo-50 border-indigo-100"
                : "bg-gray-50 border-gray-100"}`}>
              <span className="flex-shrink-0 text-base">
                {it.status === "done" ? "✅" : it.status === "error" ? "❌" : it.status === "converting" ? "⏳" : "📄"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-gray-800">{it.name}</p>
                <p className="text-gray-400">
                  {fmtSize(it.originalSize)}
                  {it.outputSize && (
                    <span className="ml-1 text-green-600">→ {fmtSize(it.outputSize)}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {it.status === "done" && (
                  <button onClick={() => download(it)}
                    className="px-2.5 py-1 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all">
                    下载
                  </button>
                )}
                <button onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))}
                  className="px-2 py-1 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 transition-all">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 操作按钮 */}
      {items.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={convertAll}
            disabled={converting || items.every(it => it.status === "done")}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            {converting
              ? `⏳ 转换中...`
              : items.every(it => it.status === "done")
              ? "✅ 全部转换完成"
              : `🔄 开始转换 (${items.filter(it => it.status !== "done").length}张)`}
          </button>
          {doneCount > 1 && (
            <button onClick={downloadAll}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-indigo-400 text-indigo-600 hover:bg-indigo-50 transition-all">
              ⬇️ 全部下载
            </button>
          )}
          <button onClick={() => setItems([])}
            className="px-3 py-2.5 rounded-xl text-xs border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
            清空
          </button>
        </div>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        JPG/PNG/WebP 本地转换不上传 · AVIF/TIFF 经服务端处理后立即删除
      </p>
    </div>
  );
}

// ─── 图片俄化工具 ─────────────────────────────────────
function ImageRussify() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [ruText, setRuText] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [position, setPosition] = useState<"top"|"bottom"|"center">("bottom");
  const [bgOpacity, setBgOpacity] = useState(0.6);
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");
  const [size, setSize] = useState<"1000"|"900"|"800">("1000");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setUploadedFile(f);
    setPreview("");
  };

  const generate = async () => {
    if (!uploadedFile && !preview) return;
    setLoading(true);

    const canvas = canvasRef.current!;
    const sz = parseInt(size);
    canvas.width = sz;
    canvas.height = sz;
    const ctx = canvas.getContext("2d")!;

    const img = new Image();
    img.onload = () => {
      // 居中裁切填满画布
      const scale = Math.max(sz / img.width, sz / img.height);
      const sw = img.width * scale, sh = img.height * scale;
      ctx.drawImage(img, (sz-sw)/2, (sz-sh)/2, sw, sh);

      if (ruText.trim()) {
        const fs = fontSize;
        ctx.font = `bold ${fs}px Arial, sans-serif`;

        // 计算文字换行
        const maxW = sz - 40;
        const words = ruText.split(" ");
        const lines: string[] = [];
        let line = "";
        for (const word of words) {
          const test = line ? line + " " + word : word;
          if (ctx.measureText(test).width > maxW && line) {
            lines.push(line); line = word;
          } else { line = test; }
        }
        if (line) lines.push(line);

        const lineH = fs * 1.3;
        const totalH = lines.length * lineH + 24;

        let yStart = 0;
        if (position === "bottom") yStart = sz - totalH - 10;
        else if (position === "top") yStart = 10;
        else yStart = (sz - totalH) / 2;

        // 半透明背景条
        const hex2rgb = (h: string) => {
          const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16);
          return `${r},${g},${b}`;
        };
        ctx.fillStyle = `rgba(${hex2rgb(bgColor)},${bgOpacity})`;
        ctx.fillRect(0, yStart, sz, totalH);

        // 文字
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        lines.forEach((l, i) => {
          ctx.fillText(l, sz/2, yStart + 18 + (i+0.8) * lineH);
        });
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setPreview(dataUrl);
      setLoading(false);
    };
    img.onerror = () => {
      setLoading(false);
      alert("图片加载失败");
    };
    if (uploadedFile) {
      img.src = URL.createObjectURL(uploadedFile);
    } else {
      img.src = preview;
    }
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = preview;
    a.download = `ozon_${size}x${size}_ru.jpg`;
    a.click();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">上传图片</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-purple-400 transition-colors"
        >
          {uploadedFile ? (
            <p className="text-xs text-gray-700 font-medium">📷 {uploadedFile.name}</p>
          ) : (
            <>
              <p className="text-2xl mb-1">🖼️</p>
              <p className="text-xs text-gray-500">点击或拖拽上传图片</p>
              <p className="text-xs text-gray-400">支持 JPG / PNG / WebP</p>
            </>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">俄文文字（留空则只调整尺寸）</label>
        <textarea value={ruText} onChange={e=>setRuText(e.target.value)} rows={2}
          placeholder="例：Мягкая игрушка Панда 30см"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <label className="text-gray-500 mb-1 block">输出尺寸</label>
          <select value={size} onChange={e=>setSize(e.target.value as "1000"|"900"|"800")}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-xs">
            <option value="1000">1000×1000（主图）</option>
            <option value="900">900×900（详情图）</option>
            <option value="800">800×800</option>
          </select>
        </div>
        <div>
          <label className="text-gray-500 mb-1 block">文字位置</label>
          <select value={position} onChange={e=>setPosition(e.target.value as "top"|"bottom"|"center")}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-xs">
            <option value="bottom">底部</option>
            <option value="top">顶部</option>
            <option value="center">居中</option>
          </select>
        </div>
        <div>
          <label className="text-gray-500 mb-1 block">字体大小</label>
          <input type="number" value={fontSize} onChange={e=>setFontSize(parseInt(e.target.value)||48)} min={20} max={120}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs" />
        </div>
        <div>
          <label className="text-gray-500 mb-1 block">文字颜色</label>
          <input type="color" value={textColor} onChange={e=>setTextColor(e.target.value)}
            className="w-full h-8 border border-gray-200 rounded-lg cursor-pointer" />
        </div>
        <div>
          <label className="text-gray-500 mb-1 block">背景色</label>
          <input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)}
            className="w-full h-8 border border-gray-200 rounded-lg cursor-pointer" />
        </div>
        <div>
          <label className="text-gray-500 mb-1 block">背景透明度</label>
          <input type="range" value={bgOpacity} onChange={e=>setBgOpacity(parseFloat(e.target.value))} min={0} max={1} step={0.1}
            className="w-full mt-2" />
        </div>
      </div>

      <button onClick={generate} disabled={loading || (!uploadedFile && !preview)}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
        style={{background:"linear-gradient(135deg,#8b5cf6,#6366f1)"}}>
        {loading ? "生成中..." : "🎨 生成预览"}
      </button>

      {preview && (
        <div className="space-y-2">
          <img src={preview} alt="预览" className="w-full rounded-xl border border-gray-200 object-cover" style={{maxHeight:300}} />
          <button onClick={download}
            className="w-full py-2 rounded-xl text-sm font-semibold border-2 border-purple-500 text-purple-600 hover:bg-purple-50 transition-all">
            ⬇️ 下载图片（{size}×{size} JPG）
          </button>
        </div>
      )}

      <canvas ref={canvasRef} style={{display:"none"}} />
    </div>
  );
}

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
