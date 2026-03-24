// popup.js - Ozon 选品工具插件弹窗逻辑

const DEFAULT_SITE = "https://ozon-tools.vercel.app";

let currentProduct = null;

function showToast(msg, duration = 2000) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), duration);
}

function formatPrice(price) {
  if (!price) return "未知";
  return `¥${parseFloat(price).toFixed(2)}`;
}

async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["siteUrl", "weight", "sellPrice"], (data) => {
      resolve({
        siteUrl: data.siteUrl || DEFAULT_SITE,
        weight: data.weight || 400,
        sellPrice: data.sellPrice || 0,
      });
    });
  });
}

async function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.local.set(settings, resolve);
  });
}

function renderProduct(product, settings) {
  const el = document.getElementById("content");
  el.innerHTML = `
    <div class="status-box">
      <div class="status-label">已识别商品</div>
      <div class="status-title">${product.title}</div>
      <div class="status-meta">
        <div class="meta-item"><span>进价 </span><strong>${formatPrice(product.price)}</strong></div>
        ${product.skuCount ? `<div class="meta-item"><span>规格 </span><strong>${product.skuCount}款</strong></div>` : ""}
      </div>
    </div>

    <div class="setting-row">
      <label>重量（克）</label>
      <input type="number" id="weightInput" value="${settings.weight}" min="1" />
    </div>
    <div class="setting-row">
      <label>期望售价（卢布，选填）</label>
      <input type="number" id="sellPriceInput" value="${settings.sellPrice || ""}" placeholder="留空后填" min="0" />
    </div>

    <div class="divider"></div>

    <button class="btn btn-primary" id="sendBtn">
      📤 发送到 Ozon 选品工具
    </button>

    <div class="divider"></div>

    <div class="site-row">
      <label>网站地址</label>
      <input type="text" id="siteInput" value="${settings.siteUrl}" />
    </div>
  `;

  document.getElementById("sendBtn").addEventListener("click", handleSend);
}

function renderManualInput(settings, pageUrl) {
  // 从URL提取offerId
  const offerMatch = pageUrl.match(/offer\/(\d+)/) || pageUrl.match(/offerId=(\d+)/);
  const offerId = offerMatch ? offerMatch[1] : "";

  const el = document.getElementById("content");
  el.innerHTML = `
    <div class="status-box" style="border-color:#fbbf24;background:#fffbeb;">
      <div class="status-label" style="color:#d97706;">⚠️ 自动识别失败，请手动填写</div>
      <div style="font-size:11px;color:#92400e;margin-top:4px;">商品ID: ${offerId || "未识别"}</div>
    </div>

    <div style="margin-bottom:10px;">
      <label style="font-size:12px;color:#64748b;display:block;margin-bottom:4px;">商品名称（从页面复制）</label>
      <input type="text" id="manualTitle" placeholder="粘贴商品标题" style="width:100%;border:1px solid #e2e8f0;border-radius:6px;padding:6px 8px;font-size:12px;box-sizing:border-box;" />
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
      <div>
        <label style="font-size:12px;color:#64748b;display:block;margin-bottom:4px;">进价（元）</label>
        <input type="number" id="manualPrice" placeholder="如：4.5" min="0" step="0.01" style="width:100%;border:1px solid #e2e8f0;border-radius:6px;padding:6px 8px;font-size:12px;box-sizing:border-box;" />
      </div>
      <div>
        <label style="font-size:12px;color:#64748b;display:block;margin-bottom:4px;">重量（克）</label>
        <input type="number" id="manualWeight" value="${settings.weight}" min="1" style="width:100%;border:1px solid #e2e8f0;border-radius:6px;padding:6px 8px;font-size:12px;box-sizing:border-box;" />
      </div>
    </div>

    <button class="btn btn-primary" id="manualSendBtn">📤 发送到 Ozon 选品工具</button>

    <div class="divider"></div>
    <div class="site-row">
      <label>网站地址</label>
      <input type="text" id="siteInput" value="${settings.siteUrl}" />
    </div>
  `;

  document.getElementById("manualSendBtn").addEventListener("click", async () => {
    const title = document.getElementById("manualTitle").value.trim();
    const price = parseFloat(document.getElementById("manualPrice").value) || 0;
    const weight = parseInt(document.getElementById("manualWeight").value) || 400;
    const siteUrl = document.getElementById("siteInput").value.trim() || DEFAULT_SITE;

    if (!title) { showToast("请填写商品名称"); return; }

    const btn = document.getElementById("manualSendBtn");
    btn.disabled = true;
    btn.innerHTML = "⏳ 发送中...";

    await saveSettings({ weight, siteUrl });

    currentProduct = {
      id: crypto.randomUUID(),
      title, titleRu: "", price, weight,
      images: [], sellPriceRub: 0, note: "",
      sourceUrl: pageUrl,
    };

    try {
      const res = await fetch(`${siteUrl}/api/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentProduct),
      });
      if (res.ok) {
        btn.className = "btn btn-success";
        btn.innerHTML = "✅ 已发送！";
        showToast("商品已添加！");
        setTimeout(() => chrome.tabs.create({ url: siteUrl }), 800);
      } else throw new Error();
    } catch {
      btn.disabled = false;
      btn.innerHTML = "📤 发送到 Ozon 选品工具";
      showToast("❌ 发送失败");
    }
  });
}

function renderNotProduct() {
  document.getElementById("content").innerHTML = `
    <div class="not-1688">
      <div class="icon">🔍</div>
      <p>请在 1688 商品详情页使用</p>
      <p style="margin-top:6px;font-size:11px;">打开任意 1688 商品后再点击插件</p>
    </div>
  `;
}

async function handleSend() {
  if (!currentProduct) return;

  const btn = document.getElementById("sendBtn");
  const weight = parseInt(document.getElementById("weightInput").value) || 400;
  const sellPrice = parseFloat(document.getElementById("sellPriceInput").value) || 0;
  const siteUrl = document.getElementById("siteInput").value.trim() || DEFAULT_SITE;

  await saveSettings({ weight, sellPrice, siteUrl });

  btn.disabled = true;
  btn.innerHTML = '<span class="loading">⏳</span> 发送中...';

  const product = {
    ...currentProduct,
    weight,
    sellPriceRub: sellPrice,
  };

  try {
    const res = await fetch(`${siteUrl}/api/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    if (res.ok) {
      btn.className = "btn btn-success";
      btn.innerHTML = "✅ 已发送！";
      btn.disabled = false;
      showToast("商品已添加到选品列表！");

      // 打开网站
      setTimeout(() => {
        chrome.tabs.create({ url: siteUrl });
      }, 800);
    } else {
      throw new Error("服务器返回错误");
    }
  } catch (e) {
    btn.disabled = false;
    btn.innerHTML = "📤 发送到 Ozon 选品工具";
    showToast("❌ 发送失败，请检查网站地址");
  }
}

// 初始化
async function init() {
  const settings = await loadSettings();

  // 获取当前Tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || "";

  const is1688Product = url.includes("1688.com") && (
    url.includes("/offer/") ||
    url.includes("detail.1688.com") ||
    url.includes("offer_id=") ||
    url.includes("offerId=")
  );

  if (!is1688Product) {
    renderNotProduct();
    return;
  }

  // 注入content script获取商品数据
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractProductData,
    });

    const product = results?.[0]?.result;
    if (product && product.title) {
      currentProduct = product;
      renderProduct(product, settings);
    } else {
      // 提取失败，显示手动输入模式
      renderManualInput(settings, tab.url);
    }
  } catch (e) {
    // scripting注入失败，显示手动输入
    renderManualInput(settings, tab.url);
  }
}

// 这个函数会在页面中执行，提取商品数据
function extractProductData() {
  try {
    // 1688商品标题 — 专用选择器（按优先级）
    const titleSelectors = [
      // 新版1688
      "[class*='title-container'] h1",
      "[class*='offer-title']",
      "[class*='product-title'] h1",
      ".title-text h1",
      ".mod-offer-title",
      // 通用
      "h1[class*='title']",
      "h1",
    ];
    let title = "";
    for (const sel of titleSelectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        const text = el.textContent.trim();
        // 标题应该比店铺名长，且包含商品关键词
        if (text.length > 10 && !text.includes("商行") && !text.includes("有限公司") && !text.includes("工厂")) {
          title = text;
          break;
        }
      }
      if (title) break;
    }
    // 最终兜底：用页面 title 标签（去掉 -1688 后缀）
    if (!title) {
      const docTitle = document.title;
      title = docTitle.replace(/[-_|].*?(1688|阿里).*$/, "").trim();
    }

    // 1688价格 — 取页面上最显眼的价格数字
    let price = null;
    const priceSelectors = [
      // 新版
      "[class*='price-common'] [class*='price-value']",
      "[class*='price-box'] [class*='value']",
      ".price-common-wrap [class*='value']",
      // SKU选中价
      "[class*='sku'] [class*='price']",
      // 通用
      "[class*='price']:not([class*='del']):not([class*='original']):not([class*='cross'])",
    ];
    for (const sel of priceSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        const text = el.textContent.replace(/[^\d.]/g, "");
        const num = parseFloat(text);
        if (num > 0 && num < 100000) { price = num; break; }
      }
    }
    // 兜底：找页面里 ¥ 后面的数字
    if (!price) {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const pricePattern = /[¥￥]\s*([\d.]+)/;
      let node;
      while ((node = walker.nextNode())) {
        const m = node.textContent.match(pricePattern);
        if (m) { price = parseFloat(m[1]); break; }
      }
    }

    // 图片
    const images = [];
    const imgSelectors = [
      "[class*='gallery'] img[src*='alicdn']",
      "[class*='thumb'] img[src*='alicdn']",
      ".detail-gallery img",
      "img[src*='alicdn.com']",
    ];
    for (const sel of imgSelectors) {
      const els = document.querySelectorAll(sel);
      for (const img of els) {
        const src = (img.src || img.dataset.src || "").split("?")[0];
        if (src && src.includes("alicdn") && !images.includes(src)) {
          images.push(src.replace(/_\d+x\d+\.(jpg|jpeg|png|webp)/i, "_400x400.$1"));
          if (images.length >= 5) break;
        }
      }
      if (images.length > 0) break;
    }

    const skuItems = document.querySelectorAll("[class*='sku-item'], .sku-content li");

    return {
      id: crypto.randomUUID(),
      title,
      titleRu: "",
      price: price || 0,
      weight: 0,
      images,
      sellPriceRub: 0,
      note: "",
      sourceUrl: window.location.href,
      skuCount: skuItems.length || null,
    };
  } catch (e) {
    return { error: e.message };
  }
}

init();
