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

const TOOLS = [
  { id: "currency", emoji: "💱", title: "汇率换算", desc: "13种货币实时换算", tag: "实时", component: <CurrencyConverter /> },
  { id: "translate", emoji: "🌐", title: "文字翻译", desc: "中文→俄/英/泰等8种语言", tag: "实时", component: <Translator /> },
  { id: "profit", emoji: "💰", title: "利润计算器", desc: "含运费佣金汇率", tag: "内置", component: <ProfitCalc /> },
  { id: "holiday", emoji: "📅", title: "节日日历", desc: "欧美/俄罗斯重要节日", tag: "内置", component: <HolidayCalendar /> },
  { id: "ai", emoji: "🤖", title: "AI文案生成", desc: "DeepSeek驱动，真实生成", tag: "独家", component: <AIPrompts /> },
  { id: "fba", emoji: "📦", title: "FBA费用估算", desc: "亚马逊美国站快速测算", tag: "内置", component: <FBACalc /> },
  { id: "bulk", emoji: "🔗", title: "批量链接采集", desc: "粘贴1688链接批量导入", tag: "新功能", component: <BulkImport /> },
  { id: "imgru", emoji: "🖼️", title: "图片俄化", desc: "一键加俄文+适配Ozon尺寸", tag: "新功能", component: <ImageRussify /> },
  { id: "imgconv", emoji: "🔄", title: "图片格式转换", desc: "批量转JPG/PNG/WebP/AVIF", tag: "新功能", component: <ImageConverter /> },
];

const TAG_COLORS: Record<string,string> = {
  "实时": "bg-green-100 text-green-700",
  "内置": "bg-indigo-100 text-indigo-700",
  "免费": "bg-gray-100 text-gray-600",
  "独家": "bg-purple-100 text-purple-700",
  "新功能": "bg-orange-100 text-orange-700",
};

// ─── 批量链接采集器 ─────────────────────────────────────
function BulkImport() {
  const [urls, setUrls] = useState("");
  const [status, setStatus] = useState<{url:string, state:"waiting"|"ok"|"fail", msg?:string}[]>([]);
  const [running, setRunning] = useState(false);

  const parseUrls = (text: string) => {
    return text.split(/[\n,，\s]+/)
      .map(s => s.trim())
      .filter(s => s.includes("1688.com") || s.includes("yiwugo.com"));
  };

  const handleImport = async () => {
    const list = parseUrls(urls);
    if (!list.length) return;
    setStatus(list.map(url => ({ url, state: "waiting" })));
    setRunning(true);

    for (let i = 0; i < list.length; i++) {
      const url = list[i];
      setStatus(prev => prev.map((s,j) => j===i ? {...s, state:"waiting", msg:"解析中..."} : s));
      try {
        // 从1688链接提取offer_id
        const offerMatch = url.match(/offer\/(\d+)/) || url.match(/offerId=(\d+)/) || url.match(/offer_id=(\d+)/);
        if (!offerMatch) {
          setStatus(prev => prev.map((s,j) => j===i ? {...s, state:"fail", msg:"链接格式不对"} : s));
          continue;
        }
        const offerId = offerMatch[1];
        // 调用后端解析（会失败，但这里做降级提示）
        const res = await fetch(`/api/scrape1688?offerId=${offerId}`);
        const data = await res.json();
        if (data.title) {
          setStatus(prev => prev.map((s,j) => j===i ? {...s, state:"ok", msg:`✅ ${data.title.slice(0,20)}...`} : s));
        } else {
          setStatus(prev => prev.map((s,j) => j===i ? {...s, state:"fail", msg:"⚠️ 需通过插件抓取（服务器IP被1688限制）"} : s));
        }
      } catch {
        setStatus(prev => prev.map((s,j) => j===i ? {...s, state:"fail", msg:"网络错误"} : s));
      }
      await new Promise(r => setTimeout(r, 500));
    }
    setRunning(false);
  };

  const urlList = parseUrls(urls);

  return (
    <div className="space-y-3">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
        💡 <strong>使用说明：</strong>粘贴1688/义乌购商品链接（每行一个），点击采集。由于1688限制，建议配合Chrome插件使用效果更好。
      </div>
      <textarea
        value={urls}
        onChange={e => setUrls(e.target.value)}
        rows={5}
        placeholder={"粘贴1688商品链接，每行一个：\nhttps://detail.1688.com/offer/123456.html\nhttps://detail.1688.com/offer/789012.html"}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleImport}
          disabled={running || !urlList.length}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
          style={{background:"linear-gradient(135deg,#f97316,#ea580c)"}}
        >
          {running ? "采集中..." : `🔗 开始采集 ${urlList.length > 0 ? `(${urlList.length}条)` : ""}`}
        </button>
        {status.length > 0 && (
          <button onClick={() => {setStatus([]); setUrls("");}} className="px-3 py-2.5 rounded-xl text-xs border border-gray-200 text-gray-500 hover:bg-gray-50">清空</button>
        )}
      </div>
      {status.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {status.map((s, i) => (
            <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-xs ${s.state==="ok"?"bg-green-50":s.state==="fail"?"bg-red-50":"bg-gray-50"}`}>
              <span className="flex-shrink-0">{s.state==="ok"?"✅":s.state==="fail"?"❌":"⏳"}</span>
              <div className="min-w-0">
                <div className="truncate text-gray-500 font-mono">{s.url.slice(0,40)}...</div>
                {s.msg && <div className={s.state==="ok"?"text-green-700":"text-red-500"}>{s.msg}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-600">
        🔌 <strong>更高效的方式：</strong>安装Crossly插件后，在1688商品页直接点"发送到选品工具"，无需复制链接。
      </div>
    </div>
  );
}

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
