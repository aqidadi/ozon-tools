// Crossly content script
// 在页面加载完成后扫描商品数据，存到window供popup读取

function scanProductData() {
  const data = { images: [], price: 0, title: "" };

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

  // 如果preview-img没找到，找所有750px以上的图
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

  // 价格：找页面上¥符号后跟的数字，过滤掉<1和>9999，取最小合理值
  // 排除运费相关文字
  const bodyText = document.body.innerText;
  const pricePattern = /(?<![克千百万\d])[\¥￥]\s*(\d+(?:\.\d{1,2})?)(?!\s*(?:\/克|\/kg|元\/|起批|起订|运费|包邮|每克))/g;
  const prices = [];
  let m;
  while ((m = pricePattern.exec(bodyText)) !== null) {
    const n = parseFloat(m[1]);
    if (n >= 1 && n <= 9999) prices.push(n);
  }
  // 1688通常：最高频出现的价格 或 第一个出现的>=5的价格
  if (prices.length > 0) {
    // 找>=1且出现最多次的
    const freq = {};
    prices.forEach(p => { freq[p] = (freq[p] || 0) + 1; });
    // 取出现>=2次的最小价格
    const repeated = prices.filter(p => freq[p] >= 2);
    if (repeated.length > 0) {
      data.price = Math.min(...repeated);
    } else {
      // 取第一个>=1的价格
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
    // 重新扫描最新状态
    scanProductData();
    sendResponse(window.__crosslyData || {});
  }
  return true;
});
