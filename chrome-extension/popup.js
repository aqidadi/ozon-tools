// Crossly 全能管家 popup.js v1.9.5
const SITE_DEFAULT = "https://www.crossly.cn";

function $(id) { return document.getElementById(id); }

function showToast(msg, ms = 2500) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
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

// ── 向导 Tab ─────────────────────────────────────
$("btn-open-crossly").addEventListener("click", async () => {
  const { siteUrl } = await chrome.storage.local.get("siteUrl");
  chrome.tabs.create({ url: siteUrl || SITE_DEFAULT });
});
$("btn-open-guide").addEventListener("click", () => {
  chrome.tabs.create({ url: SITE_DEFAULT + "/?tab=guide" });
});

// 检测是否在 Ozon 后台，有则显示装修启动按钮
(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url?.includes("seller.ozon.ru")) {
    $("ozon-launcher").style.display = "block";
  }
})();

$("btn-launch-decorator").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.includes("seller.ozon.ru")) {
    showToast("❌ 请先打开 Ozon 后台页面");
    return;
  }
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => typeof window.crosslyLaunch === "function" ? window.crosslyLaunch() : "not_loaded",
    });
    if (result?.result === "not_loaded") {
      showToast("❌ 请刷新 Ozon 页面后再试");
    } else if (result?.result === false) {
      showToast("❌ 请在 Ozon 后台页面使用");
    } else {
      showToast("✅ 装修助手已启动！看右下角📦按钮");
      window.close();
    }
  } catch (e) {
    showToast("❌ 启动失败，请刷新页面重试");
  }
});

// ── 采集 Tab ─────────────────────────────────────
async function initCollectTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || "";
  const statusEl = $("collect-status");
  const contentEl = $("collect-content");

  if (url.includes("yiwugo.com") || url.includes("1688.com")) {
    statusEl.textContent = "✅ 检测到商品页，点击采集";
    statusEl.style.background = "#d1fae5";
    statusEl.style.color = "#065f46";
    contentEl.innerHTML = `
      <button class="btn btn-primary" id="btn-scrape">🔍 采集当前页面商品</button>
      <div id="scrape-result" class="tip" style="display:none;margin-top:8px;"></div>
    `;
    $("btn-scrape").addEventListener("click", async () => {
      $("btn-scrape").textContent = "⏳ 采集中...";
      $("btn-scrape").disabled = true;
      try {
        const [result] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.__crosslyGetData ? window.__crosslyGetData() : null,
        });
        const data = result?.result;
        if (!data || !data.title) {
          $("scrape-result").style.display = "block";
          $("scrape-result").textContent = "❌ 未能采集到数据，请确保在商品详情页";
        } else {
          await chrome.storage.local.set({ lastProduct: data });
          $("scrape-result").style.display = "block";
          $("scrape-result").innerHTML = `
            ✅ 采集成功！<br>
            <strong>${data.title.slice(0,30)}...</strong><br>
            图片：${data.images?.length || 0} 张 | 价格：¥${data.price || "?"}
          `;
          showToast("✅ 商品已采集，去「刊登」Tab 发布");
        }
      } catch (e) {
        $("scrape-result").style.display = "block";
        $("scrape-result").textContent = "❌ 采集失败：" + e.message;
      }
      $("btn-scrape").textContent = "🔍 采集当前页面商品";
      $("btn-scrape").disabled = false;
    });
  } else if (url.includes("seller.ozon.ru")) {
    statusEl.textContent = "🏪 当前是 Ozon 后台——右下角「📦」按钮已注入";
    statusEl.style.background = "#fef3c7";
    statusEl.style.color = "#92400e";
    contentEl.innerHTML = `<div class="tip">在 Ozon 商店设计页点右下角「📦」按钮，可以一键装修店铺。</div>`;
  } else {
    statusEl.textContent = "ℹ️ 请打开义乌购或1688商品页";
    statusEl.style.background = "#f0f4ff";
    statusEl.style.color = "#3730a3";
    contentEl.innerHTML = `
      <button class="btn btn-blue" id="btn-open-yiwugo">🛒 打开义乌购</button>
    `;
    $("btn-open-yiwugo").addEventListener("click", () => {
      chrome.tabs.create({ url: "https://www.yiwugo.com" });
    });
  }
}

// ── 刊登 Tab ─────────────────────────────────────
async function initPublishTab() {
  const { ozonClientId, ozonApiKey, lastProduct, siteUrl } = await chrome.storage.local.get(
    ["ozonClientId", "ozonApiKey", "lastProduct", "siteUrl"]
  );
  const site = siteUrl || SITE_DEFAULT;

  const statusEl = $("ozon-status");
  if (ozonClientId && ozonApiKey) {
    statusEl.textContent = `✅ Ozon 账号已配置 (ID: ${ozonClientId})`;
    statusEl.className = "status-ok";
  } else {
    statusEl.textContent = "⚠️ 未配置 Ozon Key，请先去「账号」Tab 填写";
    statusEl.className = "status-err";
  }

  const productEl = $("publish-product");
  if (lastProduct?.title) {
    productEl.innerHTML = `
      <strong>${lastProduct.title.slice(0, 40)}...</strong><br>
      价格：¥${lastProduct.price || "?"} | 图片：${lastProduct.images?.length || 0} 张
    `;
  } else {
    productEl.textContent = "暂无已采集商品，请先在采集页抓取";
  }

  $("btn-publish").addEventListener("click", async () => {
    if (!ozonClientId || !ozonApiKey) {
      showToast("❌ 请先配置 Ozon 账号");
      return;
    }
    if (!lastProduct?.title) {
      showToast("❌ 请先采集商品");
      return;
    }
    $("btn-publish").textContent = "⏳ 刊登中...";
    $("btn-publish").disabled = true;
    try {
      // 先缓存图片
      let images = lastProduct.images?.filter(u => u.startsWith("https://")) || [];
      if (images.length > 0) {
        try {
          const cacheRes = await fetch(`${site}/api/img-cache`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls: images.slice(0, 10) }),
          });
          const cacheData = await cacheRes.json();
          if (cacheData.images?.length > 0) images = cacheData.images;
        } catch {}
      }

      // 刊登
      const resp = await fetch(`${site}/api/ozon/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: { ...lastProduct, images },
          ozonClientId,
          ozonApiKey,
        }),
      });
      const data = await resp.json();
      if (data.taskId || data.success) {
        showToast("✅ 刊登成功！去 Ozon 后台查看");
        productEl.innerHTML += `<br><span style="color:#16a34a;font-size:11px;">✅ 已刊登 task: ${data.taskId}</span>`;
      } else {
        showToast("❌ 刊登失败：" + (data.error || "未知错误"));
      }
    } catch (e) {
      showToast("❌ 网络错误：" + e.message);
    }
    $("btn-publish").textContent = "🚀 一键刊登到 Ozon";
    $("btn-publish").disabled = false;
  });
}

// ── 账号 Tab ─────────────────────────────────────
async function initAccountTab() {
  const { ozonClientId, ozonApiKey, siteUrl } = await chrome.storage.local.get(
    ["ozonClientId", "ozonApiKey", "siteUrl"]
  );
  if (ozonClientId) $("input-client-id").value = ozonClientId;
  if (ozonApiKey)   $("input-api-key").value   = ozonApiKey;
  if (siteUrl)      $("input-site").value       = siteUrl;

  $("btn-save-account").addEventListener("click", async () => {
    const clientId = $("input-client-id").value.trim();
    const apiKey   = $("input-api-key").value.trim();
    const site     = $("input-site").value.trim() || SITE_DEFAULT;

    await chrome.storage.local.set({
      ozonClientId: clientId,
      ozonApiKey: apiKey,
      siteUrl: site,
      // 同步到 localStorage key（供网站 BatchPublishPanel 读取）
    });

    // 同步写入当前页面 localStorage
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url?.includes("crossly.cn") || tab?.url?.includes("localhost")) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (cid, akey) => {
          localStorage.setItem("crossly_ozon_client_id", cid);
          localStorage.setItem("crossly_ozon_api_key", akey);
        },
        args: [clientId, apiKey],
      });
    }

    showToast("✅ 账号已保存！");
  });
}

// 初始化时检测页面
initCollectTab();
