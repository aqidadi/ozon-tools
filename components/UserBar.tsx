"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/AuthModal";
import { LogOut, Crown, Copy, Check, ExternalLink, User, Camera, Pencil, X, Loader2 } from "lucide-react";

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
  const AFDIAN_URL = process.env.NEXT_PUBLIC_AFDIAN_URL || "https://afdian.com/a/your-account";

  const plans = [
    { name: "24小时体验", price: "¥5.99", period: "24h", tag: "试用" },
    { name: "周卡", price: "¥19.9", period: "7天", tag: "" },
    { name: "月度 Pro", price: "¥39", period: "/月", tag: "" },
    { name: "年度 Pro", price: "¥299.99", period: "/年", tag: "省¥168" },
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
            <div key={plan.name} className={`border rounded-lg px-3 py-2 flex items-center justify-between ${plan.tag === "省¥168" ? "border-blue-300 bg-blue-50" : "border-gray-200"}`}>
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

        {/* 购买提示 */}
        <div className="mx-4 mb-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <p className="text-[11px] text-amber-700 font-semibold mb-0.5">购买步骤</p>
          <p className="text-[11px] text-amber-600">1. 点击下方前往爱发电选套餐</p>
          <p className="text-[11px] text-amber-600">2. 备注填写邮箱：<strong>{user.email}</strong></p>
          <p className="text-[11px] text-amber-600">3. 支付后5分钟内自动激活</p>
        </div>

        <div className="px-4 pb-4 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 text-gray-500 rounded-xl text-xs hover:bg-gray-50">
            以后再说
          </button>
          <a href={AFDIAN_URL} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl text-xs font-semibold hover:opacity-90"
          >
            <ExternalLink size={12} />去爱发电购买
          </a>
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
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors w-full justify-center"
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
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center flex-shrink-0">
          {avatarUrl
            ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            : <span className="text-white text-xs font-bold">{initials}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-800 truncate">{displayName}</p>
          <p className="text-[10px] text-gray-400 truncate">{isPro ? "✨ Pro 会员" : `免费版 ${user.productCount}/${user.quota}`}</p>
        </div>
        <Pencil size={11} className="text-gray-300 flex-shrink-0" />
      </button>

      {/* 操作行 */}
      <div className="flex items-center gap-1.5">
        {/* 配额进度 */}
        {!isPro && (
          <div className="flex-1 flex items-center gap-1.5">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${usagePercent > 80 ? "bg-red-400" : "bg-blue-400"}`}
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
