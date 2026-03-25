"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/AuthModal";
import { LogOut, Crown, Copy, Check, ExternalLink, User, Camera, Pencil, X, Loader2 } from "lucide-react";

function formatExpiry(expiresAt?: string): string {
  if (!expiresAt) return "永久有效";
  const exp = new Date(expiresAt);
  const now = new Date();
  const diffMs = exp.getTime() - now.getTime();
  if (diffMs <= 0) return "已过期";
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `剩余 ${diffMin} 分钟`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `剩余 ${diffHour} 小时 ${diffMin % 60} 分`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 365) return `剩余 ${diffDay} 天 ${diffHour % 24} 小时`;
  const diffYear = Math.floor(diffDay / 365);
  return `剩余 ${diffYear} 年`;
}

// ── 个人中心弹窗 ──────────────────────────────────────────
function ProfileModal({ onClose }: { onClose: () => void }) {
  const { user, accessToken, refreshUser } = useAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [avatar, setAvatar] = useState(user?.avatarUrl || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ displayName: name, avatarUrl: avatar }),
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1200);
    } catch {}
    setSaving(false);
  };

  const initials = (user?.displayName || user?.email || "U")[0].toUpperCase();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">个人中心</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* 头像 */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
                {avatar
                  ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-white text-2xl font-bold">{initials}</span>
                }
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
              >
                <Camera size={12} />
              </button>
            </div>
            <p className="text-xs text-gray-400">点击相机图标上传头像</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* 昵称 */}
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1.5">昵称</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="设置你的昵称"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8"
              />
              <Pencil size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
            </div>
          </div>

          {/* 邮箱（只读） */}
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1.5">邮箱</label>
            <div className="border border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-400">
              {user?.email}
            </div>
          </div>

          {/* 会员状态 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-3 py-2.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-700">会员状态</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {user?.plan === "pro" ? "✨ Pro 会员" : `免费版 · ${user?.productCount}/${user?.quota} 个商品`}
              </p>
            </div>
            {user?.plan !== "pro" && (
              <span className="text-[10px] bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full font-medium">
                升级 Pro
              </span>
            )}
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              saved ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {saved ? "✓ 已保存！" : saving ? "保存中..." : "保存修改"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 升级弹窗 ──────────────────────────────────────────────
function UpgradeModal({ onClose, user }: { onClose: () => void; user: { email: string } }) {
  const plans = [
    { name: "月度 Pro", price: "¥9.9", period: "/月", tag: "推广价", months: 1 },
    { name: "季度 Pro", price: "¥19.9", period: "/3月", tag: "省¥9.8", months: 3 },
    { name: "年度 Pro", price: "¥69", period: "/年", tag: "最划算", months: 12 },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Crown size={14} className="text-yellow-500" />升级 Pro
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        {/* 特权一行 */}
        <div className="mx-4 bg-blue-50 rounded-lg px-3 py-2 mb-2 flex flex-wrap gap-x-3 gap-y-0.5">
          {["✅ 无限导入", "✅ 批量搬运", "✅ 多平台货币", "✅ Excel导出"].map(f => (
            <span key={f} className="text-[11px] text-blue-600">{f}</span>
          ))}
        </div>

        {/* 套餐列表 */}
        <div className="px-4 pb-2 space-y-1.5">
          {plans.map(plan => (
            <div key={plan.name} className={`border rounded-lg px-3 py-2 flex items-center justify-between ${plan.tag === "最划算" ? "border-blue-300 bg-blue-50" : "border-gray-200"}`}>
              <div>
                <span className="text-sm font-semibold text-gray-800">{plan.name}</span>
                {plan.tag && <span className="ml-1.5 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">{plan.tag}</span>}
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-gray-900">{plan.price}</span>
                <span className="text-[10px] text-gray-400 ml-1">{plan.period}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 支付宝收款码 */}
        <div className="mx-4 mb-3">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-blue-700 mb-2 text-center">扫码付款 · 支付宝</p>
            <div className="flex justify-center mb-2">
              <img src="/alipay-qr.jpg" alt="支付宝收款码"
                className="w-36 h-36 object-contain rounded-lg border border-blue-200" />
            </div>
            <div className="bg-white rounded-lg px-3 py-2 space-y-1">
              <p className="text-[11px] text-gray-600 flex items-center gap-1">
                <span className="text-blue-500 font-bold">1.</span> 扫码付款，备注填写你的邮箱
              </p>
              <p className="text-[11px] text-gray-600 flex items-center gap-1">
                <span className="text-blue-500 font-bold">2.</span> 邮箱：<strong className="text-gray-800 break-all">{user.email}</strong>
              </p>
              <p className="text-[11px] text-gray-600 flex items-center gap-1">
                <span className="text-blue-500 font-bold">3.</span> 付款截图发至 <strong className="text-blue-600">aqiliaobi@163.com</strong>
              </p>
              <p className="text-[11px] text-gray-600 flex items-center gap-1">
                <span className="text-blue-500 font-bold">4.</span> 24小时内手动激活会员
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <button onClick={onClose} className="w-full py-2 border border-gray-200 text-gray-500 rounded-xl text-xs hover:bg-gray-50">
            以后再说
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 主 UserBar ──────────────────────────────────────────────
export function UserBar() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const copyToken = () => {
    if (user?.apiToken) {
      navigator.clipboard.writeText(user.apiToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isPro = user?.plan === "pro";
  const usagePercent = user && user.quota > 0
    ? Math.min(100, (user.productCount / user.quota) * 100)
    : 0;

  const avatarUrl = (user as { avatarUrl?: string } & typeof user)?.avatarUrl;
  const displayName = user?.displayName || user?.email?.split("@")[0] || "";
  const initials = displayName[0]?.toUpperCase() || "U";

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuth(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white rounded-xl text-xs font-medium hover:bg-white/30 transition-colors w-full justify-center border border-white/20"
        >
          <User size={12} />
          登录 / 注册
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </>
    );
  }

  return (
    <div className="space-y-2">
      {/* 用户头像 + 昵称行（点击进个人中心） */}
      <button
        onClick={() => setShowProfile(true)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/10 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center flex-shrink-0">
          {avatarUrl
            ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            : <span className="text-white text-xs font-bold">{initials}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white truncate">{displayName}</p>
          <p className="text-[10px] text-white/50 truncate">{isPro ? `✨ Pro · ${formatExpiry(user.planExpiresAt)}` : `免费版 ${user.productCount}/${user.quota}`}</p>
        </div>
        <Pencil size={11} className="text-white/30 flex-shrink-0" />
      </button>

      {/* 操作行 */}
      <div className="flex items-center gap-1.5">
        {/* 配额进度 */}
        {!isPro && (
          <div className="flex-1 flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${usagePercent > 80 ? "bg-red-400" : "bg-indigo-300"}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        )}
        {isPro && <div className="flex-1" />}

        {/* 升级按钮 */}
        {!isPro && (
          <button
            onClick={() => setShowUpgrade(true)}
            className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-md text-[10px] font-medium hover:opacity-90"
          >
            <Crown size={9} />升级
          </button>
        )}

        {/* Token 复制 */}
        <button
          onClick={() => setShowToken(!showToken)}
          className="px-2 py-1 text-[10px] text-gray-400 hover:text-blue-600 border border-gray-200 rounded-md hover:border-blue-300 transition-colors"
          title="插件 Token"
        >
          🔑
        </button>

        {/* 退出 */}
        <button onClick={logout} className="px-2 py-1 text-[10px] text-gray-400 hover:text-red-500 border border-gray-200 rounded-md hover:border-red-200 transition-colors" title="退出">
          <LogOut size={10} />
        </button>
      </div>

      {/* Token 展开 */}
      {showToken && (
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-100">
          <code className="flex-1 text-[9px] text-gray-400 truncate font-mono">{user.apiToken}</code>
          <button onClick={copyToken} className="flex-shrink-0 text-gray-400 hover:text-blue-600">
            {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
          </button>
        </div>
      )}

      {/* 弹窗 */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} user={user} />}
    </div>
  );
}
