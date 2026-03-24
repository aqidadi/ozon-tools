"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { X, Mail, Lock, User, Loader2, ShoppingBag } from "lucide-react";

interface Props {
  onClose?: () => void;
  defaultTab?: "login" | "register";
}

export function AuthModal({ onClose, defaultTab = "login" }: Props) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);

    if (tab === "login") {
      const result = await login(email, password);
      if (result.ok) {
        onClose?.();
      } else {
        setError(result.error || "登录失败");
      }
    } else {
      const result = await register(email, password, name);
      if (result.ok) {
        setSuccess("注册成功！请用邮箱密码登录");
        setTab("login");
      } else {
        setError(result.error || "注册失败");
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Crossly</p>
              <p className="text-xs text-gray-400">跨境卖家工具箱</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex mx-6 bg-gray-100 rounded-xl p-1 mb-5">
          {(["login", "register"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(""); setSuccess(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              {t === "login" ? "登录" : "注册"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
          {tab === "register" && (
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="昵称（选填）"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          )}
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="邮箱地址"
              required
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={tab === "register" ? "密码（至少6位）" : "密码"}
              required
              minLength={tab === "register" ? 6 : 1}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-100 text-green-600 text-xs px-3 py-2 rounded-lg">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            {loading ? "处理中..." : tab === "login" ? "登录" : "注册"}
          </button>

          {/* 免费提示 */}
          {tab === "register" && (
            <p className="text-xs text-center text-gray-400 pt-1">
              免费注册，可导入最多50个商品 · 升级 Pro 无限导入
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
