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

    // 非iOS：检测是否支持 beforeinstallprompt（Chrome/Edge）
    // UC/微信等不支持，也显示手动引导
    let promptCaptured = false;
    const handler = (e: Event) => {
      e.preventDefault();
      promptCaptured = true;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 2000);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // 3秒后如果还没触发 beforeinstallprompt（UC/微信等），改用手动引导
    const fallback = setTimeout(() => {
      if (!promptCaptured) {
        setIsIOS(false); // 用通用手动引导
        setShow(true);
      }
    }, 4000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(fallback);
    };
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

        {deferredPrompt ? (
          /* Chrome/Edge：一键安装 */
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
        ) : isIOS ? (
          /* iOS Safari：分步引导 */
          <div className="px-4 py-3 space-y-2.5">
            <p className="text-xs text-white/60 mb-2">用 Safari 打开此页，按以下步骤：</p>
            {[
              { icon: "⬆️", text: '点底部中间的「分享」按钮（方框+箭头图标）' },
              { icon: "📲", text: '向下滑，找「添加到主屏幕」并点击' },
              { icon: "✅", text: '右上角点「添加」，完成！' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-lg flex-shrink-0 mt-0.5">{s.icon}</span>
                <p className="text-xs text-white/80">{s.text}</p>
              </div>
            ))}
            <button onClick={handleDismiss}
              className="w-full mt-1 py-2 text-xs text-white/40 hover:text-white/60 transition-colors">
              我已经添加了，关闭
            </button>
          </div>
        ) : (
          /* UC/微信等其他浏览器：通用引导 */
          <div className="px-4 py-3 space-y-2.5">
            <p className="text-xs text-white/60 mb-2">把 Crossly 装到手机桌面，随时打开：</p>
            {[
              { icon: "⋯", text: '点浏览器右上角「···」或「⋮」菜单' },
              { icon: "📲", text: '找「添加到桌面」或「添加到主屏幕」' },
              { icon: "✅", text: '确认添加，桌面就有图标了！' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className={`flex-shrink-0 mt-0.5 ${i === 0 ? "text-base font-black text-white/60 w-5 text-center" : "text-lg"}`}>{s.icon}</span>
                <p className="text-xs text-white/80">{s.text}</p>
              </div>
            ))}
            <button onClick={handleDismiss}
              className="w-full mt-1 py-2 text-xs text-white/40 hover:text-white/60 transition-colors">
              我已经添加了，关闭
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
