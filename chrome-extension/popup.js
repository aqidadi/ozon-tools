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
      renderNotProduct();
    }
  } catch (e) {
    renderNotProduct();
  }
}

// 这个函数会在页面中执行，提取商品数据
function extractProductData() {
  try {
    // 获取标题 - 1688多种页面结构
    const titleSelectors = [
      ".product-title-text",
      ".title-text",
      ".mod-detail-title h1",
      ".offer-title",
      "h1.title",
      "h1",
    ];
    let title = "";
    for (const sel of titleSelectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim().length > 5) {
        title = el.textContent.trim();
        break;
      }
    }
    // fallback: document.title
    if (!title) title = document.title.split("-")[0].trim();

    // 获取价格 - 1688价格选择器
    let price = null;
    const priceSelectors = [
      ".price-module__price",
      ".price-common-wrap .value",
      ".price-num",
      ".price .value",
      "[class*='priceText']",
      ".price-original",
    ];
    for (const sel of priceSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        const text = el.textContent.trim().replace(/[^\d.]/g, "");
        if (text && parseFloat(text) > 0) {
          price = text;
          break;
        }
      }
    }

    // 从页面文本找价格（兜底）
    if (!price) {
      const allText = document.body.innerText;
      const m = allText.match(/新人价[^\d]*([\d.]+)/) ||
                allText.match(/¥\s*([\d.]+)/) ||
                allText.match(/价格[^\d]*([\d.]+)/);
      if (m) price = m[1];
    }

    // 获取图片
    const images = [];
    const imgSelectors = [
      ".detail-gallery-img img",
      ".gallery-items img",
      ".mod-detail-gallery img",
      "[class*='gallery'] img",
      "[class*='thumb'] img",
    ];
    for (const sel of imgSelectors) {
      const els = document.querySelectorAll(sel);
      for (const img of els) {
        const src = img.src || img.dataset.src || img.dataset.lazySrc;
        if (src && src.startsWith("http") && !src.includes("placeholder")) {
          const hd = src.replace(/_\d+x\d+[^.]*\.(jpg|jpeg|png|webp)/i, "_400x400.$1")
                        .replace(/\.jpg_\d+.*$/, ".jpg")
                        .replace(/\.png_\d+.*$/, ".png");
          if (!images.includes(hd)) images.push(hd);
          if (images.length >= 5) break;
        }
      }
      if (images.length > 0) break;
    }

    // SKU数量
    const skuItems = document.querySelectorAll("[class*='sku-item'], [class*='SKUItem'], .sku-content li");

    return {
      id: crypto.randomUUID(),
      title,
      titleRu: "",
      price: price ? parseFloat(price) : 0,
      weight: 0,
      images,
      sellPriceRub: 0,
      note: "",
      sourceUrl: window.location.href,
      skuCount: skuItems.length || null,
    };
  } catch (e) {
    return null;
  }
}

init();
