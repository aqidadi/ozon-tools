// Crossly 全能管家 popup.js v2.0.7
const SITE_DEFAULT = "https://www.crossly.cn";

function $(id) { return document.getElementById(id); }
function showToast(msg, ms = 2500) {
  const t = $("toast"); t.textContent = msg; t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), ms);
}

// ── Tab 切换 ──────────────────────────────────────
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    $("panel-" + tab.dataset.tab).classList.add("active");
    if (tab.dataset.tab === "collect") initCollectTab();
    if (tab.dataset.tab === "publish") initPublishTab();
    if (tab.dataset.tab === "account") initAccountTab();
  });
});

// ── 全局状态 ─────────────────────────────────────
let _state = {};
async function loadState() {
  _state = await chrome.storage.local.get([
    "ozonClientId", "ozonApiKey", "siteUrl",
    "crosslyToken", "crosslyUser", "crosslyPro",
    "freeUsed", "freeResetDate", "lastProduct"
  ]);
  return _state;
}

function getSite() { return _state.siteUrl || SITE_DEFAULT; }
function isPro() { return !!_state.crosslyPro; }
function getFreeLeft() {
  const today = new Date().toDateString();
  if (_state.freeResetDate !== today) return 50; // 每月重置（用日期简化）
  return Math.max(0, 50 - (_state.freeUsed || 0));
}
async function useFreeQuota() {
  const today = new Date().toDateString();
  let used = _state.freeUsed || 0;
  if (_state.freeResetDate !== today) { used = 0; }
  used++;
  _state.freeUsed = used;
  _state.freeResetDate = today;
  await chrome.storage.local.set({ freeUsed: used, freeResetDate: today });
}

// ── 初始化 ───────────────────────────────────────
(async () => {
  await loadState();
  updateHeader();
  initGuideTab();
})();

function updateHeader() {
  const badge = $("user-badge");
  const quota = $("user-quota");
  if (_state.crosslyUser) {
    badge.textContent = isPro() ? "💪 会员" : _state.crosslyUser.slice(0, 8);
    if (isPro()) badge.classList.add("pro");
    quota.textContent = isPro() ? "无限采集+刊登+装修" : `免费剩余 ${getFreeLeft()} 次`;
  } else {
    badge.textContent = "未登录";
    quota.textContent = `免费采集剩余 ${getFreeLeft()} 次`;
  }
  badge.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => { if (t.dataset.tab === "account") { t.click(); initAccountTab(); } });
  });
}

// ── 向导 Tab ─────────────────────────────────────
async function initGuideTab() {
  $("btn-open-crossly").addEventListener("click", () => chrome.tabs.create({ url: getSite() }));
  $("btn-open-guide").addEventListener("click", () => chrome.tabs.create({ url: getSite() + "/?tab=guide" }));

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url?.includes("seller.ozon.ru")) {
    $("ozon-launcher").style.display = "block";
  }
  setupDecoratorBtn("btn-launch-decorator", tab);
}

async function setupDecoratorBtn(btnId, tab) {
  if (!$(btnId)) return;
  $(btnId).addEventListener("click", async () => {
    if (!tab?.url?.includes("seller.ozon.ru")) {
      showToast("❌ 请先打开 Ozon 后台商店设计页");
      return;
    }
    if (!isPro() && !_state.crosslyToken) {
      showToast("🔒 装修助手需要会员，去「我的」Tab 充电");
      return;
    }
    try {
      const [r] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => typeof window.crosslyLaunch === "function" ? window.crosslyLaunch() : null,
      });
      if (r?.result) { showToast("✅ 装修助手已启动！"); window.close(); return; }
    } catch {}
    // 内联注入
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: crosslyInjectPanel });
      showToast("✅ 装修助手启动！看右下角📦");
      window.close();
    } catch (e) { showToast("❌ " + e.message); }
  });
}

// ── 采集 Tab ─────────────────────────────────────
async function initCollectTab() {
  await loadState();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || "";
  const statusEl = $("collect-status");
  const contentEl = $("collect-content");

  if (url.includes("1688.com") || url.includes("yiwugo.com")) {
    const freeLeft = getFreeLeft();
    statusEl.textContent = "✅ 检测到商品页，可以采集";
    statusEl.className = "tip success";

    contentEl.innerHTML = `
      <div class="tip" style="margin-bottom:7px;">
        ${isPro() ? "💪 会员：无限采集" : `免费剩余 <strong>${freeLeft}</strong> 次（每月50次）`}
      </div>
      ${freeLeft <= 0 && !isPro() ? `<div class="lock-mask">🔒 本月免费次数用完 — <span style="text-decoration:underline;cursor:pointer;" id="goto-upgrade2">充电解锁无限</span></div>` : `<button class="btn btn-primary" id="btn-scrape">🔍 采集当前页面商品</button>`}
      <div id="scrape-result" class="tip" style="display:none;margin-top:7px;"></div>
    `;

    if ($("goto-upgrade2")) {
      $("goto-upgrade2").addEventListener("click", () => chrome.tabs.create({ url: getSite() }));
    }

    if ($("btn-scrape")) {
      $("btn-scrape").addEventListener("click", async () => {
        if (freeLeft <= 0 && !isPro()) { showToast("🔒 本月免费次数用完，去充电"); return; }
        $("btn-scrape").textContent = "⏳ 采集中...";
        $("btn-scrape").disabled = true;
        try {
          const [result] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              if (window.__crosslyGetData) return window.__crosslyGetData();
              const data = { images: [], detailImages: [], price: 0, title: "", specs: {} };
              const h1 = document.querySelector("h1, .mod-detail-title");
              if (h1) data.title = h1.textContent.trim();
              const ogTitle = document.querySelector("meta[property='og:title']")?.content;
              if (ogTitle && ogTitle.length > data.title.length) data.title = ogTitle;
              const priceEl = document.querySelector("[class*='price-range'], [class*='price'] span");
              if (priceEl) { const m = priceEl.textContent.match(/[\d.]+/); if (m) data.price = parseFloat(m[0]); }
              const seen = new Set();
              document.querySelectorAll("img").forEach(img => {
                [img.src, img.getAttribute("data-src")].forEach(src => {
                  if (src && src.includes("cbu01.alicdn.com") && !seen.has(src)) { seen.add(src); data.images.push(src); }
                });
              });
              const matches = document.body.outerHTML.matchAll(/https?:\/\/cbu01\.alicdn\.com\/img\/ibank\/[^"'\s\\]+/g);
              for (const m of matches) { if (!seen.has(m[0])) { seen.add(m[0]); data.images.push(m[0]); } }
              document.querySelectorAll("tr").forEach(row => {
                const cells = row.querySelectorAll("td");
                if (cells.length >= 2) { const k = cells[0].textContent.trim(); const v = cells[1].textContent.trim(); if (k && v && k.length < 20) data.specs[k] = v; }
              });
              return data.title ? data : null;
            },
          });

          const data = result?.result;
          if (!data?.title) {
            $("scrape-result").style.display = "block";
            $("scrape-result").className = "tip error";
            $("scrape-result").textContent = "❌ 未采集到数据，请进入商品详情页（不是搜索列表）";
          } else {
            await useFreeQuota();
            await chrome.storage.local.set({ lastProduct: data });
            updateHeader();

            $("scrape-result").style.display = "block";
            $("scrape-result").className = "tip";
            $("scrape-result").style.background = "white";
            $("scrape-result").style.border = "1px solid #e2e8f0";
            $("scrape-result").innerHTML = `
              <div style="color:#16a34a;font-weight:700;margin-bottom:5px;">✅ 采集成功！</div>
              <div style="font-size:10px;color:#94a3b8;margin-bottom:2px;">📝 中文标题</div>
              <div style="font-size:11px;background:#f8fafc;border-radius:6px;padding:6px;margin-bottom:6px;line-height:1.5;">${data.title}</div>
              <div style="font-size:10px;color:#94a3b8;margin-bottom:2px;">🇷🇺 俄文标题 <span id="ru-status" style="color:#f59e0b;">翻译中...</span></div>
              <div id="title-ru" style="font-size:11px;background:#f0f4ff;border:1.5px dashed #6366f1;border-radius:6px;padding:6px;margin-bottom:6px;line-height:1.5;cursor:pointer;min-height:28px;">-</div>
              <div style="display:flex;gap:5px;margin-bottom:5px;">
                <button id="btn-copy-zh" style="flex:1;padding:5px;border:none;border-radius:6px;background:#f1f5f9;font-size:10px;font-weight:700;cursor:pointer;">📋 复制中文</button>
                <button id="btn-copy-ru" style="flex:1;padding:5px;border:none;border-radius:6px;background:#e0e7ff;font-size:10px;font-weight:700;cursor:pointer;">📋 复制俄文</button>
              </div>
              <div style="font-size:10px;color:#94a3b8;">图片 ${data.images?.length||0} 张 | ¥${data.price||"?"} | <span style="color:#ff6b35;font-weight:600;">→ 去「刊登」Tab 发Ozon</span></div>
            `;

            $("btn-copy-zh").addEventListener("click", () => {
              navigator.clipboard.writeText(data.title).then(() => showToast("✅ 中文标题已复制"));
            });
            const copyRu = () => {
              const ru = $("title-ru").textContent;
              if (ru && ru !== "-") navigator.clipboard.writeText(ru).then(() => showToast("✅ 俄文标题已复制"));
            };
            $("title-ru").addEventListener("click", copyRu);
            $("btn-copy-ru").addEventListener("click", copyRu);

            // 自动翻译
            try {
              const resp = await fetch(getSite() + "/api/faq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: "把下面中文商品标题翻译成俄语，直接输出俄语，不超过100字符，不要解释：" + data.title }),
              });
              const json = await resp.json();
              const ruTitle = (json.answer || "").trim();
              if (ruTitle) {
                $("title-ru").textContent = ruTitle;
                $("ru-status").textContent = "✅ 点击复制";
                $("ru-status").style.color = "#16a34a";
                await chrome.storage.local.set({ lastProduct: { ...data, titleRu: ruTitle } });
              } else {
                $("ru-status").textContent = "❌ 翻译失败";
                $("ru-status").style.color = "#dc2626";
              }
            } catch {
              $("ru-status").textContent = "❌ 网络错误";
              $("ru-status").style.color = "#dc2626";
            }
          }
        } catch (e) {
          $("scrape-result").style.display = "block";
          $("scrape-result").className = "tip error";
          $("scrape-result").textContent = "❌ " + e.message;
        }
        $("btn-scrape").textContent = "🔍 采集当前页面商品";
        $("btn-scrape").disabled = false;
      });
    }

  } else if (url.includes("seller.ozon.ru")) {
    statusEl.textContent = "🏪 当前在 Ozon 后台";
    statusEl.className = "tip warn";
    contentEl.innerHTML = `<div class="tip">采集需在1688/义乌购商品详情页使用<br>在 Ozon 装修请点「向导」Tab 的「启动装修助手」</div>
      <button class="btn btn-blue" id="btn-goto-1688">打开1688 →</button>`;
    $("btn-goto-1688").addEventListener("click", () => chrome.tabs.create({ url: "https://www.1688.com" }));

  } else {
    statusEl.textContent = "ℹ️ 请打开1688或义乌购商品页";
    statusEl.className = "tip";
    contentEl.innerHTML = `
      <button class="btn btn-orange" id="btn-goto-1688b">🔍 打开1688</button>
      <button class="btn btn-blue" id="btn-goto-yiwugo">🛒 打开义乌购</button>
      <div class="sec">热门关键词（点击搜索）</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;">
        ${["毛绒玩具","棉花娃娃","盲盒","动漫摆件","积木","宠物玩具","磁吸支架","发夹"].map(k=>`<button style="padding:4px 8px;border:none;border-radius:12px;background:#f1f5f9;font-size:10px;cursor:pointer;" data-kw="${k}">${k}</button>`).join("")}
      </div>
    `;
    $("btn-goto-1688b").addEventListener("click", () => chrome.tabs.create({ url: "https://www.1688.com" }));
    $("btn-goto-yiwugo").addEventListener("click", () => chrome.tabs.create({ url: "https://www.yiwugo.com" }));
    contentEl.querySelectorAll("[data-kw]").forEach(btn => {
      btn.addEventListener("click", () => chrome.tabs.create({ url: "https://s.1688.com/selloffer/offer_search.htm?keywords=" + encodeURIComponent(btn.dataset.kw) }));
    });
  }
}

// ── 刊登 Tab ─────────────────────────────────────
async function initPublishTab() {
  await loadState();
  const statusEl = $("ozon-key-status");
  if (_state.ozonClientId && _state.ozonApiKey) {
    statusEl.textContent = `✅ Ozon 账号已配置 (ID: ${_state.ozonClientId})`;
    statusEl.className = "st-ok";
  } else {
    statusEl.textContent = "⚠️ 未配置 Ozon Key，去「我的」Tab 填写";
    statusEl.className = "st-err";
  }

  const productEl = $("publish-product");
  if (_state.lastProduct?.title) {
    productEl.innerHTML = `<strong>${_state.lastProduct.title.slice(0, 35)}...</strong><br>¥${_state.lastProduct.price||"?"} | 图片 ${_state.lastProduct.images?.length||0} 张`;
  }

  // 会员锁
  if (!isPro() && !_state.crosslyToken) {
    $("publish-lock").style.display = "flex";
    $("btn-publish").disabled = true;
    $("btn-publish").style.opacity = "0.4";
    $("goto-upgrade").addEventListener("click", () => chrome.tabs.create({ url: getSite() }));
  }

  $("btn-publish").addEventListener("click", async () => {
    if (!_state.ozonClientId || !_state.ozonApiKey) { showToast("❌ 请先配置 Ozon 账号"); return; }
    if (!_state.lastProduct?.title) { showToast("❌ 请先采集商品"); return; }
    $("btn-publish").textContent = "⏳ 刊登中...";
    $("btn-publish").disabled = true;
    try {
      let images = _state.lastProduct.images?.filter(u => u.startsWith("https://")) || [];
      if (images.length > 0) {
        try {
          const cr = await fetch(getSite() + "/api/img-cache", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ urls: images.slice(0, 10) }) });
          const cd = await cr.json();
          if (cd.images?.length > 0) images = cd.images;
        } catch {}
      }
      const resp = await fetch(getSite() + "/api/ozon/publish", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: { ..._state.lastProduct, images }, ozonClientId: _state.ozonClientId, ozonApiKey: _state.ozonApiKey }),
      });
      const data = await resp.json();
      if (data.taskId || data.success) {
        showToast("✅ 刊登成功！去 Ozon 后台查看");
        $("publish-product").innerHTML += `<br><span style="color:#16a34a;font-size:10px;">✅ 已刊登 task: ${data.taskId}</span>`;
      } else {
        showToast("❌ " + (data.error || "刊登失败"));
      }
    } catch (e) { showToast("❌ " + e.message); }
    $("btn-publish").textContent = "🚀 一键刊登到 Ozon";
    $("btn-publish").disabled = false;
  });
}

// ── 工具 Tab ─────────────────────────────────────
(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  $("btn-open-ozon").addEventListener("click", () => chrome.tabs.create({ url: "https://seller.ozon.ru" }));

  $("btn-translate").addEventListener("click", async () => {
    const text = $("translate-input").value.trim();
    if (!text) { showToast("❌ 请先输入要翻译的文字"); return; }
    $("btn-translate").textContent = "⏳ 翻译中...";
    $("btn-translate").disabled = true;
    try {
      const resp = await fetch(getSite() + "/api/faq", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "把下面文字翻译成俄语，直接输出俄语，不要解释：" + text }),
      });
      const json = await resp.json();
      $("translate-result").style.display = "block";
      $("translate-result").innerHTML = `<strong>俄语：</strong><br>${json.answer||"翻译失败"}<br><button onclick="navigator.clipboard.writeText('${(json.answer||"").replace(/'/g,"\\'")}').then(()=>{})" style="margin-top:5px;padding:3px 8px;border:none;border-radius:6px;background:#e0e7ff;font-size:10px;cursor:pointer;">📋 复制</button>`;
    } catch { $("translate-result").style.display = "block"; $("translate-result").textContent = "❌ 翻译失败"; }
    $("btn-translate").textContent = "🤖 AI翻译成俄语";
    $("btn-translate").disabled = false;
  });

  if ($("btn-launch-decorator2")) setupDecoratorBtn("btn-launch-decorator2", tab);
})();

// ── 我的 Tab ─────────────────────────────────────
const SUPABASE_URL = "https://kovjebkuvfhbijiqtdjt.supabase.co";
const SUPABASE_ANON = "sb_publishable_i9a7VUriUM_HmMehiOh4nw_qnjO-Sfk";

async function supabaseAuth(email, password, isSignup) {
  const endpoint = isSignup
    ? `${SUPABASE_URL}/auth/v1/signup`
    : `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON },
    body: JSON.stringify({ email, password }),
  });
  return resp.json();
}

async function initAccountTab() {
  await loadState();
  const panel = $("panel-account");

  if (_state.crosslyUser) {
    // 已登录状态
    panel.innerHTML = `
      <div class="tip success" style="margin-bottom:8px;">✅ 已登录：${_state.crosslyUser}</div>
      <div class="tip" style="margin-bottom:8px;">${isPro() ? "💪 <strong>会员</strong>：无限采集+刊登+装修" : "免费版：每月50次采集，升级解锁全功能"}</div>
      ${!isPro() ? `<button class="btn btn-gold" id="btn-upgrade2">🔋 给Crossly充电（解锁会员）</button>` : ""}
      <hr class="divider">
      <div class="sec">Ozon 卖家账号 <span style="font-size:9px;background:#fef3c7;color:#92400e;border-radius:10px;padding:1px 6px;">刊登必填</span></div>
      <input class="input" id="input-client-id" placeholder="Client-Id（数字，如：4301277）" />
      <input class="input" id="input-api-key" placeholder="Api-Key（uuid格式）" />
      <button class="btn btn-green" id="btn-save-ozon">✅ 保存 Ozon 账号</button>
      <hr class="divider">
      <button class="btn btn-blue" id="btn-refresh-pro">🔄 刷新会员状态</button>
      <button class="btn btn-gray" id="btn-logout">退出登录</button>
      <div class="tip" style="font-size:10px;margin-top:4px;">🔒 账号信息只存本地，不上传服务器</div>
    `;
    if (!isPro() && $("btn-upgrade2")) {
      $("btn-upgrade2").addEventListener("click", () => chrome.tabs.create({ url: getSite() + "/?upgrade=1" }));
    }
    if (_state.ozonClientId) $("input-client-id").value = _state.ozonClientId;
    if (_state.ozonApiKey) $("input-api-key").value = _state.ozonApiKey;
    $("btn-save-ozon").addEventListener("click", async () => {
      const cid = $("input-client-id").value.trim();
      const akey = $("input-api-key").value.trim();
      await chrome.storage.local.set({ ozonClientId: cid, ozonApiKey: akey });
      _state.ozonClientId = cid; _state.ozonApiKey = akey;
      showToast("✅ Ozon 账号已保存！");
    });
    $("btn-refresh-pro").addEventListener("click", async () => {
      $("btn-refresh-pro").textContent = "⏳ 查询中...";
      $("btn-refresh-pro").disabled = true;
      try {
        const { crosslyUserId, crosslyToken } = await chrome.storage.local.get(["crosslyUserId","crosslyToken"]);
        const resp = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?id=eq.${crosslyUserId}&select=plan,quota`,
          { headers: { "apikey": SUPABASE_ANON, "Authorization": `Bearer ${crosslyToken}` } }
        );
        const profiles = await resp.json();
        const isPro = profiles?.[0]?.plan === "pro";
        await chrome.storage.local.set({ crosslyPro: isPro });
        _state.crosslyPro = isPro;
        updateHeader();
        showToast(isPro ? "✅ 会员状态已确认！" : "ℹ️ 当前是免费版，充电升级会员");
        setTimeout(() => initAccountTab(), 300);
      } catch (e) {
        showToast("❌ 查询失败：" + e.message);
      }
      $("btn-refresh-pro").textContent = "🔄 刷新会员状态";
      $("btn-refresh-pro").disabled = false;
    });

    $("btn-logout").addEventListener("click", async () => {
      await chrome.storage.local.remove(["crosslyToken", "crosslyUser", "crosslyPro"]);
      showToast("已退出");
      setTimeout(() => { initAccountTab(); updateHeader(); }, 300);
    });

  } else {
    // 未登录：内嵌登录表单
    let isSignup = false;
    panel.innerHTML = `
      <div class="tip warn" style="margin-bottom:8px;">🔑 登录后解锁无限采集+刊登+装修助手</div>
      <div style="display:flex;gap:0;margin-bottom:10px;border-radius:8px;overflow:hidden;border:1.5px solid #e2e8f0;">
        <button id="tab-login-btn" style="flex:1;padding:8px;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:700;font-size:12px;cursor:pointer;">登录</button>
        <button id="tab-signup-btn" style="flex:1;padding:8px;border:none;background:#f1f5f9;color:#64748b;font-weight:700;font-size:12px;cursor:pointer;">注册</button>
      </div>
      <input class="input" id="auth-email" type="email" placeholder="邮箱地址" autocomplete="email" />
      <input class="input" id="auth-password" type="password" placeholder="密码（6位以上）" autocomplete="current-password" />
      <button class="btn btn-primary" id="btn-auth-submit">🔑 登录</button>
      <div id="auth-error" style="display:none;font-size:11px;color:#dc2626;background:#fee2e2;border-radius:6px;padding:6px 8px;margin-bottom:6px;"></div>
      <hr class="divider">
      <div class="sec">Ozon 卖家账号 <span style="font-size:9px;background:#fef3c7;color:#92400e;border-radius:10px;padding:1px 6px;">刊登必填</span></div>
      <input class="input" id="input-client-id" placeholder="Client-Id（数字，如：4301277）" />
      <input class="input" id="input-api-key" placeholder="Api-Key（uuid格式）" />
      <button class="btn btn-green" id="btn-save-ozon">✅ 保存 Ozon 账号</button>
      <div class="tip" style="font-size:10px;margin-top:4px;">🔒 账号信息只存本地，不上传服务器</div>
    `;

    if (_state.ozonClientId) $("input-client-id").value = _state.ozonClientId;
    if (_state.ozonApiKey) $("input-api-key").value = _state.ozonApiKey;

    // 切换登录/注册
    $("tab-login-btn").addEventListener("click", () => {
      isSignup = false;
      $("tab-login-btn").style.background = "linear-gradient(135deg,#6366f1,#8b5cf6)";
      $("tab-login-btn").style.color = "white";
      $("tab-signup-btn").style.background = "#f1f5f9";
      $("tab-signup-btn").style.color = "#64748b";
      $("btn-auth-submit").textContent = "🔑 登录";
    });
    $("tab-signup-btn").addEventListener("click", () => {
      isSignup = true;
      $("tab-signup-btn").style.background = "linear-gradient(135deg,#6366f1,#8b5cf6)";
      $("tab-signup-btn").style.color = "white";
      $("tab-login-btn").style.background = "#f1f5f9";
      $("tab-login-btn").style.color = "#64748b";
      $("btn-auth-submit").textContent = "📝 注册账号";
    });

    $("btn-auth-submit").addEventListener("click", async () => {
      const email = $("auth-email").value.trim();
      const password = $("auth-password").value.trim();
      if (!email || !password) { showToast("❌ 请填写邮箱和密码"); return; }
      $("btn-auth-submit").textContent = "⏳ 处理中...";
      $("btn-auth-submit").disabled = true;
      $("auth-error").style.display = "none";
      try {
        const data = await supabaseAuth(email, password, isSignup);
        if (data.access_token) {
          const user = data.user?.email || email;
          const userId = data.user?.id;

          // 查询会员状态
          let isPro = false;
          try {
            const profileResp = await fetch(
              `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=plan,quota`,
              { headers: { "apikey": SUPABASE_ANON, "Authorization": `Bearer ${data.access_token}` } }
            );
            const profiles = await profileResp.json();
            if (profiles?.[0]?.plan === "pro") isPro = true;
          } catch {}

          await chrome.storage.local.set({
            crosslyToken: data.access_token,
            crosslyUser: user,
            crosslyUserId: userId,
            crosslyPro: isPro,
          });
          _state.crosslyToken = data.access_token;
          _state.crosslyUser = user;
          _state.crosslyPro = isPro;
          showToast("✅ " + (isSignup ? "注册成功！" : "登录成功！") + (isPro ? " 💪 会员已激活" : ""));
          updateHeader();
          setTimeout(() => initAccountTab(), 300);
        } else {
          const msg = data.error_description || data.msg || data.message || (isSignup ? "注册失败，邮箱可能已注册" : "邮箱或密码错误");
          $("auth-error").style.display = "block";
          $("auth-error").textContent = "❌ " + msg;
        }
      } catch (e) {
        $("auth-error").style.display = "block";
        $("auth-error").textContent = "❌ 网络错误：" + e.message;
      }
      $("btn-auth-submit").textContent = isSignup ? "📝 注册账号" : "🔑 登录";
      $("btn-auth-submit").disabled = false;
    });

    // 回车提交
    [$("auth-email"), $("auth-password")].forEach(el => {
      el.addEventListener("keydown", e => { if (e.key === "Enter") $("btn-auth-submit").click(); });
    });

    $("btn-save-ozon").addEventListener("click", async () => {
      const cid = $("input-client-id").value.trim();
      const akey = $("input-api-key").value.trim();
      await chrome.storage.local.set({ ozonClientId: cid, ozonApiKey: akey });
      showToast("✅ Ozon 账号已保存！");
    });
  }
}

// 初始化
initCollectTab();

// ── 内联装修面板（绕过CSP）────────────────────────
function crosslyInjectPanel() {
  document.getElementById('crossly-fab')?.remove();
  document.getElementById('crossly-panel')?.remove();
  document.getElementById('cx-style')?.remove();
  document.getElementById('cx-toast')?.remove();
  const style=document.createElement('style');style.id='cx-style';
  style.textContent=`#crossly-fab{position:fixed;bottom:80px;right:20px;z-index:999999;width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#ff6b35,#9b3fcf);box-shadow:0 4px 20px rgba(155,63,207,.5);cursor:pointer;border:none;font-size:24px;display:flex;align-items:center;justify-content:center;color:white;}#crossly-panel{position:fixed;bottom:148px;right:16px;z-index:999998;width:320px;background:white;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.2);display:none;font-family:-apple-system,'PingFang SC',sans-serif;overflow:hidden;}#crossly-panel.open{display:block;}.cxh{background:linear-gradient(135deg,#ff6b35,#9b3fcf);padding:12px 14px;display:flex;align-items:center;gap:8px;color:white;}.cxb{padding:12px;max-height:460px;overflow-y:auto;}.cxbtn{width:100%;padding:10px 12px;border-radius:10px;border:none;font-size:12px;font-weight:700;cursor:pointer;margin-bottom:7px;text-align:left;display:block;}.cx-tip{font-size:10px;color:#64748b;background:#f8fafc;border-radius:8px;padding:7px 9px;margin-bottom:7px;line-height:1.5;}.cxsec{font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:.8px;text-transform:uppercase;margin:8px 0 4px;}#cx-toast{position:fixed;bottom:155px;right:16px;z-index:9999999;background:#1a1a2e;color:white;font-size:12px;font-weight:600;padding:8px 14px;border-radius:10px;opacity:0;transition:opacity .3s;pointer-events:none;}#cx-toast.show{opacity:1;}`;
  document.head.appendChild(style);
  const toast=document.createElement('div');toast.id='cx-toast';document.body.appendChild(toast);
  function showT(m){toast.textContent=m;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2500);}
  const SIZES=[{l:'小横幅 686×290',w:686,h:290},{l:'大横幅 2832×600',w:2832,h:600},{l:'头像 200×200',w:200,h:200}];
  const BANNERS=[{id:'sale',t:'РАСПРОДАЖА! СКИДКИ ДО 50%',s:'Только сейчас · Товары из Китая',e:'🔥',c1:'#dc2626',c2:'#ea580c'},{id:'new',t:'НОВИНКИ УЖЕ В МАГАЗИНЕ',s:'Свежие поступления каждую неделю',e:'🆕',c1:'#2563eb',c2:'#7c3aed'},{id:'yiwu',t:'ПРЯМАЯ ПОСТАВКА ИЗ КИТАЯ',s:'义乌直发 · Быстро и надёжно',e:'📦',c1:'#ff6b35',c2:'#9b3fcf'},{id:'cheap',t:'ЛУЧШАЯ ЦЕНА ГАРАНТИРОВАНА',s:'Дешевле найдёшь — вернём разницу!',e:'💰',c1:'#16a34a',c2:'#0891b2'},{id:'quality',t:'КАЧЕСТВО ПРОВЕРЕНО',s:'Каждый товар проходит контроль',e:'✅',c1:'#0f766e',c2:'#0369a1'},{id:'toy',t:'МЯГКИЕ ИГРУШКИ ИЗ КИТАЯ',s:'★ Для детей и взрослых ★',e:'🧸',c1:'#ea4c89',c2:'#f59e0b'},{id:'phone',t:'АКСЕССУАРЫ ДЛЯ ТЕЛЕФОНОВ',s:'✓ Все модели ✓ Противоударные',e:'📱',c1:'#1e40af',c2:'#3b82f6'},{id:'home',t:'ТОВАРЫ ДЛЯ ДОМА',s:'✓ Удобно ✓ Красиво ✓ Недорого',e:'🏠',c1:'#14532d',c2:'#22c55e'},{id:'beauty',t:'КРАСОТА ИЗ КИТАЯ',s:'✦ Маникюр ✦ Уход ✦ Тренды',e:'💄',c1:'#6b21a8',c2:'#ec4899'},{id:'gift',t:'ПОДАРКИ НА ЛЮБОЙ СЛУЧАЙ',s:'Упакуем и доставим к двери',e:'🎁',c1:'#be185d',c2:'#7c3aed'}];
  let curB=BANNERS[2],curS=SIZES[0];
  const fab=document.createElement('button');fab.id='crossly-fab';fab.innerHTML='📦';document.body.appendChild(fab);
  const panel=document.createElement('div');panel.id='crossly-panel';
  panel.innerHTML=`<div class="cxh"><span style="font-size:22px">📦</span><div style="flex:1"><div style="font-weight:800;font-size:13px">Crossly 一键装修</div><div style="font-size:10px;opacity:.75">消灭红色错误·图库10张·一键下载</div></div><span id="cx-cls" style="cursor:pointer;font-size:18px;opacity:.7">✕</span></div><div class="cxb"><div class="cx-tip" style="background:#fff7ed;color:#92400e;font-weight:600;">🚨 「类目」下拉报红色错误？点下面橙色按钮！</div><button class="cxbtn" id="cx-autofill" style="background:linear-gradient(135deg,#ff6b35,#ea580c);color:white;font-size:13px;padding:12px;">🚀 一键消灭红色错误（自动选类目）</button><div style="font-size:10px;color:#94a3b8;margin-bottom:8px;">↑ 自动点开「类目」下拉选第一项</div><div class="cxsec">📸 选横幅图（点一张→选尺寸→下载→上传）</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px;">${BANNERS.map(b=>`<button class="cxbtn" style="background:#f1f5f9;color:#374151;padding:6px 8px;font-size:10px;text-align:center;margin-bottom:0;" data-bid="${b.id}">${b.e} ${b.t.slice(0,10)}...</button>`).join('')}</div><div class="cxsec">选尺寸（你的槽位选「小横幅 686×290」）</div><div style="display:flex;gap:4px;margin-bottom:6px;">${SIZES.map((s,i)=>`<button class="cxbtn" style="flex:1;background:#f1f5f9;color:#374151;font-size:9px;padding:5px 2px;text-align:center;margin-bottom:0;" data-sidx="${i}">${s.l}</button>`).join('')}</div><canvas id="cx-canvas" style="width:100%;border-radius:8px;margin-bottom:4px;display:none;"></canvas><div id="cx-sizeinfo" style="font-size:10px;color:#64748b;margin-bottom:6px;display:none;"></div><button class="cxbtn" id="cx-dl" style="background:linear-gradient(135deg,#ff6b35,#ea4c89);color:white;display:none;">⬇️ 下载JPEG（≤500Kb，直接上传Ozon）</button><button class="cxbtn" id="cx-inject" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;display:none;">⚡ 自动注入（先点Ozon上传区再点这里）</button><div id="cx-txt-wrap" style="display:none;margin-top:6px;"><div class="cxsec">📝 俄语广告语（点复制→粘到Ozon文字框）</div><div id="cx-txt" style="cursor:pointer;background:#f0f4ff;border:1.5px dashed #6366f1;border-radius:8px;padding:8px;font-size:11px;font-weight:600;color:#1e2d5a;line-height:1.6;margin-bottom:3px;white-space:pre-line;"></div></div></div>`;
  document.body.appendChild(panel);
  fab.addEventListener('click',()=>panel.classList.toggle('open'));
  document.getElementById('cx-cls').addEventListener('click',()=>panel.classList.remove('open'));
  function draw(b,s){const c=document.getElementById('cx-canvas');c.style.display='block';c.width=s.w;c.height=s.h;const ctx=c.getContext('2d');const g=ctx.createLinearGradient(0,0,s.w,s.h);g.addColorStop(0,b.c1);g.addColorStop(1,b.c2);ctx.fillStyle=g;ctx.fillRect(0,0,s.w,s.h);ctx.globalAlpha=.1;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.w*.07,s.h*.5,s.h*.7,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(s.w*.93,s.h*.5,s.h*.6,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;const sc=s.h/290;ctx.font=`${Math.round(110*sc)}px serif`;ctx.textAlign='center';ctx.fillStyle='rgba(255,255,255,.88)';ctx.fillText(b.e,s.w-s.h*.42,s.h*.72);ctx.fillStyle='#fff';ctx.textAlign='left';let fs=Math.round(46*sc);ctx.font=`900 ${fs}px "Arial Black",Arial,sans-serif`;while(ctx.measureText(b.t).width>s.w*.72&&fs>12){fs-=2;ctx.font=`900 ${fs}px "Arial Black",Arial,sans-serif`;}ctx.fillText(b.t,s.h*.15,s.h*.5);ctx.font=`${Math.round(20*sc)}px Arial`;ctx.globalAlpha=.82;ctx.fillText(b.s,s.h*.15,s.h*.74);ctx.globalAlpha=1;ctx.font=`bold ${Math.round(13*sc)}px Arial`;ctx.fillStyle='rgba(255,255,255,.4)';ctx.textAlign='right';ctx.fillText('crossly.cn',s.w-10,s.h-8);document.getElementById('cx-dl').style.display='block';document.getElementById('cx-inject').style.display='block';document.getElementById('cx-sizeinfo').style.display='block';const kb=Math.round(c.toDataURL('image/jpeg',.85).length*3/4/1024);document.getElementById('cx-sizeinfo').textContent=`📐 ${s.w}×${s.h} | 约${kb}Kb ${kb>500?'⚠️超限，下载自动降质':'✅符合规格'}`;document.getElementById('cx-txt-wrap').style.display='block';document.getElementById('cx-txt').textContent=b.t+'\n'+b.s;document.getElementById('cx-txt').dataset.text=b.t+' '+b.s;}
  panel.addEventListener('click',e=>{const bb=e.target.closest('[data-bid]');if(bb){curB=BANNERS.find(x=>x.id===bb.dataset.bid)||curB;draw(curB,curS);showT('✅ 已选：'+curB.e+' '+curB.t.slice(0,15)+'...');return;}const sb=e.target.closest('[data-sidx]');if(sb){curS=SIZES[+sb.dataset.sidx];draw(curB,curS);return;}});
  document.getElementById('cx-dl').addEventListener('click',()=>{const c=document.getElementById('cx-canvas');let q=.88,d=c.toDataURL('image/jpeg',q);while(d.length*3/4>500*1024&&q>.3){q-=.05;d=c.toDataURL('image/jpeg',q);}const a=document.createElement('a');a.href=d;a.download=`crossly-${curB.id}-${curS.w}x${curS.h}.jpg`;a.click();showT(`✅ 下载${curS.w}×${curS.h}！`);});
  document.getElementById('cx-inject').addEventListener('click',()=>{const c=document.getElementById('cx-canvas');const fi=document.querySelector('input[type="file"]');if(!fi){showT('❌ 请先点Ozon「请上传图片」再点这里');return;}let q=.88,d=c.toDataURL('image/jpeg',q);while(d.length*3/4>500*1024&&q>.3){q-=.05;d=c.toDataURL('image/jpeg',q);}fetch(d).then(r=>r.blob()).then(blob=>{const f=new File([blob],`crossly-${curB.id}.jpg`,{type:'image/jpeg'});const dt=new DataTransfer();dt.items.add(f);fi.files=dt.files;fi.dispatchEvent(new Event('change',{bubbles:true}));fi.dispatchEvent(new Event('input',{bubbles:true}));showT('✅ 已注入！');});});
  document.getElementById('cx-txt').addEventListener('click',()=>{navigator.clipboard.writeText(document.getElementById('cx-txt').dataset.text||'').then(()=>showT('✅ 文案已复制！'));});
  document.getElementById('cx-autofill').addEventListener('click',()=>{showT('⏳ 扫描...');let found=false;[...document.querySelectorAll('button,div,span')].forEach(el=>{if(el.textContent?.trim()==='S'&&el.offsetParent)el.click();});[...document.querySelectorAll('*')].forEach(el=>{if(found)return;const t=el.childNodes.length===1?el.textContent?.trim():'';if(t==='类目'||t==='Категория'){let trigger=el.parentElement;for(let i=0;i<6&&trigger;i++){const cls=trigger.className||'';if(trigger.getAttribute('role')==='combobox'||cls.includes('select')||cls.includes('input')||cls.includes('field')){trigger.click();found=true;setTimeout(()=>{const opts=[...document.querySelectorAll('li,[role="option"],[class*="item"]')].filter(o=>o.offsetParent&&o.textContent.trim().length>0&&o.textContent.trim().length<60&&!o.textContent.includes('类目'));if(opts.length>0){opts[0].click();setTimeout(()=>showT('✅ 类目已选！'),300);}else showT('⚠️ 下拉已打开，请手动选一项');},700);break;}trigger=trigger.parentElement;}}});if(!found)showT('⚠️ 未找到类目框，请手动点「类目」下拉');});
  draw(curB,curS);panel.classList.add('open');showT('✅ 装修助手已启动！');
}
