// popup.js - Ozon 选品工具插件弹窗逻辑

const DEFAULT_SITE = "https://www.crossly.cn";

let currentProduct = null;

function showToast(msg, duration = 2500) {
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
    chrome.storage.local.get(["siteUrl", "weight", "sellPrice", "apiToken", "userEmail"], (data) => {
      resolve({
        siteUrl: data.siteUrl || DEFAULT_SITE,
        weight: data.weight || 400,
        sellPrice: data.sellPrice || 0,
        apiToken: data.apiToken || "",
        userEmail: data.userEmail || "",
      });
    });
  });
}

async function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.local.set(settings, resolve);
  });
}

// 带 token 的 fetch 封装
async function authFetch(url, options = {}, apiToken = "") {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(apiToken ? { "X-Api-Token": apiToken } : {}),
      ...(options.headers || {}),
    },
  });
}

// 登录/绑定 token 界面
function renderLogin(settings) {
  const el = document.getElementById("content");
  el.innerHTML = `
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px;margin-bottom:10px;">
      <div style="font-size:12px;font-weight:600;color:#1d4ed8;margin-bottom:3px;">🔑 绑定账号</div>
      <div style="font-size:11px;color:#3b82f6;">绑定后导入的商品会保存到你的账号</div>
    </div>

    <div style="margin-bottom:8px;">
      <label style="font-size:11px;color:#64748b;display:block;margin-bottom:4px;">邮箱</label>
      <input type="email" id="loginEmail" value="${settings.userEmail}" placeholder="your@email.com"
        style="width:100%;border:1px solid #e2e8f0;border-radius:6px;padding:7px 10px;font-size:12px;box-sizing:border-box;" />
    </div>
    <div style="margin-bottom:10px;">
      <label style="font-size:11px;color:#64748b;display:block;margin-bottom:4px;">密码</label>
      <input type="password" id="loginPassword" placeholder="••••••"
        style="width:100%;border:1px solid #e2e8f0;border-radius:6px;padding:7px 10px;font-size:12px;box-sizing:border-box;" />
    </div>
    <button id="loginBtn" style="width:100%;background:#2563eb;color:white;border:none;border-radius:8px;padding:9px;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:8px;">
      登录绑定
    </button>
    <div id="loginError" style="font-size:11px;color:#ef4444;text-align:center;display:none;"></div>
    <div style="text-align:center;margin-top:8px;">
      <a href="${settings.siteUrl}" target="_blank" style="font-size:11px;color:#3b82f6;text-decoration:none;">还没账号？去网站注册 →</a>
    </div>
    <div class="divider" style="height:1px;background:#e2e8f0;margin:10px 0;"></div>
    <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">或者直接粘贴 API Token</div>
    <div style="display:flex;gap:6px;">
      <input type="text" id="directToken" placeholder="粘贴 API Token..."
        style="flex:1;border:1px solid #e2e8f0;border-radius:6px;padding:7px 8px;font-size:11px;font-family:monospace;" />
      <button id="saveTokenBtn" style="background:#475569;color:white;border:none;border-radius:6px;padding:7px 10px;font-size:12px;cursor:pointer;">保存</button>
    </div>
  `;

  document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const siteUrl = settings.siteUrl;
    const errEl = document.getElementById("loginError");
    const btn = document.getElementById("loginBtn");

    if (!email || !password) { errEl.textContent = "请填写邮箱和密码"; errEl.style.display = "block"; return; }
    btn.disabled = true; btn.textContent = "登录中...";

    try {
      const res = await fetch(`${siteUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        errEl.textContent = data.error || "登录失败"; errEl.style.display = "block";
        btn.disabled = false; btn.textContent = "登录绑定"; return;
      }

      await saveSettings({ apiToken: data.user.apiToken, userEmail: email });
      showToast(`✅ 已绑定：${email}（${data.user.plan === "pro" ? "Pro" : "免费版"}）`);
      init(); // 重新初始化
    } catch {
      errEl.textContent = "网络错误"; errEl.style.display = "block";
      btn.disabled = false; btn.textContent = "登录绑定";
    }
  });

  document.getElementById("saveTokenBtn").addEventListener("click", async () => {
    const token = document.getElementById("directToken").value.trim();
    if (!token) return;
    await saveSettings({ apiToken: token });
    showToast("✅ Token 已保存");
    init();
  });
}

// ─────────────────────────────────────────────────────────────
// 在1688页面中执行：完整抓取（主图+详情图+规格参数）
// 这个函数在用户浏览器中运行，有Cookie，不受IP限制！
// ─────────────────────────────────────────────────────────────
function extractProductData() {
  return new Promise((resolve) => {
    // 等浏览器空闲再抓，避免1688懒加载还没写入DOM
    const doExtract = () => {
    try {
      // ── 工具函数 ──
      function getBestSrc(el) {
        const attrs = ["src","data-src","data-lazy-src","data-original","data-lazy","data-img-src","data-url","data-image","data-origin-src","data-real-src"];
        for (const attr of attrs) {
          const v = el.getAttribute(attr);
          if (v && v.startsWith("http") && /\.(jpg|jpeg|png|webp)/i.test(v.split("?")[0])) return v.split("?")[0];
        }
        const srcset = el.getAttribute("srcset");
        if (srcset) {
          const parts = srcset.split(",").map(s => s.trim().split(/\s+/)[0]).filter(s => s.startsWith("http"));
          if (parts.length) return parts[parts.length-1].split("?")[0];
        }
        return null;
      }
      function isLogo(src) {
        return /\/logo\.|\/icon\.|\/avatar\.|_logo\.|_icon\.|-logo\d*\.|favicon/i.test(src);
      }
      function upscale(src) { return src.replace(/_(\d+x\d+)\.(jpg|jpeg|png|webp)/i, "_800x800.$2"); }

      // ── 标题 ──
      const titleSelectors = [
        "meta[property='og:title']",
        "[class*='title-container'] h1","[class*='offer-title']","[class*='product-title'] h1",
        ".title-text h1",".mod-offer-title","h1[class*='title']","h1",
      ];
      let title = "";
      // 先试 og:title meta
      const ogTitle = document.querySelector("meta[property='og:title']")?.content;
      if (ogTitle && ogTitle.length > 5) title = ogTitle;
      if (!title) {
        for (const sel of titleSelectors) {
          for (const el of document.querySelectorAll(sel)) {
            const text = el.textContent?.trim() || el.content?.trim() || "";
            if (text.length > 10 && !text.includes("商行") && !text.includes("有限公司")) { title = text; break; }
          }
          if (title) break;
        }
      }
      if (!title) title = document.title.replace(/[-_|].*?(1688|阿里).*$/, "").trim();

      // ── 价格（四重保险）──
      let price = 0;
      // 1. og meta（最稳）
      const metaPrice = document.querySelector("meta[property='og:product:price:amount']")?.content;
      if (metaPrice) price = parseFloat(metaPrice);
      // 2. data-price属性
      if (!price) {
        const dpEl = document.querySelector("[data-price]");
        if (dpEl) price = parseFloat(dpEl.getAttribute("data-price") || "0");
      }
      // 3. class匹配（取最小值=最低/券后价）
      if (!price) {
        const priceNums = [];
        for (const el of document.querySelectorAll("[class*='price'],[class*='Price']")) {
          const n = parseFloat(el.textContent.replace(/[^\d.]/g, ""));
          if (n > 0 && n < 99999) priceNums.push(n);
        }
        if (priceNums.length) price = Math.min(...priceNums);
      }
      // 4. 文本扫描兜底
      if (!price) {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          const m = node.textContent.match(/[¥￥]\s*([\d.]+)/);
          if (m) { price = parseFloat(m[1]); break; }
        }
      }

      // ── 主图（更广选择器）──
      const mainImages = [], seenMain = new Set();
      const mainSelectors = [
        // 缩略图列表（主图区）
        "[class*='gallery'] img","[class*='Gallery'] img",
        "[class*='thumb'] img","[class*='Thumb'] img",
        "[class*='img-list'] img","[class*='imgList'] img",
        "[class*='img-wrap'] img","[class*='imgWrap'] img",
        "[class*='main-img'] img","[class*='mainImg'] img",
        "[class*='swiper'] img","[class*='Swiper'] img",
        "[class*='carousel'] img","[class*='slider'] img",
        "[class*='preview'] img","[class*='Preview'] img",
        "[class*='photo'] img","[class*='Photo'] img",
        ".detail-gallery img","#J_ThumbList img","#J_ImgBooth img",
        // 1688新版
        "[class*='image-list'] img","[class*='imageList'] img",
      ];
      for (const sel of mainSelectors) {
        for (const img of document.querySelectorAll(sel)) {
          const src = getBestSrc(img);
          if (!src || isLogo(src) || seenMain.has(src)) continue;
          if (!/\.(jpg|jpeg|png|webp)/i.test(src.split("?")[0])) continue;
          seenMain.add(src); mainImages.push(upscale(src));
          if (mainImages.length >= 10) break;
        }
        if (mainImages.length >= 5) break;
      }
      // 兜底：扫所有img，找大尺寸的
      if (mainImages.length < 3) {
        for (const img of document.querySelectorAll("img")) {
          const src = getBestSrc(img);
          if (!src || isLogo(src) || seenMain.has(src)) continue;
          if (!/\.(jpg|jpeg|png|webp)/i.test(src.split("?")[0])) continue;
          const w = img.naturalWidth || parseInt(img.getAttribute("width")||"0");
          const h = img.naturalHeight || parseInt(img.getAttribute("height")||"0");
          if ((w > 0 && w < 100) || (h > 0 && h < 100)) continue;
          seenMain.add(src); mainImages.push(upscale(src));
          if (mainImages.length >= 10) break;
        }
      }

      // ── 详情图 ──
      const detailImages = [], seenDetail = new Set();
      let descContainer = null;
      for (const sel of [
        "#mod-detail-desc","[class*='detail-desc']","[class*='detailDesc']",
        "[class*='product-desc']","[class*='productDesc']","[class*='offer-detail']",
        "#J_DivItemDesc","[class*='desc-content']","[class*='descContent']",
        "[data-module='detail']",".description",
        "[class*='detail-content']","[class*='detailContent']",
        "[class*='detailWrapper']","[class*='detail-wrapper']",
        "[class*='description']","[class*='Description']",
        "[class*='mod-desc']","[class*='modDesc']",
      ]) {
        descContainer = document.querySelector(sel);
        if (descContainer) break;
      }
      const scanRoot = descContainer || document.body;

      for (const img of scanRoot.querySelectorAll("img")) {
        const src = getBestSrc(img);
        if (!src || isLogo(src) || seenDetail.has(src) || seenMain.has(src)) continue;
        if (!/\.(jpg|jpeg|png|webp)/i.test(src.split("?")[0])) continue;
        const wAttr = parseInt(img.getAttribute("width")||"0");
        if (wAttr > 0 && wAttr < 80) continue;
        seenDetail.add(src); detailImages.push(src);
        if (detailImages.length >= 40) break;
      }
      // 正则兜底扫innerHTML
      const urlPattern = /(?:data-src|data-lazy-src|data-original|data-lazy|data-img-src|data-url|data-image|src)=["']?(https?:\/\/[^"'\s>?#]+\.(?:jpg|jpeg|png|webp))/gi;
      for (const m of scanRoot.innerHTML.matchAll(urlPattern)) {
        const src = m[1].split("?")[0];
        if (isLogo(src) || seenDetail.has(src) || seenMain.has(src)) continue;
        seenDetail.add(src); detailImages.push(src);
        if (detailImages.length >= 40) break;
      }

      // ── 规格参数（支持table/dt-dd/class三种结构）──
      const specs = {};
      for (const row of document.querySelectorAll("table tr")) {
        const cells = row.querySelectorAll("td, th");
        for (let i = 0; i + 1 < cells.length; i += 2) {
          const k = cells[i].textContent.trim().replace(/：$/,"").slice(0, 20);
          const v = cells[i+1].textContent.trim().slice(0, 100);
          if (k && v && !specs[k]) specs[k] = v;
        }
      }
      if (Object.keys(specs).length === 0) {
        for (const dt of document.querySelectorAll("dt")) {
          const dd = dt.nextElementSibling;
          if (dd?.tagName === "DD") {
            const k = dt.textContent.trim().replace(/：$/, ""), v = dd.textContent.trim();
            if (k && v && k.length < 20) specs[k] = v.slice(0, 100);
          }
        }
      }
      if (Object.keys(specs).length === 0) {
        for (const sel of ["[class*='prop-wrap'],[class*='attribute-item'],[class*='spec-item']","[class*='detail-prop'] li"]) {
          for (const item of document.querySelectorAll(sel)) {
            const text = item.textContent.trim();
            const idx = text.indexOf("：") !== -1 ? text.indexOf("：") : text.indexOf(":");
            if (idx > 0) {
              const k = text.slice(0, idx).trim().slice(0, 20);
              const v = text.slice(idx+1).trim().slice(0, 100);
              if (k && v && !specs[k]) specs[k] = v;
            }
          }
          if (Object.keys(specs).length > 3) break;
        }
      }

      // ── 店铺名 ──
      let shopName = "";
      for (const sel of ["[class*='shop-name']","[class*='company-name']","[class*='seller-name']","a[href*='/company/']"]) {
        const el = document.querySelector(sel);
        if (el?.textContent?.trim()) { shopName = el.textContent.trim(); break; }
      }

      // ── 月销量 ──
      let monthlySales = 0;
      const salesMatch = document.body.innerText.match(/月销[量售]?\s*[：:]?\s*([\d,]+)/);
      if (salesMatch) monthlySales = parseInt(salesMatch[1].replace(/,/g, ""));

      // ── 起订量 ──
      let moq = 1;
      for (const sel of ["[class*='min-order']","[class*='moq']"]) {
        const el = document.querySelector(sel);
        if (el) { const m = el.textContent.match(/(\d+)/); if (m) { moq = parseInt(m[1]); break; } }
      }

      const noteParts = [];
      if (shopName) noteParts.push(`店铺：${shopName}`);
      if (monthlySales) noteParts.push(`月销${monthlySales}`);
      if (moq > 1) noteParts.push(`起订${moq}件`);

      resolve({
        id: crypto.randomUUID(),
        title, titleRu: "", price: price || 0, weight: 0,
        images: mainImages, detailImages, specs, monthlySales, moq,
        sellPrices: {}, sellPriceRub: 0,
        note: noteParts.join(" | "),
        sourceUrl: window.location.href,
        skuCount: document.querySelectorAll("[class*='sku-item']").length || null,
      });
    } catch (e) {
      resolve({ error: e.message });
    }
    };

    // 优先用 requestIdleCallback，等浏览器空闲再抓
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(doExtract, { timeout: 2000 });
    } else {
      setTimeout(doExtract, 500);
    }
  });
}
// 批量导入