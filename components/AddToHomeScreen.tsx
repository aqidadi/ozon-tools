"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function AddToHomeScreen() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // 已经是 standalone 模式（已安装）就不显示
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }
    // 用户已手动关闭过
    if (localStorage.getItem("pwa-dismissed")) return;

    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    if (ios) {
      // iOS 没有 beforeinstallprompt，延迟3秒显示手动引导
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    // Android/Chrome: 监听安装事件
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 2000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
    }
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("pwa-dismissed", "1");
  };

  if (!show || installed) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 md:left-auto md:right-4 md:bottom-4 md:max-w-xs">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            📦
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">Crossly</p>
            <p className="text-[11px] text-white/50">添加到桌面，像 App 一样用</p>
          </div>
          <button onClick={handleDismiss} className="text-white/40 hover:text-white/70 flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {isIOS ? (
          /* iOS：分步引导 */
          <div className="px-4 py-3 space-y-2">
            <p className="text-xs text-white/60 mb-3">按以下步骤，把 Crossly 装到手机桌面：</p>
            {[
              { step: "1", icon: "⬆️", text: '点底部工具栏的「分享」按钮' },
              { step: "2", icon: "📲", text: '向下滑动，找到「添加到主屏幕」' },
              { step: "3", icon: "✅", text: '点右上角「添加」，完成！' },
            ].map(s => (
              <div key={s.step} className="flex items-center gap-2.5">
                <span className="text-xl flex-shrink-0">{s.icon}</span>
                <p className="text-xs text-white/80">{s.text}</p>
              </div>
            ))}
            <button onClick={handleDismiss}
              className="w-full mt-2 py-2 text-xs text-white/40 hover:text-white/60 transition-colors">
              我已经添加了，关闭
            </button>
          </div>
        ) : (
          /* Android/Chrome：一键安装 */
          <div className="px-4 py-3">
            <p className="text-xs text-white/60 mb-3">一键添加到手机桌面，随时打开，像 App 一样流畅</p>
            <div className="flex gap-2">
              <button onClick={handleInstall}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                📲 立即添加到桌面
              </button>
              <button onClick={handleDismiss}
                className="px-3 py-2.5 rounded-xl text-xs text-white/40 hover:text-white/60 border border-white/10 transition-colors">
                以后
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
