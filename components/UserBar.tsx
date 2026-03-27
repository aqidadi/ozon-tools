"use client";

import { useState, useRef, useEffect } from "react";
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

// ── 邀请好友弹窗 ──────────────────────────────────────────
function InviteModal({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<{inviteCode:string;inviteCount:number;inviteLink:string;invitees:any[]} | null>(null);
  const [copied, setCopied] = useState(false);
  const { accessToken } = useAuth();

  useEffect(() => {
    fetch("/api/invite", {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }).then(r => r.json()).then(d => setData(d)).catch(() => {});
  }, [accessToken]);

  const copy = () => {
    if (!data?.inviteLink) return;
    navigator.clipboard.writeText(data.inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-5 pt-5 pb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            🎁 邀请好友，双方得 Pro
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        <div className="px-5 pb-2">
          {/* 规则说明 */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 mb-3 text-xs">
            <div className="flex gap-4 text-center">
              <div className="flex-1">
                <div className="text-2xl font-bold text-indigo-600">30</div>
                <div className="text-gray-500">邀请人获得<br/>天数 Pro</div>
              </div>
              <div className="text-gray-300 flex items-center">+</div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-purple-600">30</div>
                <div className="text-gray-500">被邀请人获得<br/>天数 Pro</div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">每成功邀请一人，双方各得30天Pro（可叠加）</p>
          </div>

          {/* 邀请码 */}
          {data ? (
            <>
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">你的邀请码</span>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded">已邀请 {data.inviteCount} 人</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-center text-lg font-bold tracking-[0.3em] text-indigo-600">
                    {data.inviteCode}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">邀请链接（分享给好友）</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 truncate">
                    {data.inviteLink}
                  </div>
                  <button onClick={copy}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${copied ? "bg-green-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
                    {copied ? "✓" : "复制"}
                  </button>
                </div>
              </div>

              {data.invitees.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">已邀请的好友</p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {data.invitees.map((u, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5">
                        <span className="text-xs text-gray-600">{u.display_name || u.email?.split("@")[0]}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.plan === "pro" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
                          {u.plan === "pro" ? "Pro" : "免费"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-xs text-gray-400">加载中...</div>
          )}
        </div>

        <div className="px-5 pb-5">
          <button onClick={onClose} className="w-full py-2 border border-gray-200 text-gray-500 rounded-xl text-xs hover:bg-gray-50">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 升级弹窗 ──────────────────────────────────────────────
function UpgradeModal({ onClose, user }: { onClose: () => void; user: { email: string } }) {
  const plans = [
    { emoji: "🧋", name: "喝杯奶茶", price: "¥9.9", period: "跑1天服务器", tag: "", highlight: false },
    { emoji: "🍱", name: "一顿午饭", price: "¥19.9", period: "感谢最多 🙏", tag: "感谢最多", highlight: true },
    { emoji: "💪", name: "一年支持", price: "¥69", period: "最强后盾", tag: "", highlight: false },
  ];
  const [selected, setSelected] = useState(1); // 默认选中「一顿午饭」

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* 关闭 */}
        <div className="flex justify-end px-4 pt-3">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        {/* 标题区 */}
        <div className="text-center px-6 pb-4">
          <div className="text-4xl mb-2">🔋</div>
          <h2 className="text-lg font-black text-gray-900 mb-1">给 Crossly 充个电？</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            所有功能永远免费开放。但服务器、AI翻译都需要成本。<br/>
            <span className="text-pink-500 font-semibold">如果帮到了你，请支持我们活下去 ❤️</span>
          </p>
        </div>

        {/* 三档套餐横排 — 可点击选中 */}
        <div className="grid grid-cols-3 gap-2 px-4 mb-4">
          {plans.map((plan, idx) => {
            const isSelected = selected === idx;
            return (
              <div key={plan.name} className="relative" onClick={() => setSelected(idx)}>
                {plan.highlight && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="text-[9px] font-bold text-white bg-pink-500 px-2 py-0.5 rounded-full whitespace-nowrap">感谢最多</span>
                  </div>
                )}
                <div className={`rounded-2xl border-2 px-2 py-3 text-center cursor-pointer transition-all active:scale-95 ${
                  isSelected
                    ? "border-pink-500 bg-pink-50 shadow-md shadow-pink-100 scale-105"
                    : "border-gray-100 bg-gray-50 hover:border-gray-300"
                }`}>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">✓</span>
                    </div>
                  )}
                  <div className="text-2xl mb-1">{plan.emoji}</div>
                  <p className="text-[11px] text-gray-600 mb-1">{plan.name}</p>
                  <p className={`text-lg font-black ${isSelected ? "text-pink-500" : "text-gray-800"}`}>{plan.price}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{plan.period}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 已选提示 */}
        <div className="mx-4 mb-2 text-center">
          <p className="text-xs text-gray-500">
            已选：<span className="font-bold text-pink-500">{plans[selected].name} {plans[selected].price}</span>
            <span className="text-gray-400 ml-1">— 按此金额付款</span>
          </p>
        </div>

        {/* 支付区 */}
        <div className="mx-4 mb-3">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-blue-700 mb-2 text-center">扫码付款 · 支付宝</p>

            {/* 电脑用户：扫二维码 */}
            <p className="text-[11px] text-center text-gray-500 font-medium mb-2">📱 手机用户：长按下方二维码图片 → 识别图中二维码</p>
            <div className="flex justify-center mb-2">
              <img src="/alipay-qr.jpg" alt="支付宝收款码"
                className="w-48 h-48 object-contain rounded-lg border border-blue-200" />
            </div>
            <div className="bg-white rounded-lg px-3 py-2 space-y-1">
              <p className="text-[11px] text-gray-600 flex items-center gap-1">
                <span className="text-blue-500 font-bold">1.</span> 付款后，备注填写你的邮箱
              </p>
              <p className="text-[11px] text-gray-600 flex items-center gap-1">
                <span className="text-blue-500 font-bold">2.</span> 邮箱：<strong className="text-gray-800 break-all">{user.email}</strong>
              </p>
              <p className="text-[11px] text-gray-600 flex items-center gap-1">
                <span className="text-blue-500 font-bold">3.</span> 付款截图发至 <strong className="text-blue-600">aqiliaobi@163.com</strong>
              </p>
              <p className="text-[11px] text-gray-600 flex items-center gap-1">
                <span className="text-blue-500 font-bold">4.</span> 24小时内手动激活，感谢支持 ❤️
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
  const [showInvite, setShowInvite] = useState(false);

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

        {/* 邀请好友 */}
        <button onClick={() => setShowInvite(true)}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 text-xs transition-all">
          <span>🎁</span>
          <span>邀请好友得Pro</span>
        </button>

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
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}
