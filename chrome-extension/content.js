// Crossly content script v1.9.2
// 双模式：1688/义乌购商品采集 + Ozon Seller后台智能助手

// ═══════════════════════════════════════════════════
// SPA路由监听：Ozon是单页应用，URL变化不会重新加载页面
// ═══════════════════════════════════════════════════
let _crosslyPanelInjected = false;

function checkAndInjectOzonPanel() {
  const url = location.href;
  if (!url.includes("seller.ozon.ru")) return;

  const path = url;
  let targetFn = null;

  if (path.includes("showcase") || path.includes("constructor") || path.includes("commercial")) {
    targetFn = initShopDesignPanel;
  } else if (path.includes("warehouse") || path.includes("delivery") || path.includes("logistic") || path.includes("supply")) {
    targetFn = initWarehousePanel;
  } else if (path.includes("profile") || path.includes("settings") || path.includes("seller-info") || path.includes("company")) {
    targetFn = initStoreNamePanel;
  } else {
    targetFn = initShopDesignPanel; // 兜底
  }

  // 移除旧面板再重建
  document.getElementById("crossly-fab")?.remove();
  document.getElementById("crossly-panel")?.remove();
  document.getElementById("crossly-toast")?.remove();
  _crosslyPanelInjected = false;

  if (!_crosslyPanelInjected) {
    _crosslyPanelInjected = true;
    setTimeout(targetFn, 800);
  }
}

// 监听 History API（pushState/replaceState）
const _origPush = history.pushState.bind(history);
const _origReplace = history.replaceState.bind(history);
history.pushState = function(...args) { _origPush(...args); setTimeout(checkAndInjectOzonPanel, 1000); };
history.replaceState = function(...args) { _origReplace(...args); setTimeout(checkAndInjectOzonPanel, 1000); };
window.addEventListener("popstate", () => setTimeout(checkAndInjectOzonPanel, 1000));

// 立即执行一次（处理直接打开页面的情况）
if (location.href.includes("seller.ozon.ru")) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(checkAndInjectOzonPanel, 1000));
  } else {
    setTimeout(checkAndInjectOzonPanel, 1000);
  }
}

// ═══════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════
function waitFor(selector, timeout = 8000) {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);
    const ob = new MutationObserver(() => {
      const found = document.querySelector(selector);
      if (found) { ob.disconnect(); resolve(found); }
    });
    ob.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { ob.disconnect(); resolve(null); }, timeout);
  });
}

function injectStyle(css) {
  const s = document.createElement("style");
  s.textContent = css;
  document.head.appendChild(s);
}

// ═══════════════════════════════════════════════════
// OZON 后台：通用悬浮按钮样式
// ═══════════════════════════════════════════════════
function injectOzonStyles() {
  injectStyle(`
    #crossly-fab {
      position: fixed; bottom: 80px; right: 20px; z-index: 999999;
      width: 52px; height: 52px; border-radius: 50%;
      background: linear-gradient(135deg, #ff6b35, #9b3fcf);
      box-shadow: 0 4px 20px rgba(155,63,207,0.45);
      cursor: pointer; border: none; outline: none;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; transition: transform 0.2s;
    }
    #crossly-fab:hover { transform: scale(1.12); }
    #crossly-panel {
      position: fixed; bottom: 144px; right: 16px; z-index: 999998;
      width: 320px; background: white; border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      overflow: hidden; display: none; font-family: -apple-system, "PingFang SC", sans-serif;
    }
    #crossly-panel.open { display: block; animation: crosslySlideUp 0.2s ease; }
    @keyframes crosslySlideUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .crossly-header {
      background: linear-gradient(135deg, #ff6b35, #9b3fcf);
      padding: 12px 14px; display: flex; align-items: center; gap: 10px;
    }
    .crossly-header-logo { font-size: 20px; }
    .crossly-header-text { flex: 1; color: white; }
    .crossly-header-title { font-size: 13px; font-weight: 800; }
    .crossly-header-sub { font-size: 10px; opacity: 0.75; margin-top: 1px; }
    .crossly-close { color: white; opacity: 0.7; cursor: pointer; font-size: 18px; padding: 2px; }
    .crossly-body { padding: 12px; max-height: 420px; overflow-y: auto; }
    .crossly-section-title {
      font-size: 10px; font-weight: 800; color: #94a3b8;
      letter-spacing: 0.8px; text-transform: uppercase;
      margin: 10px 0 6px;
    }
    .crossly-btn {
      width: 100%; padding: 9px 12px; border-radius: 10px; border: none;
      font-size: 12px; font-weight: 700; cursor: pointer; text-align: left;
      display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
      transition: opacity 0.15s;
    }
    .crossly-btn:hover { opacity: 0.88; }
    .crossly-btn-primary { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: white; }
    .crossly-btn-orange  { background: linear-gradient(135deg,#ff6b35,#ea4c89); color: white; }
    .crossly-btn-green   { background: linear-gradient(135deg,#16a34a,#22c55e); color: white; }
    .crossly-btn-blue    { background: linear-gradient(135deg,#2563eb,#60a5fa); color: white; }
    .crossly-btn-gray    { background: #f1f5f9; color: #374151; }
    .crossly-tip {
      font-size: 10px; color: #64748b; background: #f8fafc;
      border-radius: 8px; padding: 7px 9px; margin-bottom: 6px;
      line-height: 1.5;
    }
    .crossly-toast {
      position: fixed; bottom: 160px; right: 16px; z-index: 9999999;
      background: #1a1a2e; color: white; font-size: 12px; font-weight: 600;
      padding: 8px 14px; border-radius: 10px; opacity: 0;
      transition: opacity 0.3s; pointer-events: none;
    }
    .crossly-toast.show { opacity: 1; }
    .crossly-input {
      width: 100%; border: 1.5px solid #e2e8f0; border-radius: 8px;
      padding: 7px 10px; font-size: 12px; margin-bottom: 6px;
      outline: none; box-sizing: border-box;
    }
    .crossly-input:focus { border-color: #6366f1; }
    .crossly-tag {
      display: inline-block; font-size: 9px; font-weight: 700;
      padding: 1px 7px; border-radius: 20px; margin-left: 4px;
      vertical-align: middle;
    }
    .crossly-divider { border: none; border-top: 1px solid #f1f5f9; margin: 8px 0; }
  `);
}

function showToast(msg) {
  let t = document.getElementById("crossly-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "crossly-toast";
    t.className = "crossly-toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

function createFAB(panelContent, headerTitle, headerSub) {
  injectOzonStyles();

  // FAB 按钮
  const fab = document.createElement("button");
  fab.id = "crossly-fab";
  fab.innerHTML = "📦";
  fab.title = "Crossly 小学生助手";
  document.body.appendChild(fab);

  // 面板
  const panel = document.createElement("div");
  panel.id = "crossly-panel";
  panel.innerHTML = `
    <div class="crossly-header">
      <div class="crossly-header-logo">📦</div>
      <div class="crossly-header-text">
        <div class="crossly-header-title">${headerTitle}</div>
        <div class="crossly-header-sub">${headerSub}</div>
      </div>
      <span class="crossly-close" id="crossly-close-btn">✕</span>
    </div>
    <div class="crossly-body">${panelContent}</div>
  `;
  document.body.appendChild(panel);

  fab.addEventListener("click", () => panel.classList.toggle("open"));
  document.getElementById("crossly-close-btn").addEventListener("click", () => panel.classList.remove("open"));

  // 事件委托：处理所有 data-cx-action 点击（避免 CSP 内联 onclick 限制）
  panel.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cx-action]");
    if (!btn) return;
    const action = btn.dataset.cxAction;
    const key = btn.dataset.cxKey;
    const name = btn.dataset.cxName;
    if (action === "selectTemplate" && window.crosslySelectTemplate) crosslySelectTemplate(key);
    if (action === "selectSize" && window.crosslySelectSize) crosslySelectSize(btn.dataset.cxIndex);
    if (action === "copyBanner" && window.crosslyCopy) crosslyCopy("banner");
    if (action === "downloadBanner" && window.crosslyDownloadBanner) crosslyDownloadBanner();
    if (action === "autoUploadBanner" && window.crosslyAutoUploadBanner) crosslyAutoUploadBanner();
    if (action === "applyWarehouse" && window.crosslyApplyWarehouse) crosslyApplyWarehouse(key);
    if (action === "copyName" && window.crosslyCopyName) crosslyCopyName(name);
    if (action === "translateName" && window.crosslyTranslateName) crosslyTranslateName();
  });
}

// ═══════════════════════════════════════════════════
// 功能 1：商店设计页 —— 一键装修模板
// ═══════════════════════════════════════════════════

const SHOP_TEMPLATES = {
  toy: {
    name: "🧸 玩具 / 毛绒公仔",
    color: "#ea4c89",
    bannerRu: "Мягкие игрушки из Китая\n★ Быстрая доставка ★ Качество проверено",
    bannerEn: "Plush toys from China · Fast delivery",
    sliderItems: ["Хиты продаж 🔥", "Новинки 🆕", "Топ недели ⭐"],
    storeNameSuggestions: ["Мишка из Китая", "Игрушки Счастья", "Пандочка Шоп"],
  },
  phone: {
    name: "📱 手机配件",
    color: "#2563eb",
    bannerRu: "Аксессуары для телефонов\n✓ Все модели ✓ Противоударные ✓ Быстрая зарядка",
    bannerEn: "Phone accessories · All models · Drop-proof",
    sliderItems: ["Чехлы для iPhone 📱", "Android аксессуары 🤖", "Кабели и зарядки ⚡"],
    storeNameSuggestions: ["ТехноЧехол", "ФастЧардж Шоп", "МобилАкс"],
  },
  home: {
    name: "🏠 家居 / 收纳",
    color: "#16a34a",
    bannerRu: "Товары для дома из Китая\n✓ Удобно ✓ Красиво ✓ Недорого",
    bannerEn: "Home goods from China · Cozy · Affordable",
    sliderItems: ["Хранение и порядок 📦", "Декор интерьера 🌿", "Кухня и быт 🍳"],
    storeNameSuggestions: ["Уютный Дом", "ОрганиZen", "Хоум Экспресс"],
  },
  beauty: {
    name: "💄 美妆 / 美甲",
    color: "#9333ea",
    bannerRu: "Красота из Китая\n✦ Маникюр ✦ Уход ✦ Тренды сезона",
    bannerEn: "Beauty from China · Nails · Skincare · Trends",
    sliderItems: ["Маникюр и ногти 💅", "Уход за кожей ✨", "Макияж и кисти 💄"],
    storeNameSuggestions: ["КрасоткаШоп", "НейлМания", "БьютиКитай"],
  },
  general: {
    name: "🛒 综合 / 百货",
    color: "#f59e0b",
    bannerRu: "Всё из Китая по лучшим ценам\n✓ Быстро ✓ Надёжно ✓ Выгодно",
    bannerEn: "Everything from China · Best prices",
    sliderItems: ["Хиты продаж 🔥", "Новые поступления 🆕", "Акции дня 💸"],
    storeNameSuggestions: ["Китайский Маркет", "ВсёЕсть Шоп", "МегаТоварКитай"],
  },
};

// Ozon 各槽位尺寸
const OZON_SIZES = [
  { label: "横幅大图 2832×600", w: 2832, h: 600 },
  { label: "横幅小图 686×290",  w: 686,  h: 290 },
  { label: "方形头像 200×200",  w: 200,  h: 200 },
];

function initShopDesignPanel() {

  const content = `
    <div class="crossly-tip">
      🎨 选品类 → 选尺寸 → 下载图片 → 上传Ozon！
    </div>

    <div class="crossly-section-title">① 选择主营品类</div>
    ${Object.entries(SHOP_TEMPLATES).map(([key, t]) => `
      <button class="crossly-btn crossly-btn-gray" data-cx-action="selectTemplate" data-cx-key="${key}">
        ${t.name}
      </button>
    `).join("")}

    <div id="crossly-template-result" style="display:none;">
      <hr class="crossly-divider">
      <div class="crossly-section-title">② 选择图片尺寸</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;">
        ${OZON_SIZES.map((s, i) => `
          <button class="crossly-btn crossly-btn-gray" style="flex:1;min-width:80px;font-size:10px;padding:6px 4px;text-align:center;"
            data-cx-action="selectSize" data-cx-index="${i}">
            ${s.label}
          </button>
        `).join("")}
      </div>

      <div class="crossly-section-title">③ 预览</div>
      <canvas id="crossly-banner-canvas" style="width:100%;border-radius:8px;margin-bottom:8px;display:block;"></canvas>
      <div id="crossly-size-info" class="crossly-tip" style="font-size:10px;margin-bottom:6px;"></div>
      <button class="crossly-btn crossly-btn-orange" data-cx-action="downloadBanner">
        ⬇️ 下载 JPEG（≤500Kb，直接上传Ozon）
      </button>
      <button class="crossly-btn crossly-btn-primary" data-cx-action="autoUploadBanner">
        🚀 自动注入上传框
      </button>

      <hr class="crossly-divider">
      <div class="crossly-section-title">文案（点击复制）</div>
      <div id="crossly-banner-text" class="crossly-tip" style="cursor:pointer;border:1.5px dashed #6366f1;color:#1e2d5a;font-weight:600;" data-cx-action="copyBanner">-</div>
      <div class="crossly-section-title">推荐俄语店名</div>
      <div id="crossly-name-suggestions" class="crossly-tip">-</div>
    </div>
  `;

  createFAB(content, "Crossly 一键装修", "图片+文案+自动上传");

  let currentCategory = "toy";
  let currentSize = OZON_SIZES[1]; // 默认 686×290

  function redraw() {
    const t = SHOP_TEMPLATES[currentCategory];
    drawBanner(currentCategory, t, currentSize.w, currentSize.h);
    // 估算文件大小（JPEG quality 0.85）
    const canvas = document.getElementById("crossly-banner-canvas");
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const kb = Math.round((dataUrl.length * 3 / 4) / 1024);
    const sizeEl = document.getElementById("crossly-size-info");
    if (sizeEl) sizeEl.textContent = `📐 ${currentSize.w}×${currentSize.h} px｜预计 ${kb}Kb（Ozon限500Kb）${kb > 500 ? " ⚠️ 超限，已自动降质量" : " ✅"}`;
  }

  window.crosslySelectTemplate = (key) => {
    currentCategory = key;
    const t = SHOP_TEMPLATES[key];
    document.getElementById("crossly-template-result").style.display = "block";
    document.getElementById("crossly-banner-text").textContent = t.bannerRu;
    document.getElementById("crossly-banner-text").dataset.text = t.bannerRu;
    document.getElementById("crossly-name-suggestions").innerHTML =
      t.storeNameSuggestions.map(n => `• ${n}`).join("<br>");
    redraw();
    showToast(`✅ 「${t.name}」已生成！`);
  };

  window.crosslySelectSize = (idx) => {
    currentSize = OZON_SIZES[parseInt(idx)];
    redraw();
  };

  window.crosslyCopy = (type) => {
    if (type === "banner") {
      const text = document.getElementById("crossly-banner-text").dataset.text || "";
      navigator.clipboard.writeText(text).then(() => showToast("✅ 已复制文案！"));
    }
  };

  window.crosslyDownloadBanner = () => {
    const canvas = document.getElementById("crossly-banner-canvas");
    if (!canvas?.width) { showToast("❌ 请先选择品类"); return; }
    // 自动调整质量确保 ≤500Kb
    let quality = 0.88;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    while (dataUrl.length * 3 / 4 > 500 * 1024 && quality > 0.3) {
      quality -= 0.05;
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `crossly-${currentCategory}-${currentSize.w}x${currentSize.h}.jpg`;
    a.click();
    showToast(`✅ 下载 JPEG！(${currentSize.w}×${currentSize.h})`);
  };

  window.crosslyAutoUploadBanner = () => {
    const canvas = document.getElementById("crossly-banner-canvas");
    if (!canvas?.width) { showToast("❌ 请先选择品类"); return; }
    const fileInput = document.querySelector('input[type="file"]');
    if (!fileInput) { showToast("❌ 请先点Ozon「请上传图片」再点此按钮"); return; }
    let quality = 0.88;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    while (dataUrl.length * 3 / 4 > 500 * 1024 && quality > 0.3) {
      quality -= 0.05;
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }
    fetch(dataUrl).then(r => r.blob()).then(blob => {
      const file = new File([blob], `crossly-${currentCategory}.jpg`, { type: "image/jpeg" });
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      fileInput.dispatchEvent(new Event("input", { bubbles: true }));
      showToast("✅ 已注入！如未生效请用「下载」手动上传");
    });
  };

  // 默认选 686×290
  window.crosslySelectSize = (idx) => {
    currentSize = OZON_SIZES[parseInt(idx)];
    if (document.getElementById("crossly-banner-canvas")?.width) redraw();
  };
}

// ── Canvas 绘制横幅 ────────────────────────────────
function drawBanner(key, tpl, W, H) {
  const canvas = document.getElementById("crossly-banner-canvas");
  if (!canvas) return;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const COLORS = {
    toy:     ["#ea4c89", "#f59e0b"],
    phone:   ["#1e40af", "#3b82f6"],
    home:    ["#14532d", "#22c55e"],
    beauty:  ["#6b21a8", "#ec4899"],
    general: ["#b45309", "#f59e0b"],
  };
  const [c1, c2] = COLORS[key] || COLORS.general;

  // 背景渐变
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 装饰圆（半透明）
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(W * 0.08, H * 0.5, H * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W * 0.92, H * 0.5, H * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  const scale = H / 600; // 按高度缩放字体

  // Emoji（右侧）
  ctx.font = `${Math.round(180 * scale)}px serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText(tpl.emoji || "🛒", W - H * 0.38, H * 0.68);

  // 主标题
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = `900 ${Math.round(78 * scale)}px "Arial Black", Arial, sans-serif`;
  const title = tpl.bannerRu?.split("\n")[0] || tpl.name;
  // 截断防溢出
  const maxW = W * 0.68;
  let fontSize = Math.round(78 * scale);
  ctx.font = `900 ${fontSize}px "Arial Black", Arial, sans-serif`;
  while (ctx.measureText(title).width > maxW && fontSize > 20) {
    fontSize -= 2;
    ctx.font = `900 ${fontSize}px "Arial Black", Arial, sans-serif`;
  }
  ctx.fillText(title, H * 0.26, H * 0.54);

  // 副标题
  const subtitle = tpl.bannerRu?.split("\n")[1] || "";
  ctx.font = `${Math.round(36 * scale)}px Arial, sans-serif`;
  ctx.globalAlpha = 0.85;
  ctx.fillText(subtitle, H * 0.26, H * 0.75);
  ctx.globalAlpha = 1;

  // 品牌水印
  ctx.font = `bold ${Math.round(18 * scale)}px Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.textAlign = "right";
  ctx.fillText("crossly.cn", W - 20, H - 14);
}

// ═══════════════════════════════════════════════════
// 功能 2：仓库/物流页 —— 义乌北苑一键配置
// ═══════════════════════════════════════════════════

const WAREHOUSE_PRESETS = {
  yiwu_rets: {
    name: "义乌北苑 RETS 专线",
    cutoff: 5,          // 备货天数
    shipDays: 7,        // 预计送达
    trackingRequired: true,
    tips: [
      "备货期必须≥5天（工厂→货代→贴标→仓库扫描）",
      "选RETS/SLS路线，比普通路线快2-3天",
      "退货选「自动销毁」，退回运费比货值高",
      "发货后24小时内必须上传运单号",
    ],
  },
  yiwu_standard: {
    name: "义乌北苑 普通线路",
    cutoff: 7,
    shipDays: 14,
    trackingRequired: true,
    tips: [
      "普通线路备货期设7天更安全",
      "适合大件或不紧急的商品",
      "成本比RETS低约20%",
    ],
  },
};

function initWarehousePanel() {
  const content = `
    <div class="crossly-tip">
      ⚠️ <strong>备货期填错会被Ozon罚款！</strong><br>
      按小学生标准一键配置，安全稳定不踩坑。
    </div>

    <div class="crossly-section-title">选择物流方案</div>
    ${Object.entries(WAREHOUSE_PRESETS).map(([key, p]) => `
      <button class="crossly-btn ${key === 'yiwu_rets' ? 'crossly-btn-orange' : 'crossly-btn-gray'}"
        data-cx-action="applyWarehouse" data-cx-key="${key}">
        ${p.name}
        <span style="margin-left:auto;font-size:10px;opacity:0.8">备货${p.cutoff}天</span>
      </button>
    `).join("")}

    <hr class="crossly-divider">
    <div class="crossly-section-title">📋 避坑清单（按参考填写）</div>
    <div id="crossly-warehouse-tips" class="crossly-tip" style="line-height:1.8;">
      ${WAREHOUSE_PRESETS.yiwu_rets.tips.map(t => `✓ ${t}`).join("<br>")}
    </div>

    <div class="crossly-section-title">⚙️ 推荐参数（手动填入Ozon）</div>
    <div id="crossly-warehouse-params" class="crossly-tip">
      <strong>备货期：</strong>5天<br>
      <strong>路线：</strong>RETS / SLS<br>
      <strong>退货：</strong>自动销毁（不退回）<br>
      <strong>发货地：</strong>浙江省 义乌市
    </div>
  `;

  createFAB(content, "Crossly 仓库配置", "义乌北苑专线 · 小学生标准参数");

  window.crosslyApplyWarehouse = (key) => {
    const p = WAREHOUSE_PRESETS[key];
    document.getElementById("crossly-warehouse-tips").innerHTML =
      p.tips.map(t => `✓ ${t}`).join("<br>");
    document.getElementById("crossly-warehouse-params").innerHTML = `
      <strong>备货期：</strong>${p.cutoff}天<br>
      <strong>路线：</strong>${key === 'yiwu_rets' ? 'RETS / SLS（推荐）' : '普通线路'}<br>
      <strong>退货：</strong>自动销毁（不退回）<br>
      <strong>发货地：</strong>浙江省 义乌市
    `;

    // 尝试自动填充备货天数输入框
    const inputs = document.querySelectorAll("input[type='number'], input[placeholder*='дн'], input[placeholder*='день']");
    let filled = 0;
    inputs.forEach(input => {
      const label = input.closest("label,div")?.textContent || "";
      if (label.includes("дн") || label.includes("готовност") || label.includes("обработк")) {
        input.value = p.cutoff;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        filled++;
      }
    });

    showToast(filled > 0
      ? `✅ 已自动填入备货期 ${p.cutoff} 天！`
      : `✅ 方案已加载，请参考上方参数手动填写`);
  };
}

// ═══════════════════════════════════════════════════
// 功能 3：店铺信息页 —— AI俄语取名助手
// ═══════════════════════════════════════════════════

const NAME_TEMPLATES = {
  toy:     ["Мишка из Китая 🐻", "Игрушки Счастья 🎁", "Пандочка Шоп 🐼", "МягкоМир 🧸", "КлассныеИгрушки"],
  phone:   ["ТехноЧехол 📱", "ФастЧардж Шоп ⚡", "МобилАкс", "ЧехолМастер", "АйТиГаджет"],
  home:    ["Уютный Дом 🏠", "ОрганиZen ✨", "Хоум Экспресс", "КомфортLife", "ДомоВой"],
  beauty:  ["КрасоткаШоп 💄", "НейлМания 💅", "БьютиКитай ✨", "ГламурПоинт", "ЦветыКрасоты"],
  general: ["Китайский Маркет 🛒", "ВсёЕсть Шоп", "МегаТовар", "ПрямойКитай", "ВыгодаПлюс"],
};

function initStoreNamePanel() {
  const content = `
    <div class="crossly-tip">
      🏪 好名字 = 搜索权重高 + 买家记得住<br>
      选品类，一秒生成地道俄语店名，直接复制！
    </div>

    <div class="crossly-section-title">选择主营品类</div>
    <select id="crossly-name-cat" class="crossly-input" onchange="crosslyGenNames()">
      <option value="toy">🧸 玩具/毛绒</option>
      <option value="phone">📱 手机配件</option>
      <option value="home">🏠 家居收纳</option>
      <option value="beauty">💄 美妆美甲</option>
      <option value="general">🛒 综合百货</option>
    </select>

    <div class="crossly-section-title">✨ 推荐店名（点击一键复制）</div>
    <div id="crossly-name-list">
      ${NAME_TEMPLATES.toy.map(n => `
        <button class="crossly-btn crossly-btn-gray" data-cx-action="copyName" data-cx-name="${n}">
          ${n}
          <span style="margin-left:auto;font-size:10px;color:#94a3b8">点击复制</span>
        </button>
      `).join("")}
    </div>

    <hr class="crossly-divider">
    <div class="crossly-section-title">✏️ 自定义店名翻译</div>
    <input id="crossly-custom-name" class="crossly-input" placeholder="输入中文名，我帮你翻译成俄语..." />
    <button class="crossly-btn crossly-btn-primary" data-cx-action="translateName">
      🤖 AI翻译成俄语
    </button>
    <div id="crossly-translate-result" class="crossly-tip" style="display:none;"></div>
  `;

  createFAB(content, "Crossly 取名助手", "地道俄语店名 · 搜索权重高");

  window.crosslyGenNames = () => {
    const cat = document.getElementById("crossly-name-cat").value;
    const names = NAME_TEMPLATES[cat] || NAME_TEMPLATES.general;
    document.getElementById("crossly-name-list").innerHTML =
      names.map(n => `
        <button class="crossly-btn crossly-btn-gray" data-cx-action="copyName" data-cx-name="${n}">
          ${n}
          <span style="margin-left:auto;font-size:10px;color:#94a3b8">点击复制</span>
        </button>
      `).join("");
  };

  window.crosslyCopyName = (name) => {
    navigator.clipboard.writeText(name).then(() => showToast(`✅ 已复制：${name}`));
  };

  window.crosslyTranslateName = async () => {
    const input = document.getElementById("crossly-custom-name").value.trim();
    if (!input) return;
    const resultEl = document.getElementById("crossly-translate-result");
    resultEl.style.display = "block";
    resultEl.textContent = "🤖 AI翻译中...";
    try {
      const res = await fetch("https://www.crossly.cn/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: `把这个店名翻译成俄语，给3个选项，每个都简洁有吸引力（适合Ozon搜索排名），直接列出3个俄语名字，不要解释：${input}` }),
      });
      const data = await res.json();
      const answer = data.answer || "翻译失败，请手动翻译";
      resultEl.innerHTML = `<strong>翻译结果：</strong><br>${answer.replace(/\n/g, "<br>")}`;
    } catch {
      resultEl.textContent = "网络错误，请检查网络连接";
    }
  };
}

// ═══════════════════════════════════════════════════
// 商品页数据采集（原有功能保留）
// ═══════════════════════════════════════════════════
function scanProductData() {
  const data = { images: [], detailImages: [], price: 0, title: "", specs: {} };
  const h1 = document.querySelector("h1");
  if (h1) data.title = h1.textContent.trim();
  const ogTitle = document.querySelector("meta[property='og:title']")?.content;
  if (ogTitle && ogTitle.length > data.title.length) data.title = ogTitle;

  document.querySelectorAll("img").forEach(img => {
    const src = img.src || img.getAttribute("data-src") || "";
    if (src && src.startsWith("http") && (img.naturalWidth >= 300 || img.width >= 300)) {
      if (!data.images.includes(src)) data.images.push(src);
    }
  });

  const priceEl = document.querySelector("[class*='price']");
  if (priceEl) {
    const m = priceEl.textContent.match(/[\d.,]+/);
    if (m) data.price = parseFloat(m[0].replace(",", "."));
  }

  const specRows = document.querySelectorAll("tr, [class*='spec-item'], [class*='attribute']");
  specRows.forEach(row => {
    const cells = row.querySelectorAll("td, [class*='label'], [class*='value']");
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim();
      const val = cells[1].textContent.trim();
      if (key && val && key.length < 30) data.specs[key] = val;
    }
  });

  return data;
}

window.__crosslyGetData = scanProductData;

// ═══════════════════════════════════════════════════
// 入口
function init() {
  const url = location.href;
  if (url.includes("seller.ozon.ru")) {
    checkAndInjectOzonPanel();
    return;
  }
  if (url.includes("1688.com") || url.includes("yiwugo.com")) {
    scanProductData();
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(scanProductData, 1000);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
