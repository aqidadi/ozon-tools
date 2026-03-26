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
    const doExtract = () => {
    try {
      // 优先用content script拦截到的接口数据
      const intercepted = window.__crosslyGetData ? window.__crosslyGetData() : {};

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
        return /\/logo\.|\/icon\.|\/avatar\.|_logo\.|_icon\.-logo\d*\.|favicon/i.test(src);
      }
      function upscale(src) { return src.replace(/_(\d+x\d+)\.(jpg|jpeg|png|webp)/i, "_800x800.$2"); }

      // 标题
      let title = intercepted.title || "";
      if (!title) {
        const ogTitle = document.querySelector("meta[property='og:title']")?.content;
        if (ogTitle && ogTitle.length > 5) title = ogTitle;
      }
      if (!title) {
        for (const sel of ["[class*='title-container'] h1","[class*='offer-title']","[class*='product-title'] h1",".title-text h1",".mod-offer-title","h1[class*='title']","h1"]) {
          for (const el of document.querySelectorAll(sel)) {
            const text = el.textContent?.trim() || "";
            if (text.length > 10 && !text.includes("商行") && !text.includes("有限公司")) { title = text; break; }
          }
          if (title) break;
        }
      }
      if (!title) title = document.title.replace(/[-_|].*?(1688|阿里).*$/, "").trim();

      // 价格 - 四重优先级，取最准确的值
      let price = 0;
      // 1. og meta（最稳）
      const metaP = document.querySelector("meta[property='og:product:price:amount']")?.content;
      if (metaP) price = parseFloat(metaP);
      // 2. 专用price选择器
      if (!price) {
        const priceSelectors = [".price-text", ".price-number", ".price-num", "[class*='price-common'] [class*='value']", "[class*='unit-price']"];
        for (const sel of priceSelectors) {
          const els = document.querySelectorAll(sel);
          if (!els.length) continue;
          const nums = Array.from(els).map(el => parseFloat(el.innerText.replace(/[^\d.]/g,""))).filter(n => n >= 1 && n <= 9999);
          if (nums.length) { price = Math.min(...nums); break; }
        }
      }
      // 3. 全文¥扫描，取>=1且出现最多的价格（排除运费等噪音）
      if (!price) {
        const allText = document.body.innerText;
        const matches = [...allText.matchAll(/[¥￥]\s*(\d+(?:\.\d{1,2})?)/g)];
        const nums = matches.map(m => parseFloat(m[1])).filter(n => n >= 1 && n <= 9999 && !isNaN(n));
        if (nums.length) {
          // 取出现>=2次的最小值；否则取第一个>=1的
          const freq = {};
          nums.forEach(n => freq[n] = (freq[n]||0)+1);
          const repeated = nums.filter(n => freq[n] >= 2);
          price = repeated.length ? Math.min(...repeated) : nums[0];
        }
      }

      // 主图 - 优先拦截数据
      const mainImages = [], seenMain = new Set();
      if (intercepted.images && intercepted.images.length > 0) {
        intercepted.images.forEach(src => { if (src && !seenMain.has(src)) { seenMain.add(src); mainImages.push(src); } });
      }
      if (mainImages.length < 3) {
      const mainSelectors = [
        "img.preview-img",
        "img.active-preview-img",
        "[class*='preview-img']",
        "img.ant-image-img",
        // 通用gallery选择器
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
        "[class*='image-list'] img","[class*='imageList'] img",
      ];
      for (const sel of mainSelectors) {
        for (const img of document.querySelectorAll(sel)) {
          const src = getBestSrc(img);
          if (!src || isLogo(src) || seenMain.has(src)) continue;
          if (!/\.(jpg|jpeg|png|webp)/i.test(src.split("?")[0])) continue;
          // naturalWidth=0说明还在加载中，不过滤；>0时才检查尺寸
          const w = img.naturalWidth;
          const h = img.naturalHeight;
          if (w > 0 && w < 100) continue;
          if (h > 0 && h < 100) continue;
          seenMain.add(src); mainImages.push(upscale(src));
          if (mainImages.length >= 10) break;
        }
        if (mainImages.length >= 3) break;
      }
      // 兜底：扫所有img，找>=300px的
      if (mainImages.length < 3) {
        for (const img of document.querySelectorAll("img")) {
          const src = getBestSrc(img);
          if (!src || isLogo(src) || seenMain.has(src)) continue;
          if (!/\.(jpg|jpeg|png|webp)/i.test(src.split("?")[0])) continue;
          const w = img.naturalWidth || parseInt(img.getAttribute("width")||"0");
          const h = img.naturalHeight || parseInt(img.getAttribute("height")||"0");
          if (w > 0 && w < 300) continue;
          if (h > 0 && h < 300) continue;
          seenMain.add(src); mainImages.push(upscale(src));
          if (mainImages.length >= 10) break;
        }
      }
      } // end if(mainImages.length < 3) for intercepted

      // 详情图
      const detailImages = [], seenDetail = new Set();
      let descContainer = null;
      for (const sel of ["#mod-detail-desc","[class*='detail-desc']","[class*='detailDesc']","[class*='product-desc']","[class*='productDesc']","[class*='offer-detail']","#J_DivItemDesc","[class*='desc-content']","[class*='descContent']","[data-module='detail']",".description","[class*='detail-content']","[class*='detailContent']","[class*='detailWrapper']","[class*='detail-wrapper']","[class*='description']","[class*='Description']"]) {
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
      const urlPattern = /(?:data-src|data-lazy-src|data-original|data-lazy|data-img-src|data-url|data-image|src)=["'](https?:\/\/[^"\'\s>?#]+\.(?:jpg|jpeg|png|webp))/gi;
      for (const m of scanRoot.innerHTML.matchAll(urlPattern)) {
        const src = m[1].split("?")[0];
        if (isLogo(src) || seenDetail.has(src) || seenMain.has(src)) continue;
        seenDetail.add(src); detailImages.push(src);
        if (detailImages.length >= 40) break;
      }

      // 规格参数（支持多种结构）
      const specs = {};
      for (const row of document.querySelectorAll("table tr")) {
        const cells = row.querySelectorAll("td, th");
        if (cells.length >= 2) {
          // 标准两列格式
          for (let i = 0; i + 1 < cells.length; i += 2) {
            const k = cells[i].textContent.trim().replace(/：$/,"").slice(0, 20);
            const v = cells[i+1].textContent.trim().slice(0, 100);
            if (k && v && !specs[k]) specs[k] = v;
          }
        } else if (cells.length === 1) {
          // 单td，key和value用tab或冒号分隔（1688常见）
          const text = cells[0].textContent.trim();
          const tabIdx = text.indexOf("\t");
          const colonIdx = text.indexOf("：") !== -1 ? text.indexOf("：") : text.indexOf(":");
          const splitIdx = tabIdx > 0 ? tabIdx : colonIdx;
          if (splitIdx > 0) {
            const k = text.slice(0, splitIdx).trim().replace(/：$/,"").slice(0, 20);
            const v = text.slice(splitIdx+1).trim().slice(0, 100);
            if (k && v && !specs[k]) specs[k] = v;
          }
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

      // 店铺名
      let shopName = "";
      for (const sel of ["[class*='shop-name']","[class*='company-name']","[class*='seller-name']","a[href*='/company/']"]) {
        const el = document.querySelector(sel);
        if (el?.textContent?.trim()) { shopName = el.textContent.trim(); break; }
      }

      // 月销量
      let monthlySales = 0;
      const salesMatch = document.body.innerText.match(/月销[量售]?\s*[：:]?\s*([\d,]+)/);
      if (salesMatch) monthlySales = parseInt(salesMatch[1].replace(/,/g, ""));

      // 起订量
      let moq = 1;
      for (const sel of ["[class*='min-order']","[class*='moq']"]) {
        const el = document.querySelector(sel);
        if (el) { const m = el.textContent.match(/(\d+)/); if (m) { moq = parseInt(m[1]); break; } }
      }

      const noteParts = [];
      if (shopName) noteParts.push(`店铺：${shopName}`);
      if (monthlySales) noteParts.push(`月销${monthlySales}`);
      if (moq > 1) noteParts.push(`起订${moq}件`);

      const urlHash = window.location.href.replace(/[^a-zA-Z0-9]/g, "").slice(-32);
      resolve({
        id: "p_" + urlHash,
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
    // 直接执行，调用前已通过滚动等待确保渲染完成
    doExtract();
  });
}

// ─────────────────────────────────────────────────────────────
// 批量导入：读取多个URL，依次打开标签页抓取
// ─────────────────────────────────────────────────────────────
async function batchImportFromUrls(urls, siteUrl, weight, onProgress) {
  const results = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    onProgress(i, urls.length, url);
    try {
      // 后台打开标签
      const tab = await chrome.tabs.create({ url, active: false });
      // 等待加载完成
      await new Promise((resolve) => {
        const listener = (tabId, info) => {
          if (tabId === tab.id && info.status === "complete") {
            chrome.tabs.onUpdated.removeListener(listener);
            resolve();
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
        // 最多等15秒
        setTimeout(resolve, 15000);
      });

      // 第一步：点击商品详情tab
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => {
        const tabs = document.querySelectorAll("[class*='tab'] a, [class*='tab'] li, [role='tab'], .tab-item, button, span, a");
        for (const el of tabs) {
          const t = el.textContent?.trim();
          if (t === "商品详情" || t === "产品详情" || t === "详情") { el.click(); break; }
        }
      }}).catch(()=>{});
      await new Promise(r => setTimeout(r, 800));

      // 第二步：分段滚动触发懒加载（10步，每步400ms）
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => {
        return new Promise(resolve => {
          const total = document.body.scrollHeight;
          const steps = 10;
          let i = 0;
          const timer = setInterval(() => {
            window.scrollTo(0, (total / steps) * i);
            i++;
            if (i > steps) { clearInterval(timer); window.scrollTo(0, 0); resolve(); }
          }, 400);
        });
      }}).catch(()=>{});
      await new Promise(r => setTimeout(r, 2500)); // 等图片渲染完

      // 第三步：提取数据
      const res = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractProductData,
      });
      const product = res?.[0]?.result;
      if (product && product.title) {
        product.weight = weight;
        // 推送到服务器（带 token）
        await authFetch(`${siteUrl}/api/import`, {
          method: "POST",
          body: JSON.stringify(product),
        }, apiToken);
        results.push({ url, success: true, title: product.title, imageCount: product.images.length, detailCount: product.detailImages?.length || 0 });
      } else {
        results.push({ url, success: false, error: product?.error || "提取失败" });
      }
      // 关闭标签
      chrome.tabs.remove(tab.id);
    } catch (e) {
      results.push({ url, success: false, error: e.message });
    }
    // 间隔1.5秒
    if (i < urls.length - 1) await new Promise(r => setTimeout(r, 1500));
  }
  return results;
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
    const url = `https://s.1688.com/selloffer/offer_search.html?keyword=${encodeURIComponent(kw)}&sortType=6`;
    chrome.tabs.create({ url });
    btn.textContent = "搜索";
  };

  document.getElementById("searchBtn").addEventListener("click", doSearch);
  document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });
  document.getElementById("hotKeywords").addEventListener("click", async (e) => {
    const btn = e.target.closest(".kw-btn");
    if (!btn) return;
    const kw = btn.dataset.kw;
    chrome.tabs.create({ url: `https://s.1688.com/selloffer/offer_search.html?keyword=${encodeURIComponent(kw)}&sortType=6` });
  });
}

// ─────────────────────────────────────────────────────────────
// 批量导入界面
// ─────────────────────────────────────────────────────────────
function renderBatchImport(settings) {
  const el = document.getElementById("content");
  el.innerHTML = `
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px;margin-bottom:10px;">
      <div style="font-size:12px;font-weight:600;color:#1d4ed8;margin-bottom:3px;">📦 批量搬运</div>
      <div style="font-size:11px;color:#3b82f6;">每行一个1688链接，插件在你的浏览器里打开，完整抓取图片+详情+规格</div>
    </div>

    <div style="margin-bottom:8px;">
      <label style="font-size:11px;color:#64748b;display:block;margin-bottom:4px;">粘贴1688链接（每行一个，最多10个）</label>
      <textarea id="batchUrls" rows="5" placeholder="https://detail.1688.com/offer/111111.html&#10;https://detail.1688.com/offer/222222.html&#10;https://detail.1688.com/offer/333333.html"
        style="width:100%;border:1px solid #e2e8f0;border-radius:6px;padding:8px;font-size:11px;font-family:monospace;box-sizing:border-box;resize:none;"></textarea>
    </div>

    <div style="display:flex;gap:8px;margin-bottom:8px;">
      <div style="flex:1;">
        <label style="font-size:11px;color:#64748b;display:block;margin-bottom:3px;">默认重量(克)</label>
        <input type="number" id="batchWeight" value="${settings.weight}" min="1"
          style="width:100%;border:1px solid #e2e8f0;border-radius:6px;padding:6px;font-size:12px;box-sizing:border-box;" />
      </div>
      <div style="flex:1;">
        <label style="font-size:11px;color:#64748b;display:block;margin-bottom:3px;">目标网站</label>
        <input type="text" id="batchSite" value="${settings.siteUrl}"
          style="width:100%;border:1px solid #e2e8f0;border-radius:6px;padding:6px;font-size:11px;box-sizing:border-box;" />
      </div>
    </div>

    <button id="batchStartBtn" style="width:100%;background:#2563eb;color:white;border:none;border-radius:8px;padding:10px;font-size:13px;font-weight:600;cursor:pointer;">
      🚀 开始批量导入
    </button>

    <div id="batchProgress" style="margin-top:10px;display:none;">
      <div style="height:4px;background:#e2e8f0;border-radius:4px;margin-bottom:6px;overflow:hidden;">
        <div id="batchBar" style="height:100%;background:#2563eb;border-radius:4px;width:0%;transition:width 0.4s;"></div>
      </div>
      <div id="batchLog" style="max-height:140px;overflow-y:auto;font-size:11px;space-y:2px;"></div>
    </div>
  `;

  document.getElementById("batchStartBtn").addEventListener("click", async () => {
    const rawUrls = document.getElementById("batchUrls").value;
    const weight = parseInt(document.getElementById("batchWeight").value) || 400;
    const siteUrl = document.getElementById("batchSite").value.trim() || settings.siteUrl;

    const urls = rawUrls
      .split(/[\n,，\s]+/)
      .map(u => u.trim())
      .filter(u => u.includes("1688.com"))
      .slice(0, 10);

    if (urls.length === 0) { showToast("请粘贴1688商品链接"); return; }

    const btn = document.getElementById("batchStartBtn");
    btn.disabled = true;
    btn.textContent = "⏳ 导入中，请勿关闭插件...";

    const progressEl = document.getElementById("batchProgress");
    const barEl = document.getElementById("batchBar");
    const logEl = document.getElementById("batchLog");
    progressEl.style.display = "block";

    await saveSettings({ weight, siteUrl });

    const results = await batchImportFromUrls(urls, siteUrl, weight, (i, total, url) => {
      barEl.style.width = `${(i / total) * 100}%`;
      const short = url.match(/offer\/(\d+)/)?.[1] || url.slice(-15);
      logEl.innerHTML = `<div style="color:#64748b;padding:2px 0;">⏳ [${i+1}/${total}] ${short}...</div>` + logEl.innerHTML;
    });

    barEl.style.width = "100%";
    const ok = results.filter(r => r.success).length;
    btn.disabled = false;
    btn.textContent = `✅ 完成！${ok}/${results.length} 成功`;
    btn.style.background = "#16a34a";

    logEl.innerHTML = results.map(r => `
      <div style="display:flex;align-items:center;gap:4px;padding:3px 0;border-bottom:1px solid #f1f5f9;">
        <span>${r.success ? "✅" : "❌"}</span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${r.success ? "#1e293b" : "#ef4444"};">
          ${r.success ? r.title?.slice(0, 25) + "..." : r.error}
        </span>
        ${r.success ? `<span style="font-size:10px;color:#94a3b8;">${r.imageCount}图/${r.detailCount}详</span>` : ""}
      </div>
    `).join("") + logEl.innerHTML;

    if (ok > 0) {
      setTimeout(() => chrome.tabs.create({ url: siteUrl }), 1500);
    }
  });
}

function renderProduct(product, settings) {
  const el = document.getElementById("content");
  const detailCount = product.detailImages?.length || 0;
  const specCount = Object.keys(product.specs || {}).length;
  el.innerHTML = `
    <div class="status-box">
      <div class="status-label">已识别商品 ✓</div>
      <div class="status-title">${product.title}</div>
      <div class="status-meta">
        <div class="meta-item"><span>进价 </span><strong>${formatPrice(product.price)}</strong></div>
        ${product.images?.length ? `<div class="meta-item"><span>主图 </span><strong>${product.images.length}张</strong></div>` : ""}
        ${detailCount ? `<div class="meta-item" style="color:#16a34a;"><span>详情图 </span><strong>${detailCount}张</strong></div>` : `<div class="meta-item" style="color:#f59e0b;"><span>详情图 </span><strong>未抓到</strong></div>`}
        ${specCount ? `<div class="meta-item"><span>规格 </span><strong>${specCount}项</strong></div>` : ""}
      </div>
    </div>

    <div class="setting-row">
      <label>重量（克）</label>
      <input type="number" id="weightInput" value="${settings.weight}" min="1" />
    </div>
    <div class="setting-row">
      <label>期望售价（选填）</label>
      <div style="display:flex;gap:6px;">
        <select id="currencySelect" style="border:1px solid #e2e8f0;border-radius:6px;padding:6px 8px;font-size:12px;background:white;">
          <option value="RUB">₽ 卢布</option>
          <option value="USD">$ 美元</option>
          <option value="THB">฿ 泰铢</option>
          <option value="VND">₫ 越南盾</option>
          <option value="IDR">Rp 印尼盾</option>
          <option value="MYR">RM 马币</option>
          <option value="AED">د.إ 迪拉姆</option>
          <option value="BRL">R$ 巴西雷亚尔</option>
        </select>
        <input type="number" id="sellPriceInput" value="${settings.sellPrice || ""}" placeholder="留空后填" min="0" style="flex:1;" />
      </div>
    </div>

    <div class="divider"></div>

    <button class="btn btn-primary" id="sendBtn">
      📤 发送到选品工具
    </button>

    ${!detailCount ? `
      <div style="margin-top:8px;padding:8px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;font-size:11px;color:#92400e;">
        ⚠️ 详情图未抓到。请向下滚动页面让图片加载后，再点击插件重新识别。
      </div>
    ` : ""}

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

    <button class="btn btn-primary" id="manualSendBtn">📤 发送到选品工具</button>

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
    const siteUrl = (document.getElementById("siteInput").value.trim() || DEFAULT_SITE).replace(/\/$/, "");
    if (!title) { showToast("请填写商品名称"); return; }

    const btn = document.getElementById("manualSendBtn");
    btn.disabled = true;
    btn.innerHTML = "⏳ 发送中...";
    await saveSettings({ weight, siteUrl });

    currentProduct = {
      id: crypto.randomUUID(),
      title, titleRu: "", price, weight,
      images: [], detailImages: [], specs: {},
      sellPrices: {}, sellPriceRub: 0, note: "",
      sourceUrl: pageUrl,
    };

    try {
      const res = await authFetch(`${siteUrl}/api/import`, {
        method: "POST",
        body: JSON.stringify(currentProduct),
      }, settings.apiToken);
      if (res.ok) {
        btn.className = "btn btn-success";
        btn.innerHTML = "✅ 已发送！";
        showToast("商品已添加！");
        setTimeout(() => chrome.tabs.create({ url: siteUrl }), 800);
      } else throw new Error();
    } catch {
      btn.disabled = false;
      btn.innerHTML = "📤 发送到选品工具";
      showToast("❌ 发送失败");
    }
  });
}

async function handleSend() {
  if (!currentProduct) return;
  const btn = document.getElementById("sendBtn");
  const weight = parseInt(document.getElementById("weightInput").value) || 400;
  const sellPrice = parseFloat(document.getElementById("sellPriceInput").value) || 0;
  const currency = document.getElementById("currencySelect")?.value || "RUB";
  const siteUrl = (document.getElementById("siteInput").value.trim() || DEFAULT_SITE).replace(/\/$/, "");

  await saveSettings({ weight, sellPrice, siteUrl });

  btn.disabled = true;
  btn.innerHTML = "⏳ 发送中...";

  const product = { ...currentProduct, weight, sellPriceRub: sellPrice, sellPrices: { [currency]: sellPrice } };

  const settings2 = await loadSettings();
  try {
    const res = await authFetch(`${siteUrl}/api/import`, {
      method: "POST",
      body: JSON.stringify(product),
    }, settings2.apiToken);
    if (res.ok) {
      btn.className = "btn btn-success";
      btn.innerHTML = "✅ 已发送！";
      btn.disabled = false;
      showToast(`已导入：主图${product.images?.length||0}张，详情图${product.detailImages?.length||0}张`);
      setTimeout(() => chrome.tabs.create({ url: siteUrl }), 800);
    } else throw new Error();
  } catch {
    btn.disabled = false;
    btn.innerHTML = "📤 发送到选品工具";
    showToast("❌ 发送失败，请检查网站地址");
  }
}

function renderOzonPicker(tabId, settings) {
  const el = document.getElementById("content");
  el.innerHTML = `
    <div style="background:#e8f5e9;border:1px solid #a5d6a7;border-radius:8px;padding:10px;margin-bottom:10px;">
      <div style="font-size:12px;font-weight:600;color:#2e7d32;margin-bottom:4px;">🟢 检测到 Ozon 页面</div>
      <div style="font-size:11px;color:#388e3c;">点击下方按钮抓取页面热销商品，自动翻译并去1688搜索</div>
    </div>
    <button class="btn btn-primary" id="grabOzonBtn">📦 抓取当前页面热销商品</button>
    <div id="ozonResults" style="margin-top:10px;"></div>
  `;

  document.getElementById("grabOzonBtn").addEventListener("click", async () => {
    const btn = document.getElementById("grabOzonBtn");
    btn.disabled = true;
    btn.textContent = "⏳ 抓取中...";

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: extractOzonProducts,
      });
      const products = results?.[0]?.result || [];
      if (products.length === 0) {
        document.getElementById("ozonResults").innerHTML = `<div style="color:#ef4444;font-size:12px;text-align:center;padding:10px;">未找到商品，请在Ozon商品列表页使用</div>`;
        btn.disabled = false; btn.textContent = "📦 抓取当前页面热销商品";
        return;
      }
      const resultsEl = document.getElementById("ozonResults");
      resultsEl.innerHTML = `
        <div style="font-size:11px;color:#64748b;margin-bottom:6px;">抓到 ${products.length} 个商品，点击去1688搜索：</div>
        <div style="max-height:200px;overflow-y:auto;">
          ${products.map((p, i) => `
            <div style="display:flex;align-items:center;gap:6px;padding:6px;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:4px;cursor:pointer;background:white;" class="ozon-item" data-name="${p.name}" data-i="${i}">
              ${p.image ? `<img src="${p.image}" style="width:36px;height:36px;object-fit:cover;border-radius:4px;flex-shrink:0;" />` : ""}
              <div style="flex:1;min-width:0;">
                <div style="font-size:11px;color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name}</div>
                <div style="font-size:10px;color:#94a3b8;">₽${p.price || "?"} · 点击去1688找货源</div>
              </div>
              <span style="font-size:16px;">→</span>
            </div>
          `).join("")}
        </div>
      `;
      resultsEl.querySelectorAll(".ozon-item").forEach(item => {
        item.addEventListener("click", async () => {
          const name = item.dataset.name;
          item.style.background = "#f0fdf4";
          item.querySelector("span").textContent = "⏳";
          try {
            const res = await fetch(`${settings.siteUrl}/api/translate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: name, from: "ru", to: "zh" }),
            });
            const data = await res.json();
            const zhName = data.result || name;
            chrome.tabs.create({ url: `https://s.1688.com/selloffer/offer_search.html?keyword=${encodeURIComponent(zhName)}&sortType=6` });
            item.querySelector("span").textContent = "✅";
          } catch {
            item.querySelector("span").textContent = "📋";
            showToast("翻译失败，请手动搜索");
          }
        });
      });
    } catch (e) {
      document.getElementById("ozonResults").innerHTML = `<div style="color:#ef4444;font-size:12px;">抓取失败：${e.message}</div>`;
    }
    btn.disabled = false;
    btn.textContent = "📦 重新抓取";
  });
}

function extractOzonProducts() {
  try {
    const items = [];
    const seen = new Set();
    const links = document.querySelectorAll("a.tile-clickable-element, a[class*='tile-clickable']");
    for (const link of links) {
      if (items.length >= 20) break;
      const href = link.href.split("?")[0];
      if (!href || seen.has(href) || !href.includes("/product/")) continue;
      seen.add(href);
      const slug = href.match(/\/product\/([^/]+)-(\d+)\/?$/);
      const nameFromUrl = slug ? slug[1].replace(/-/g, " ") : "";
      const img = link.querySelector("img");
      const image = img?.src || "";
      const card = link.parentElement?.parentElement;
      const priceMatch = card?.innerText?.match(/(\d[\d\s]{1,5})\s*₽/);
      const price = priceMatch ? priceMatch[1].replace(/\s/g, "") : "";
      if (nameFromUrl.length > 5) items.push({ name: nameFromUrl, price, image, url: href });
    }
    return items;
  } catch { return []; }
}

// ─────────────────────────────────────────────────────────────
// 初始化
// ─────────────────────────────────────────────────────────────
async function init() {
  const settings = await loadSettings();
  // 每次打开插件都重新获取当前活跃tab（不缓存）
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || "";

  const is1688 = url.includes("1688.com");
  const is1688Product = is1688 && (url.includes("/offer/") || url.includes("detail.1688.com") || url.includes("offerId=") || url.includes("offer_id="));
  const isYiwugo = url.includes("yiwugo.com");
  const isYiwugoProduct = isYiwugo && (url.includes("/product/") || url.includes("/goods/") || url.includes("productId=") || url.match(/yiwugo\.com\/[^/]+\/\d+/));
  const isSourceProduct = is1688Product || isYiwugoProduct;
  const isOzon = url.includes("ozon.ru");

  // 显示登录状态 + 当前页面URL提示
  const headerUserEl = document.getElementById("headerUser");
  if (headerUserEl) {
    headerUserEl.textContent = settings.userEmail
      ? `👤 ${settings.userEmail.split("@")[0]}`
      : "未登录";
    headerUserEl.style.color = settings.apiToken ? "#4ade80" : "#fbbf24";
  }

  // 每次点tab都重新从当前页抓，不复用currentProduct
  document.getElementById("tabSearch").addEventListener("click", () => setTab("search", settings, tab.id, is1688));
  document.getElementById("tabImport").addEventListener("click", async () => {
    currentProduct = null; // 清空缓存，强制重新抓
    setTab("import", settings, tab.id, is1688Product);
  });
  document.getElementById("tabBatch").addEventListener("click", () => setTab("batch", settings, tab.id, false));
  document.getElementById("tabAccount").addEventListener("click", () => setTab("account", settings, tab.id, false));

  if (isOzon) { renderOzonPicker(tab.id, settings); return; }
  if (isSourceProduct) { setTab("import", settings, tab.id, true); }
  else { setTab("search", settings, tab.id, is1688 || isYiwugo); }
}

async function setTab(tab, settings, tabId, condition) {
  ["tabSearch","tabImport","tabBatch","tabAccount"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const active = id === `tab${tab.charAt(0).toUpperCase()}${tab.slice(1)}`;
    el.style.background = active ? "#2563eb" : "#f1f5f9";
    el.style.color = active ? "white" : "#64748b";
  });

  if (tab === "search") {
    renderSearch(settings, tabId, condition);
  } else if (tab === "batch") {
    renderBatchImport(settings);
  } else if (tab === "account") {
    renderLogin(settings);
  } else {
    if (!condition) { renderManualInput(settings, ""); return; }
    try {
      // 第一步：点击「商品详情」tab
      await chrome.scripting.executeScript({ target: { tabId }, func: () => {
        const tabs = document.querySelectorAll("[class*='tab'] a, [class*='tab'] li, [role='tab'], .tab-item, button, span, a");
        for (const el of tabs) {
          const t = el.textContent?.trim();
          if (t === "商品详情" || t === "产品详情" || t === "详情") { el.click(); break; }
        }
      }});
      await new Promise(r => setTimeout(r, 800));

      // 第二步：地毯式深度滚动（先慢速滚到底唤醒详情区，再回顶）
      await chrome.scripting.executeScript({ target: { tabId }, func: () => {
        return new Promise(resolve => {
          const total = document.body.scrollHeight;
          const steps = 12;
          let i = 0;
          const timer = setInterval(() => {
            window.scrollTo(0, (total / steps) * i);
            i++;
            if (i > steps) {
              clearInterval(timer);
              // 滚到中部停留（确保详情容器进入viewport）
              window.scrollTo(0, total * 0.6);
              setTimeout(() => { window.scrollTo(0, 0); resolve(); }, 1000);
            }
          }, 350);
        });
      }});
      await new Promise(r => setTimeout(r, 1500)); // 等详情图异步加载

      // 第二步补充：对所有iframe也执行滚动，触发iframe内部懒加载
      await chrome.scripting.executeScript({ target: { tabId, allFrames: true }, func: () => {
        return new Promise(resolve => {
          const total = document.body.scrollHeight || document.documentElement.scrollHeight;
          if (total < 200) { resolve(); return; }
          let i = 0, steps = 6;
          const t = setInterval(() => {
            window.scrollTo(0, (total / steps) * i);
            i++;
            if (i > steps) { clearInterval(t); resolve(); }
          }, 200);
        });
      }});
      await new Promise(r => setTimeout(r, 2000)); // 等iframe内图片加载完

      // 第三步：扫全部img标签，稳定版
      let grabbedImages = [];
      let grabbedDetailImages = [];
      try {
        const imgResults = await chrome.scripting.executeScript({
          target: { tabId, allFrames: true },
          func: () => {
            const host = location.hostname;

            // 义乌购抓取
            if (host.includes("yiwugo.com")) {
              const descContainer = document.getElementById("productDesc") || document.body;
              const imgs = descContainer.querySelectorAll("img");
              let yiwuResults = [];
              imgs.forEach(img => {
                let url = img.src;
                if (url && (url.includes("img.yiwugo.com") || url.includes("img1.yiwugo.com") || url.includes("img2.yiwugo.com"))) {
                  let cleanUrl = url.split("?")[0].replace(/(_\d+x\d+)/, "");
                  yiwuResults.push(cleanUrl);
                }
              });
              // 补扫全页（含主图缩略图列表）
              document.querySelectorAll("img").forEach(img => {
                if (img.src && img.src.includes("yiwugo.com") && !yiwuResults.includes(img.src.split("?")[0])) {
                  yiwuResults.push(img.src.split("?")[0].replace(/(_\d+x\d+)/, ""));
                }
              });
              return [...new Set(yiwuResults)].filter(u => u.length > 20);
            }

            // 1688抓取（默认）
            const rawText = document.documentElement.outerHTML;
            const regex = /https?:\/\/cbu01\.alicdn\.com\/img\/ibank\/[0-9a-zA-Z_!/-]+\.jpg/g;
            const matches = rawText.match(regex) || [];
            return [...new Set(matches)].map(url =>
              url.replace(/(_\d+x\d+.*\.jpg$)|(\.\d+x\d+.*\.jpg$)/i, "")
            );
          }
        });

        // 串行清洗：1.砍参数/webp 2.只留ibank 3.去重
        const allRaw = imgResults.flatMap(r => r.result || []).filter(Boolean);
        const finalUnique = [...new Set(allRaw)].filter(u =>
          u.includes("cbu01.alicdn.com/img/ibank/") || u.includes("yiwugo.com")
        );
        console.log("Crossly frames结果:", imgResults.map((r,i) => `frame${i}:${(r.result||[]).length}张`).join(", "), "→合并去重后:", finalUnique.length, "张");
        grabbedImages = finalUnique.slice(0, 10);
        grabbedDetailImages = finalUnique.slice(10, 25);
            } catch(e) {}

      // 第四步：抓标题、价格、规格等
      const res = await chrome.scripting.executeScript({ target: { tabId }, func: extractProductData });
      const product = res?.[0]?.result;
      if (product) {
        if (grabbedImages.length > 0) product.images = grabbedImages;
        if (grabbedDetailImages.length > 0) product.detailImages = grabbedDetailImages;
      }

      if (product && product.title) {
        currentProduct = product;
        renderProduct(product, settings);
      } else {
        renderManualInput(settings, "");
      }
    } catch { renderManualInput(settings, ""); }
  }
}

init();
