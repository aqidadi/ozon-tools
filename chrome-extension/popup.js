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

  // 先试 content.js 的 crosslyLaunch
  try {
    const [r] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => typeof window.crosslyLaunch === "function" ? window.crosslyLaunch() : null,
    });
    if (r?.result) { showToast("✅ 装修助手已启动！"); window.close(); return; }
  } catch {}

  // 兜底：直接内联注入面板（绕过CSP）
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: crosslyInjectPanel,  // 内联函数，扩展注入不受CSP限制
    });
    showToast("✅ 装修助手启动中...看右下角📦");
    window.close();
  } catch (e) {
    showToast("❌ 失败：" + e.message);
  }
});

// 内联注入函数——整个面板逻辑都在这里，不依赖外部脚本
function crosslyInjectPanel() {
  document.getElementById('crossly-fab')?.remove();
  document.getElementById('crossly-panel')?.remove();
  document.getElementById('cx-style')?.remove();
  document.getElementById('cx-toast')?.remove();

  const style = document.createElement('style');
  style.id = 'cx-style';
  style.textContent = `
    #crossly-fab{position:fixed;bottom:80px;right:20px;z-index:999999;width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#ff6b35,#9b3fcf);box-shadow:0 4px 20px rgba(155,63,207,.5);cursor:pointer;border:none;font-size:24px;display:flex;align-items:center;justify-content:center;color:white;}
    #crossly-panel{position:fixed;bottom:148px;right:16px;z-index:999998;width:320px;background:white;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.2);display:none;font-family:-apple-system,'PingFang SC',sans-serif;overflow:hidden;}
    #crossly-panel.open{display:block;}
    .cxh{background:linear-gradient(135deg,#ff6b35,#9b3fcf);padding:12px 14px;display:flex;align-items:center;gap:8px;color:white;}
    .cxb{padding:12px;max-height:460px;overflow-y:auto;}
    .cxbtn{width:100%;padding:10px 12px;border-radius:10px;border:none;font-size:12px;font-weight:700;cursor:pointer;margin-bottom:7px;text-align:left;display:block;}
    .cx-tip{font-size:10px;color:#64748b;background:#f8fafc;border-radius:8px;padding:7px 9px;margin-bottom:7px;line-height:1.5;}
    .cxsec{font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:.8px;text-transform:uppercase;margin:8px 0 4px;}
    #cx-toast{position:fixed;bottom:155px;right:16px;z-index:9999999;background:#1a1a2e;color:white;font-size:12px;font-weight:600;padding:8px 14px;border-radius:10px;opacity:0;transition:opacity .3s;pointer-events:none;}
    #cx-toast.show{opacity:1;}
  `;
  document.head.appendChild(style);

  const toast = document.createElement('div');
  toast.id = 'cx-toast';
  document.body.appendChild(toast);
  function showT(m){toast.textContent=m;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2500);}

  const SIZES=[{l:'小横幅 686×290',w:686,h:290},{l:'大横幅 2832×600',w:2832,h:600},{l:'头像 200×200',w:200,h:200}];
  const BANNERS=[
    {id:'sale',t:'РАСПРОДАЖА! СКИДКИ ДО 50%',s:'Только сейчас · Товары из Китая',e:'🔥',c1:'#dc2626',c2:'#ea580c'},
    {id:'new',t:'НОВИНКИ УЖЕ В МАГАЗИНЕ',s:'Свежие поступления каждую неделю',e:'🆕',c1:'#2563eb',c2:'#7c3aed'},
    {id:'yiwu',t:'ПРЯМАЯ ПОСТАВКА ИЗ КИТАЯ',s:'义乌直发 · Быстро и надёжно',e:'📦',c1:'#ff6b35',c2:'#9b3fcf'},
    {id:'cheap',t:'ЛУЧШАЯ ЦЕНА ГАРАНТИРОВАНА',s:'Дешевле найдёшь — вернём разницу!',e:'💰',c1:'#16a34a',c2:'#0891b2'},
    {id:'quality',t:'КАЧЕСТВО ПРОВЕРЕНО',s:'Каждый товар проходит контроль',e:'✅',c1:'#0f766e',c2:'#0369a1'},
    {id:'toy',t:'МЯГКИЕ ИГРУШКИ ИЗ КИТАЯ',s:'★ Для детей и взрослых ★ Доставка 7–14 дней',e:'🧸',c1:'#ea4c89',c2:'#f59e0b'},
    {id:'phone',t:'АКСЕССУАРЫ ДЛЯ ТЕЛЕФОНОВ',s:'✓ Все модели ✓ Противоударные',e:'📱',c1:'#1e40af',c2:'#3b82f6'},
    {id:'home',t:'ТОВАРЫ ДЛЯ ДОМА',s:'✓ Удобно ✓ Красиво ✓ Недорого',e:'🏠',c1:'#14532d',c2:'#22c55e'},
    {id:'beauty',t:'КРАСОТА ИЗ КИТАЯ',s:'✦ Маникюр ✦ Уход ✦ Тренды сезона',e:'💄',c1:'#6b21a8',c2:'#ec4899'},
    {id:'gift',t:'ПОДАРКИ НА ЛЮБОЙ СЛУЧАЙ',s:'Упакуем и доставим прямо к двери',e:'🎁',c1:'#be185d',c2:'#7c3aed'},
  ];
  let curB=BANNERS[2], curS=SIZES[0];

  const fab=document.createElement('button');
  fab.id='crossly-fab'; fab.innerHTML='📦'; fab.title='Crossly装修助手';
  document.body.appendChild(fab);

  const panel=document.createElement('div');
  panel.id='crossly-panel';
  panel.innerHTML=`
    <div class="cxh">
      <span style="font-size:22px">📦</span>
      <div style="flex:1"><div style="font-weight:800;font-size:13px">Crossly 一键装修</div><div style="font-size:10px;opacity:.75">消灭红色错误·图库10张·一键下载</div></div>
      <span id="cx-cls" style="cursor:pointer;font-size:18px;opacity:.7">✕</span>
    </div>
    <div class="cxb">
      <div class="cx-tip" style="background:#fff7ed;color:#92400e;font-weight:600;">🚨 「类目」下拉报红色错误？点下面橙色按钮自动搞定！</div>
      <button class="cxbtn" id="cx-autofill" style="background:linear-gradient(135deg,#ff6b35,#ea580c);color:white;font-size:13px;padding:12px;">🚀 一键消灭红色错误（自动选类目）</button>
      <div style="font-size:10px;color:#94a3b8;margin-bottom:8px;">↑ 自动点开「类目」下拉选第一项，红色报错消失</div>
      <div class="cxsec">📸 选横幅图（点一张→选尺寸→下载→上传Ozon）</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px;">
        ${BANNERS.map(b=>`<button class="cxbtn" style="background:#f1f5f9;color:#374151;padding:6px 8px;font-size:10px;text-align:center;margin-bottom:0;" data-bid="${b.id}">${b.e} ${b.t.slice(0,10)}...</button>`).join('')}
      </div>
      <div class="cxsec">选尺寸（你的槽位选「小横幅 686×290」）</div>
      <div style="display:flex;gap:4px;margin-bottom:6px;">
        ${SIZES.map((s,i)=>`<button class="cxbtn" style="flex:1;background:#f1f5f9;color:#374151;font-size:9px;padding:5px 2px;text-align:center;margin-bottom:0;" data-sidx="${i}">${s.l}</button>`).join('')}
      </div>
      <canvas id="cx-canvas" style="width:100%;border-radius:8px;margin-bottom:4px;display:none;"></canvas>
      <div id="cx-sizeinfo" style="font-size:10px;color:#64748b;margin-bottom:6px;display:none;"></div>
      <button class="cxbtn" id="cx-dl" style="background:linear-gradient(135deg,#ff6b35,#ea4c89);color:white;display:none;">⬇️ 下载JPEG（≤500Kb，直接上传Ozon）</button>
      <div id="cx-dl-tip" style="font-size:10px;color:#64748b;margin-bottom:6px;display:none;">↑ 下载后去Ozon点「请上传图片」手动选文件</div>
      <button class="cxbtn" id="cx-inject" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;display:none;">⚡ 自动注入上传框（先点Ozon上传区再点这里）</button>
      <div id="cx-txt-wrap" style="display:none;margin-top:6px;">
        <div class="cxsec">📝 俄语广告语（点击复制→粘贴到Ozon横幅文字框）</div>
        <div id="cx-txt" style="cursor:pointer;background:#f0f4ff;border:1.5px dashed #6366f1;border-radius:8px;padding:8px;font-size:11px;font-weight:600;color:#1e2d5a;line-height:1.6;margin-bottom:3px;white-space:pre-line;"></div>
        <div style="font-size:10px;color:#94a3b8;">↑ 点击复制，粘到Ozon「文字」框（选填）</div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  fab.addEventListener('click',()=>panel.classList.toggle('open'));
  document.getElementById('cx-cls').addEventListener('click',()=>panel.classList.remove('open'));

  function draw(b,s){
    const c=document.getElementById('cx-canvas');
    c.style.display='block'; c.width=s.w; c.height=s.h;
    const ctx=c.getContext('2d');
    const g=ctx.createLinearGradient(0,0,s.w,s.h);
    g.addColorStop(0,b.c1); g.addColorStop(1,b.c2);
    ctx.fillStyle=g; ctx.fillRect(0,0,s.w,s.h);
    ctx.globalAlpha=.1; ctx.fillStyle='#fff';
    ctx.beginPath(); ctx.arc(s.w*.07,s.h*.5,s.h*.7,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(s.w*.93,s.h*.5,s.h*.6,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
    const sc=s.h/290;
    ctx.font=`${Math.round(110*sc)}px serif`; ctx.textAlign='center'; ctx.fillStyle='rgba(255,255,255,.88)';
    ctx.fillText(b.e,s.w-s.h*.42,s.h*.72);
    ctx.fillStyle='#fff'; ctx.textAlign='left';
    let fs=Math.round(46*sc); ctx.font=`900 ${fs}px "Arial Black",Arial,sans-serif`;
    while(ctx.measureText(b.t).width>s.w*.72&&fs>12){fs-=2;ctx.font=`900 ${fs}px "Arial Black",Arial,sans-serif`;}
    ctx.fillText(b.t,s.h*.15,s.h*.5);
    ctx.font=`${Math.round(20*sc)}px Arial`; ctx.globalAlpha=.82;
    ctx.fillText(b.s,s.h*.15,s.h*.74); ctx.globalAlpha=1;
    ctx.font=`bold ${Math.round(13*sc)}px Arial`; ctx.fillStyle='rgba(255,255,255,.4)'; ctx.textAlign='right';
    ctx.fillText('crossly.cn',s.w-10,s.h-8);
    document.getElementById('cx-dl').style.display='block';
    document.getElementById('cx-dl-tip').style.display='block';
    document.getElementById('cx-inject').style.display='block';
    document.getElementById('cx-sizeinfo').style.display='block';
    const kb=Math.round(c.toDataURL('image/jpeg',.85).length*3/4/1024);
    document.getElementById('cx-sizeinfo').textContent=`📐 ${s.w}×${s.h} px | 约${kb}Kb ${kb>500?'⚠️超限，下载自动降质':'✅符合规格'}`;
    document.getElementById('cx-txt-wrap').style.display='block';
    document.getElementById('cx-txt').textContent=b.t+'\n'+b.s;
    document.getElementById('cx-txt').dataset.text=b.t+' '+b.s;
  }

  panel.addEventListener('click',e=>{
    const bb=e.target.closest('[data-bid]');
    if(bb){curB=BANNERS.find(x=>x.id===bb.dataset.bid)||curB;draw(curB,curS);showT('✅ 已选：'+curB.e+' '+curB.t.slice(0,15)+'...');return;}
    const sb=e.target.closest('[data-sidx]');
    if(sb){curS=SIZES[+sb.dataset.sidx];draw(curB,curS);return;}
  });

  document.getElementById('cx-dl').addEventListener('click',()=>{
    const c=document.getElementById('cx-canvas');
    let q=.88,d=c.toDataURL('image/jpeg',q);
    while(d.length*3/4>500*1024&&q>.3){q-=.05;d=c.toDataURL('image/jpeg',q);}
    const a=document.createElement('a');a.href=d;a.download=`crossly-${curB.id}-${curS.w}x${curS.h}.jpg`;a.click();
    showT(`✅ 下载 ${curS.w}×${curS.h} JPEG！`);
  });

  document.getElementById('cx-inject').addEventListener('click',()=>{
    const c=document.getElementById('cx-canvas');
    const fi=document.querySelector('input[type="file"]');
    if(!fi){showT('❌ 请先点Ozon「请上传图片」区域再点这里');return;}
    let q=.88,d=c.toDataURL('image/jpeg',q);
    while(d.length*3/4>500*1024&&q>.3){q-=.05;d=c.toDataURL('image/jpeg',q);}
    fetch(d).then(r=>r.blob()).then(blob=>{
      const f=new File([blob],`crossly-${curB.id}.jpg`,{type:'image/jpeg'});
      const dt=new DataTransfer();dt.items.add(f);fi.files=dt.files;
      fi.dispatchEvent(new Event('change',{bubbles:true}));fi.dispatchEvent(new Event('input',{bubbles:true}));
      showT('✅ 图片已注入！');
    });
  });

  document.getElementById('cx-txt').addEventListener('click',()=>{
    navigator.clipboard.writeText(document.getElementById('cx-txt').dataset.text||'').then(()=>showT('✅ 文案已复制！'));
  });

  document.getElementById('cx-autofill').addEventListener('click',()=>{
    showT('⏳ 扫描类目下拉框...');
    let found=false;
    [...document.querySelectorAll('button,div,span')].forEach(el=>{if(el.textContent?.trim()==='S'&&el.offsetParent)el.click();});
    [...document.querySelectorAll('*')].forEach(el=>{
      if(found)return;
      const t=el.childNodes.length===1?el.textContent?.trim():'';
      if(t==='类目'||t==='Категория'||t==='Все категории'){
        let trigger=el.parentElement;
        for(let i=0;i<6&&trigger;i++){
          const cls=trigger.className||'';
          if(trigger.getAttribute('role')==='combobox'||cls.includes('select')||cls.includes('input')||cls.includes('field')||cls.includes('dropdown')){
            trigger.click(); found=true;
            setTimeout(()=>{
              const opts=[...document.querySelectorAll('li,[role="option"],[class*="item"],[class*="option"]')]
                .filter(o=>o.offsetParent&&o.textContent.trim().length>0&&o.textContent.trim().length<60&&!o.textContent.includes('类目')&&!o.textContent.includes('Категория'));
              if(opts.length>0){opts[0].click();setTimeout(()=>showT('✅ 类目已选！红色报错消失了'),300);}
              else{const all=[...document.querySelectorAll('li,[role="option"]')].filter(o=>o.offsetParent&&o.textContent.trim().length>0);if(all.length>0){all[0].click();showT('✅ 已选第一个类目');}else showT('⚠️ 下拉已打开，请手动点选一个类目');}
            },700);
            break;
          }
          trigger=trigger.parentElement;
        }
      }
    });
    if(!found)showT('⚠️ 未找到类目框，请手动点开「类目」下拉选一项');
  });

  draw(curB,curS);
  panel.classList.add('open');
  showT('✅ 装修助手已启动！');
}

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
          func: () => {
            if (window.__crosslyGetData) return window.__crosslyGetData();
            const data = { images: [], detailImages: [], price: 0, title: "", specs: {} };
            const h1 = document.querySelector("h1, .mod-detail-title, [class*='title'] h1");
            if (h1) data.title = h1.textContent.trim();
            const ogTitle = document.querySelector("meta[property='og:title']")?.content;
            if (ogTitle && ogTitle.length > data.title.length) data.title = ogTitle;
            const priceEl = document.querySelector("[class*='price-range'], [class*='price'] span, .price");
            if (priceEl) { const m = priceEl.textContent.match(/[\d.]+/); if (m) data.price = parseFloat(m[0]); }
            const seen = new Set();
            document.querySelectorAll("img").forEach(img => {
              [img.src, img.getAttribute("data-src"), img.getAttribute("data-lazy-src")].forEach(src => {
                if (src && src.includes("cbu01.alicdn.com") && !seen.has(src)) { seen.add(src); data.images.push(src); }
              });
            });
            const html = document.body.outerHTML;
            const matches = html.matchAll(/https?:\/\/cbu01\.alicdn\.com\/img\/ibank\/[^"'\s\\]+/g);
            for (const m of matches) { const u = m[0]; if (!seen.has(u)) { seen.add(u); data.images.push(u); } }
            document.querySelectorAll("tr").forEach(row => {
              const cells = row.querySelectorAll("td");
              if (cells.length >= 2) { const k = cells[0].textContent.trim(); const v = cells[1].textContent.trim(); if (k && v && k.length < 20) data.specs[k] = v; }
            });
            return data.title ? data : null;
          },
        });
        const data = result?.result;
        if (!data || !data.title) {
          $("scrape-result").style.display = "block";
          $("scrape-result").textContent = "❌ 未采集到数据，请进入商品详情页（不是搜索列表页）";
        } else {
          await chrome.storage.local.set({ lastProduct: data });
          $("scrape-result").style.display = "block";
          $("scrape-result").innerHTML = "✅ 采集成功！<br><strong>" + data.title.slice(0,35) + "...</strong><br>图片 " + (data.images?.length||0) + " 张 | 价格 ¥" + (data.price||"?") + "<br><span style='color:#16a34a;font-size:10px;'>→ 去「刊登」Tab 一键发到Ozon</span>";
          showToast("✅ 采集成功！去「🚀刊登」Tab 发布");
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
