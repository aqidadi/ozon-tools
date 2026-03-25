"use client";
import { useState, useEffect } from "react";

const PLANS = [
  { label: "24小时体验", months: -1 },
  { label: "周卡 7天", months: -7 },
  { label: "月度 Pro", months: 1 },
  { label: "年度 Pro", months: 12 },
];

interface Member {
  id: string;
  email: string;
  display_name: string;
  plan: string;
  quota: number;
  subscription_expires_at: string | null;
  created_at: string;
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"activate" | "members">("activate");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const fetchMembers = async (adminKey: string) => {
    setMembersLoading(true);
    const res = await fetch("/api/admin/members", { headers: { "x-admin-key": adminKey } });
    if (res.ok) setMembers(await res.json());
    setMembersLoading(false);
  };

  const handleLogin = () => {
    if (key === "crossly_admin_2025") { setAuthed(true); fetchMembers(key); }
    else alert("密码错误");
  };

  const activate = async () => {
    if (!email || plan === null) return setMsg("请填写邮箱并选择套餐");
    setLoading(true); setMsg("");
    const res = await fetch("/api/payment", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-key": "crossly_admin_2025" },
      body: JSON.stringify({ email, months: plan }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(`✅ 激活成功！${email} 已升级`);
      setEmail(""); setPlan(null);
      fetchMembers("crossly_admin_2025");
    } else {
      setMsg(`❌ 失败：${data.error}`);
    }
    setLoading(false);
  };

  const formatExpiry = (s: string | null) => {
    if (!s) return "—";
    const d = new Date(s);
    if (d.getFullYear() > 2100) return "永久";
    const diff = d.getTime() - Date.now();
    if (diff < 0) return "已过期";
    const days = Math.floor(diff / 86400000);
    if (days === 0) return `${Math.floor(diff / 3600000)}小时后`;
    return `${days}天后 (${d.toLocaleDateString("zh-CN")})`;
  };

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow p-8 w-80">
        <h1 className="text-lg font-bold mb-4">🔐 管理员登录</h1>
        <input className="w-full border rounded-lg px-3 py-2 mb-3 text-sm" type="password"
          placeholder="Admin Key" value={key} onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()} />
        <button className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold" onClick={handleLogin}>登录</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-4">🔧 Crossly 管理后台</h1>

        {/* Tab */}
        <div className="flex gap-2 mb-6">
          {[{id:"activate",label:"激活会员"},{id:"members",label:`会员列表 (${members.length})`}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as "activate"|"members")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === t.id ? "bg-blue-600 text-white" : "bg-white text-gray-600 border"}`}>
              {t.label}
            </button>
          ))}
          <button onClick={() => fetchMembers("crossly_admin_2025")} className="ml-auto px-3 py-2 text-xs text-gray-500 border rounded-lg bg-white">🔄 刷新</button>
        </div>

        {/* 激活 */}
        {tab === "activate" && (
          <div className="bg-white rounded-2xl shadow p-6 max-w-sm">
            <label className="text-sm text-gray-600 mb-1 block">用户邮箱</label>
            <input className="w-full border rounded-lg px-3 py-2 mb-4 text-sm" placeholder="user@example.com"
              value={email} onChange={e => setEmail(e.target.value)} />
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
        )}

        {/* 会员列表 */}
        {tab === "members" && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            {membersLoading ? (
              <div className="p-8 text-center text-gray-400 text-sm">加载中...</div>
            ) : members.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">暂无会员</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="text-left px-4 py-3">邮箱</th>
                    <th className="text-left px-4 py-3">昵称</th>
                    <th className="text-left px-4 py-3">套餐</th>
                    <th className="text-left px-4 py-3">到期</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">{m.email}</td>
                      <td className="px-4 py-3 text-gray-500">{m.display_name || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.plan === "pro" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                          {m.plan === "pro" ? "Pro" : "免费"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatExpiry(m.subscription_expires_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
