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

// 在当前1688页面执行搜索
async function searchOn1688(keyword, tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (kw) => {
      // 找搜索框并填入关键词
      const input = document.querySelector(
        'input[type="text"][name="keywords"], input.search-input, input[placeholder*="搜"], #search-key, .search-bar input'
      );
      if (input) {
        input.value = kw;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        // 触发搜索按钮
        const btn = document.querySelector(
          'button.search-btn, .search-button, button[type="submit"], .btn-search'
        );
        if (btn) btn.click();
        else {
          // 回车触发
          input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", keyCode: 13, bubbles: true }));
        }
      } else {
        // 直接跳转搜索结果
        const encoded = encodeURIComponent(kw);
        window.location.href = `https://s.1688.com/selloffer/offer_search.html?keyword=${encoded}&sortType=6`;
      }
    },
    args: [keyword],
  });
}

function renderSearch(settings, tabId, is1688) {
  const el = document.getElementById("content");
  el.innerHTML = `
    <div style="margin-bottom:12px;">
      <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">🔍 搜索选品关键词</div>
      <div style="display:flex;gap:6px;">
        <input type="text" id="searchInput" placeholder="输入关键词搜1688..." 
          style="flex:1;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;font-size:13px;outline:none;" />
        <button id="searchBtn" style="background:#2563eb;color:white;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;font-size:13px;white-space:nowrap;">搜索</button>
      </div>
    </div>

    <div style="margin-bottom:10px;">
      <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">⭐ 热门关键词（点击搜索）</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px;" id="hotKeywords">
        ${[
          "咒术回战手办", "棉花娃娃", "盲盒玩具", "毛绒公仔", "动漫摆件",
          "积木玩具", "硅藻泥地垫", "保温杯", "磁吸支架", "卡通贴纸",
          "发夹头饰", "手账本", "钥匙扣挂件", "LED小夜灯", "宠物玩具"
        ].map(kw => `
          <button class="kw-btn" data-kw="${kw}" 
            style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:20px;padding:4px 10px;font-size:11px;cursor:pointer;color:#475569;">
            ${kw}
          </button>
        `).join("")}
      </div>
    </div>

    <div class="divider" style="height:1px;background:#e2e8f0;margin:10px 0;"></div>
    <div style="font-size:11px;color:#94a3b8;text-align:center;">
      ${is1688 ? "搜索将在当前1688页面执行" : "搜索将打开新的1688页面"}
    </div>
  `;

  const doSearch = async () => {
    const kw = document.getElementById("searchInput").value.trim();
    if (!kw) return;
    const btn = document.getElementById("searchBtn");
    btn.textContent = "跳转中...";
    
    if (is1688) {
      await searchOn1688(kw, tabId);
      showToast(`正在搜索「${kw}」`);
    } else {
      const url = `https://s.1688.com/selloffer/offer_search.html?keyword=${encodeURIComponent(kw)}&sortType=6`;
      chrome.tabs.create({ url });
    }
    btn.textContent = "搜索";
  };

  document.getElementById("searchBtn").addEventListener("click", doSearch);
  document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });

  // 热门关键词点击
  document.getElementById("hotKeywords").addEventListener("click", async (e) => {
    const btn = e.target.closest(".kw-btn");
    if (!btn) return;
    const kw = btn.dataset.kw;
    document.getElementById("searchInput").value = kw;
    
    if (is1688) {
      await searchOn1688(kw, tabId);
      showToast(`正在搜索「${kw}」`);
    } else {
      const url = `https://s.1688.com/selloffer/offer_search.html?keyword=${encodeURIComponent(kw)}&sortType=6`;
      chrome.tabs.create({ url });
    }
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
  const offerMatch = pageUrl.match(/offer\/(\d+)/) || pageUrl.match(/offerId=(\d+)/);
  const offerId = offerMatch ? offerMatch[1] : "";

  const el = document.getElementById("content");
  el.innerHTML = `
    <div class="status-box" style="border-color:#fbbf24;background:#fffbeb;">
      <div class="status-label" style="color:#d97706;">⚠️ 自动识别失败，请手动填写</div>
      <div style="font-size:11px;color:#92400e;margin-top:4px;">商品ID: ${offerId || "未识别"}</div>
    </div>

    <div style="margin-bottom:10px;">
      <label style="font-size:12px;color:#64748b;display:block;margin-bottom:4px;">商品名称</label>
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

  const product = { ...currentProduct, weight, sellPriceRub: sellPrice };

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
      setTimeout(() => chrome.tabs.create({ url: siteUrl }), 800);
    } else throw new Error();
  } catch {
    btn.disabled = false;
    btn.innerHTML = "📤 发送到 Ozon 选品工具";
    showToast("❌ 发送失败，请检查网站地址");
  }
}

// 这个函数会在页面中执行，提取商品数据
function extractProductData() {
  try {
    const titleSelectors = [
      "[class*='title-container'] h1",
      "[class*='offer-title']",
      "[class*='product-title'] h1",
      ".title-text h1",
      ".mod-offer-title",
      "h1[class*='title']",
      "h1",
    ];
    let title = "";
    for (const sel of titleSelectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        const text = el.textContent.trim();
        if (text.length > 10 && !text.includes("商行") && !text.includes("有限公司") && !text.includes("工厂")) {
          title = text;
          break;
        }
      }
      if (title) break;
    }
    if (!title) {
      const docTitle = document.title;
      title = docTitle.replace(/[-_|].*?(1688|阿里).*$/, "").trim();
    }

    let price = null;
    const priceSelectors = [
      "[class*='price-common'] [class*='price-value']",
      "[class*='price-box'] [class*='value']",
      ".price-common-wrap [class*='value']",
      "[class*='sku'] [class*='price']",
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
    if (!price) {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const pricePattern = /[¥￥]\s*([\d.]+)/;
      let node;
      while ((node = walker.nextNode())) {
        const m = node.textContent.match(pricePattern);
        if (m) { price = parseFloat(m[1]); break; }
      }
    }

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

// 初始化
async function init() {
  const settings = await loadSettings();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || "";

  const is1688 = url.includes("1688.com");
  const is1688Product = is1688 && (url.includes("/offer/") || url.includes("detail.1688.com") || url.includes("offerId="));

  // 切换导航 tab
  document.getElementById("tabSearch").addEventListener("click", () => {
    setTab("search", settings, tab.id, is1688);
  });
  document.getElementById("tabImport").addEventListener("click", async () => {
    setTab("import", settings, tab.id, is1688Product);
  });

  // 默认显示：1688商品页显示导入，其他显示搜索
  if (is1688Product) {
    setTab("import", settings, tab.id, true);
  } else {
    setTab("search", settings, tab.id, is1688);
  }
}

async function setTab(tab, settings, tabId, condition) {
  // 更新导航样式
  document.getElementById("tabSearch").style.background = tab === "search" ? "#2563eb" : "#f1f5f9";
  document.getElementById("tabSearch").style.color = tab === "search" ? "white" : "#64748b";
  document.getElementById("tabImport").style.background = tab === "import" ? "#2563eb" : "#f1f5f9";
  document.getElementById("tabImport").style.color = tab === "import" ? "white" : "#64748b";

  if (tab === "search") {
    renderSearch(settings, tabId, condition);
  } else {
    if (!condition) {
      renderManualInput(settings, "");
      return;
    }
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: extractProductData,
      });
      const product = results?.[0]?.result;
      if (product && product.title) {
        currentProduct = product;
        renderProduct(product, settings);
      } else {
        renderManualInput(settings, "");
      }
    } catch {
      renderManualInput(settings, "");
    }
  }
}

init();
