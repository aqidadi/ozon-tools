"use client";
import { useState } from "react";

const PLANS = [
  { label: "24小时体验", months: -1 },
  { label: "周卡 7天", months: -7 },
  { label: "月度 Pro", months: 1 },
  { label: "年度 Pro", months: 12 },
];

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState(-1);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow p-8 w-80">
        <h1 className="text-lg font-bold mb-4">管理员登录</h1>
        <input className="w-full border rounded-lg px-3 py-2 mb-3 text-sm" type="password" placeholder="Admin Key" value={key} onChange={e => setKey(e.target.value)} />
        <button className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold" onClick={() => { if (key === "crossly_admin_2025") setAuthed(true); else alert("密码错误"); }}>登录</button>
      </div>
    </div>
  );

  const activate = async () => {
    if (!email || plan === -1) return setMsg("请填写邮箱并选择套餐");
    setLoading(true); setMsg("");
    const res = await fetch("/api/payment", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-key": "crossly_admin_2025" },
      body: JSON.stringify({ email, months: plan }),
    });
    const data = await res.json();
    setMsg(res.ok ? `✅ 激活成功！${email} 已升级为 Pro` : `❌ 失败：${data.error}`);
    setLoading(false);
    if (res.ok) { setEmail(""); setPlan(-1); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow p-8 w-96">
        <h1 className="text-lg font-bold mb-6">🔧 会员激活</h1>
        <label className="text-sm text-gray-600 mb-1 block">用户邮箱</label>
        <input className="w-full border rounded-lg px-3 py-2 mb-4 text-sm" placeholder="user@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        <label className="text-sm text-gray-600 mb-1 block">选择套餐</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {PLANS.map(p => (
            <button key={p.months} onClick={() => setPlan(p.months)}
              className={`py-2 rounded-lg text-sm border ${plan === p.months ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-700"}`}>
              {p.label}
            </button>
          ))}
        </div>
        <button onClick={activate} disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50">
          {loading ? "激活中..." : "一键激活"}
        </button>
        {msg && <p className={`mt-3 text-sm text-center ${msg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>{msg}</p>}
      </div>
    </div>
  );
}
