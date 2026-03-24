"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/AuthModal";
import { LogOut, Crown, Copy, Check, ExternalLink, User } from "lucide-react";

export function UserBar() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

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

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuth(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
        >
          <User size={12} />
          登录 / 注册
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* 配额显示 */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
        {isPro ? (
          <span className="flex items-center gap-1 text-xs font-medium text-yellow-600">
            <Crown size={11} />Pro
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {user.productCount}<span className="text-gray-300">/</span>{user.quota}
            </span>
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usagePercent > 80 ? "bg-red-400" : "bg-blue-400"}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 升级按钮（免费用户） */}
      {!isPro && (
        <button
          onClick={() => setShowUpgrade(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
        >
          <Crown size={11} />
          升级 Pro
        </button>
      )}

      {/* 用户菜单 */}
      <div className="relative group">
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-600 hover:bg-gray-200 transition-colors">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            {(user.displayName || user.email)[0].toUpperCase()}
          </div>
          <span className="max-w-20 truncate">{user.displayName || user.email.split("@")[0]}</span>
        </button>

        {/* Dropdown */}
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-800 truncate">{user.email}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isPro ? "✨ Pro 会员" : `免费版 · 已用 ${user.productCount}/${user.quota}`}
            </p>
          </div>

          {/* API Token（插件用） */}
          <button
            onClick={() => setShowToken(!showToken)}
            className="w-full px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          >
            🔑 插件 API Token
          </button>
          {showToken && (
            <div className="px-3 pb-2">
              <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1.5">
                <code className="flex-1 text-[10px] text-gray-500 truncate font-mono">{user.apiToken}</code>
                <button onClick={copyToken} className="flex-shrink-0 text-gray-400 hover:text-blue-600">
                  {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={12} />退出登录
          </button>
        </div>
      </div>

      {/* 升级弹窗 */}
      {showUpgrade && (
        <UpgradeModal onClose={() => setShowUpgrade(false)} user={user} />
      )}
    </div>
  );
}

function UpgradeModal({ onClose, user }: { onClose: () => void; user: { email: string } }) {
  const AFDIAN_URL = process.env.NEXT_PUBLIC_AFDIAN_URL || "https://afdian.com/a/your-account";

  const plans = [
    { name: "月度 Pro", price: "¥99", period: "/月", tag: "", months: 1 },
    { name: "年度 Pro", price: "¥699", period: "/年", tag: "省¥489", months: 12 },
    { name: "终身 Pro", price: "¥1999", period: "一次性", tag: "推荐", months: 0 },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Crown size={18} className="text-yellow-500" />升级 Pro
            </h2>
            <p className="text-sm text-gray-500 mt-1">解锁无限商品导入 + 批量功能</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <span className="text-lg">×</span>
          </button>
        </div>

        {/* Pro 特性 */}
        <div className="mx-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-blue-700 mb-2">Pro 会员特权</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              "✅ 无限商品导入",
              "✅ 批量导入（最多50个）",
              "✅ 完整详情图搬运",
              "✅ 导出 Excel 无限制",
              "✅ 全平台多货币",
              "✅ 优先客服支持",
            ].map(f => (
              <p key={f} className="text-xs text-blue-600">{f}</p>
            ))}
          </div>
        </div>

        {/* 套餐 */}
        <div className="px-6 pb-4 space-y-2">
          {plans.map(plan => (
            <div key={plan.name} className={`border rounded-xl p-3 flex items-center justify-between ${plan.tag === "推荐" ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}>
              <div>
                <p className="text-sm font-semibold text-gray-800">{plan.name}
                  {plan.tag && <span className="ml-2 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">{plan.tag}</span>}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">到期后自动降为免费版</p>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-gray-900">{plan.price}</p>
                <p className="text-[10px] text-gray-400">{plan.period}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 购买步骤 */}
        <div className="mx-6 mb-4 bg-amber-50 border border-amber-100 rounded-xl p-3">
          <p className="text-xs font-semibold text-amber-700 mb-1.5">购买步骤：</p>
          <p className="text-xs text-amber-600">1. 点击下方按钮前往爱发电选择套餐</p>
          <p className="text-xs text-amber-600">2. <strong>在备注里填写你的邮箱：{user.email}</strong></p>
          <p className="text-xs text-amber-600">3. 支付后系统自动激活（5分钟内）</p>
        </div>

        <div className="px-6 pb-6 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">
            以后再说
          </button>
          <a href={AFDIAN_URL} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl text-sm font-semibold hover:opacity-90"
          >
            <ExternalLink size={14} />去爱发电购买
          </a>
        </div>
      </div>
    </div>
  );
}
