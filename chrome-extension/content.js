// Crossly content script - 拦截1688接口获取商品数据
(function() {
  // 存储拦截到的商品数据
  let capturedData = {
    images: [],
    price: 0,
    title: "",
    skuProps: [],
  };

  // 拦截 XHR
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    return origOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function() {
    this.addEventListener("load", function() {
      try {
        const url = this._url || "";
        // 拦截1688商品详情接口
        if (url.includes("mtop.alibaba.detail") || 
            url.includes("item.detail") ||
            url.includes("offer.detail") ||
            url.includes("1688.com/product")) {
          const json = JSON.parse(this.responseText);
          parseOfferData(json);
        }
      } catch(e) {}
    });
    return origSend.apply(this, arguments);
  };

  // 拦截 fetch
  const origFetch = window.fetch;
  window.fetch = function(input, init) {
    return origFetch.apply(this, arguments).then(res => {
      const url = typeof input === "string" ? input : (input.url || "");
      if (url.includes("mtop.alibaba.detail") || 
          url.includes("item.detail") ||
          url.includes("offer.detail")) {
        res.clone().json().then(json => {
          parseOfferData(json);
        }).catch(() => {});
      }
      return res;
    });
  };

  function parseOfferData(json) {
    try {
      // 尝试各种1688接口结构
      const data = json?.data || json?.result || json;
      
      // 图片
      const imgs = data?.images || data?.mainImages || 
                   data?.item?.images || data?.offerDetail?.images ||
                   data?.detail?.images || [];
      if (Array.isArray(imgs) && imgs.length > 0) {
        capturedData.images = imgs.map(img => {
          const url = typeof img === "string" ? img : (img.url || img.src || "");
          return url.startsWith("//") ? "https:" + url : url;
        }).filter(Boolean);
      }

      // 价格
      const price = data?.price || data?.saleInfo?.priceInfo?.price ||
                    data?.item?.price || data?.tradeInfo?.price;
      if (price) capturedData.price = parseFloat(String(price).replace(/[^\d.]/g, ""));
      
      // 标题
      const title = data?.subject || data?.title || data?.item?.title;
      if (title) capturedData.title = title;

    } catch(e) {}
  }

  // 暴露给popup.js调用
  window.__crosslyGetData = function() {
    return capturedData;
  };
})();
