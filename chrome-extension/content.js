// Crossly content script
// 在页面加载完成后扫描商品数据，存到window供popup读取

function scanProductData() {
  const data = { images: [], detailImages: [], price: 0, title: "", specs: {} };

  // 标题
  const h1 = document.querySelector("h1");
  if (h1) data.title = h1.textContent.trim();
  const ogTitle = document.querySelector("meta[property='og:title']")?.content;
  if (ogTitle && ogTitle.length > data.title.length) data.title = ogTitle;

  // 主图：直接取所有 img.preview-img 的 src
  const previewImgs = document.querySelectorAll("img.preview-img, img.active-preview-img");
  previewImgs.forEach(img => {
    const src = img.src || img.getAttribute("data-src") || "";
    if (src && src.startsWith("http") && !data.images.includes(src)) {
      data.images.push(src);
    }
  });

  // 如果preview-img没找到，找所有400px以上的图
  if (data.images.length === 0) {
    document.querySelectorAll("img").forEach(img => {
      if (img.naturalWidth >= 400) {
        const src = img.src || "";
        if (src && src.startsWith("http") && !data.images.includes(src)) {
          data.images.push(src);
        }
      }
    });
  }

  // 详情图：1688 详情区的大图
  // 选择器覆盖常见的 1688 详情图容器
  const detailSelectors = [
    ".desc-img-list img",
    ".detail-desc img",
    ".mod-detail-main img",
    ".desc-module img",
    "#description img",
    ".offer-detail-main img",
    '[class*="detail"] img',
    '[class*="desc"] img',
  ];
  const detailSeen = new Set(data.images); // 避免和主图重复
  for (const sel of detailSelectors) {
    document.querySelectorAll(sel).forEach(img => {
      let src = img.getAttribute("data-src") || img.src || "";
      if (src && src.startsWith("http") && !detailSeen.has(src) && img.naturalWidth >= 100) {
        detailSeen.add(src);
        data.detailImages.push(src);
      }
    });
    if (data.detailImages.length >= 20) break;
  }

  // 规格参数
  try {
    const specRows = document.querySelectorAll(".sku-item, .attribute-item, .spec-item, [class*='prop-item']");
    specRows.forEach(row => {
      const label = row.querySelector(".name, .label, .key")?.textContent?.trim();
      const value = row.querySelector(".value, .val, .content")?.textContent?.trim();
      if (label && value) data.specs[label] = value;
    });
  } catch {}

  // 价格：找页面上¥符号后跟的数字，过滤掉<1和>9999，取最小合理值
  const bodyText = document.body.innerText;
  const pricePattern = /(?<![克千百万\d])[\¥￥]\s*(\d+(?:\.\d{1,2})?)(?!\s*(?:\/克|\/kg|元\/|起批|起订|运费|包邮|每克))/g;
  const prices = [];
  let mm;
  while ((mm = pricePattern.exec(bodyText)) !== null) {
    const n = parseFloat(mm[1]);
    if (n >= 1 && n <= 9999) prices.push(n);
  }
  if (prices.length > 0) {
    const freq = {};
    prices.forEach(p => { freq[p] = (freq[p] || 0) + 1; });
    const repeated = prices.filter(p => freq[p] >= 2);
    if (repeated.length > 0) {
      data.price = Math.min(...repeated);
    } else {
      data.price = prices[0];
    }
  }

  window.__crosslyData = data;
}

// 页面加载完立即扫一次
if (document.readyState === "complete") {
  scanProductData();
} else {
  window.addEventListener("load", scanProductData);
}

// 3秒后再扫一次（等懒加载）
setTimeout(scanProductData, 3000);

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_PRODUCT_DATA") {
    scanProductData();
    sendResponse(window.__crosslyData || {});
  }
  return true;
});
