import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // API 允许跨域
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,PATCH,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type,Authorization,X-Api-Token" },
        ],
      },
      {
        // 全站：微信内置浏览器兼容
        // 不设 COOP/COEP（微信 WebView 不支持）
        // 去掉 X-Frame-Options 限制，允许微信分享卡片内嵌
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          // 允许微信 webview 打开（不设 COOP: same-origin，否则 wx.config 失败）
          { key: "Cross-Origin-Opener-Policy", value: "unsafe-none" },
          // 允许微信聊天卡片 iframe 嵌入预览
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // 防止微信提示"链接有风险"
          { key: "Referrer-Policy", value: "no-referrer-when-downgrade" },
        ],
      },
    ];
  },
};

export default nextConfig;
