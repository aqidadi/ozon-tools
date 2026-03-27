// Crossly 装修助手 - 书签注入版
// 用法：创建书签，网址填 javascript:(function(){var s=document.createElement('script');s.src='https://www.crossly.cn/inject.js?t='+Date.now();document.head.appendChild(s);})()
(function() {
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
  function showToast(m) { toast.textContent = m; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }

  const SIZES = [
    { l: '小横幅 686×290', w: 686, h: 290 },
    { l: '大横幅 2832×600', w: 2832, h: 600 },
    { l: '头像 200×200', w: 200, h: 200 },
  ];
  const BANNERS = [
    { id: 'sale',    t: 'РАСПРОДАЖА! СКИДКИ ДО 50%',      s: 'Только сейчас · Товары из Китая',            e: '🔥', c1: '#dc2626', c2: '#ea580c' },
    { id: 'new',     t: 'НОВИНКИ УЖЕ В МАГАЗИНЕ',          s: 'Свежие поступления каждую неделю',           e: '🆕', c1: '#2563eb', c2: '#7c3aed' },
    { id: 'yiwu',    t: 'ПРЯМАЯ ПОСТАВКА ИЗ КИТАЯ',        s: '义乌 → Ваш склад · Быстро и надёжно',        e: '📦', c1: '#ff6b35', c2: '#9b3fcf' },
    { id: 'cheap',   t: 'ЛУЧШАЯ ЦЕНА ГАРАНТИРОВАНА',       s: 'Дешевле найдёшь — вернём разницу!',          e: '💰', c1: '#16a34a', c2: '#0891b2' },
    { id: 'quality', t: 'КАЧЕСТВО ПРОВЕРЕНО',               s: 'Каждый товар проходит контроль качества',    e: '✅', c1: '#0f766e', c2: '#0369a1' },
    { id: 'toy',     t: 'МЯГКИЕ ИГРУШКИ ИЗ КИТАЯ',         s: '★ Для детей и взрослых ★ Доставка 7–14 дней', e: '🧸', c1: '#ea4c89', c2: '#f59e0b' },
    { id: 'phone',   t: 'АКСЕССУАРЫ ДЛЯ ТЕЛЕФОНОВ',        s: '✓ Все модели ✓ Противоударные',              e: '📱', c1: '#1e40af', c2: '#3b82f6' },
    { id: 'home',    t: 'ТОВАРЫ ДЛЯ ДОМА',                  s: '✓ Удобно ✓ Красиво ✓ Недорого',             e: '🏠', c1: '#14532d', c2: '#22c55e' },
    { id: 'beauty',  t: 'КРАСОТА ИЗ КИТАЯ',                 s: '✦ Маникюр ✦ Уход ✦ Тренды сезона',          e: '💄', c1: '#6b21a8', c2: '#ec4899' },
    { id: 'gift',    t: 'ПОДАРКИ НА ЛЮБОЙ СЛУЧАЙ',          s: 'Упакуем и доставим прямо к двери',           e: '🎁', c1: '#be185d', c2: '#7c3aed' },
  ];

  let curBanner = BANNERS[2];
  let curSize = SIZES[0];

  const fab = document.createElement('button');
  fab.id = 'crossly-fab';
  fab.innerHTML = '📦';
  fab.title = 'Crossly 装修助手';
  document.body.appendChild(fab);

  const panel = document.createElement('div');
  panel.id = 'crossly-panel';
  panel.innerHTML = `
    <div class="cxh">
      <span style="font-size:22px">📦</span>
      <div style="flex:1">
        <div style="font-weight:800;font-size:13px">Crossly 一键装修</div>
        <div style="font-size:10px;opacity:.75">消灭红色错误 · 图库10张 · 一键下载</div>
      </div>
      <span id="cx-cls" style="cursor:pointer;font-size:18px;opacity:.7">✕</span>
    </div>
    <div class="cxb">
      <div class="cx-tip" style="background:#fff7ed;color:#92400e;font-weight:600;">
        🚨 「类目」下拉报红色错误？点下面橙色按钮自动搞定！
      </div>
      <button class="cxbtn" id="cx-autofill" style="background:linear-gradient(135deg,#ff6b35,#ea580c);color:white;font-size:13px;padding:12px;">
        🚀 一键消灭红色错误（自动选类目）
      </button>
      <div style="font-size:10px;color:#94a3b8;margin-bottom:8px;">↑ 点这个！自动点开「类目」下拉选第一项，红色报错消失</div>

      <div class="cxsec">📸 选横幅图（点一张 → 选尺寸 → 下载 → 上传Ozon）</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px;">
        ${BANNERS.map(b => `<button class="cxbtn" style="background:#f1f5f9;color:#374151;padding:6px 8px;font-size:10px;text-align:center;margin-bottom:0;" data-bid="${b.id}">${b.e} ${b.t.slice(0, 10)}...</button>`).join('')}
      </div>

      <div class="cxsec">选尺寸（你的槽位选「小横幅 686×290」）</div>
      <div style="display:flex;gap:4px;margin-bottom:6px;">
        ${SIZES.map((s, i) => `<button class="cxbtn" style="flex:1;background:#f1f5f9;color:#374151;font-size:9px;padding:5px 2px;text-align:center;margin-bottom:0;" data-sidx="${i}">${s.l}</button>`).join('')}
      </div>

      <canvas id="cx-canvas" style="width:100%;border-radius:8px;margin-bottom:4px;display:none;"></canvas>
      <div id="cx-sizeinfo" style="font-size:10px;color:#64748b;margin-bottom:6px;display:none;"></div>

      <button class="cxbtn" id="cx-dl" style="background:linear-gradient(135deg,#ff6b35,#ea4c89);color:white;display:none;">
        ⬇️ 下载JPEG（≤500Kb，直接上传Ozon）
      </button>
      <div id="cx-dl-tip" style="font-size:10px;color:#64748b;margin-bottom:6px;display:none;">↑ 下载后去Ozon点「请上传图片」手动选文件</div>
      <button class="cxbtn" id="cx-inject" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;display:none;">
        ⚡ 自动注入上传框（先点Ozon上传区再点这里）
      </button>

      <div id="cx-txt-wrap" style="display:none;margin-top:6px;">
        <div class="cxsec">📝 俄语广告语（点击复制→粘贴到Ozon横幅文字框）</div>
        <div id="cx-txt" style="cursor:pointer;background:#f0f4ff;border:1.5px dashed #6366f1;border-radius:8px;padding:8px;font-size:11px;font-weight:600;color:#1e2d5a;line-height:1.6;margin-bottom:3px;white-space:pre-line;"></div>
        <div style="font-size:10px;color:#94a3b8;">↑ 点击自动复制，粘到Ozon「文字」框（该字段选填）</div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  fab.addEventListener('click', () => panel.classList.toggle('open'));
  document.getElementById('cx-cls').addEventListener('click', () => panel.classList.remove('open'));

  function draw(banner, size) {
    const canvas = document.getElementById('cx-canvas');
    canvas.style.display = 'block';
    canvas.width = size.w; canvas.height = size.h;
    const ctx = canvas.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, size.w, size.h);
    g.addColorStop(0, banner.c1); g.addColorStop(1, banner.c2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, size.w, size.h);
    ctx.globalAlpha = .1; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(size.w * .07, size.h * .5, size.h * .7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(size.w * .93, size.h * .5, size.h * .6, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    const sc = size.h / 290;
    ctx.font = `${Math.round(110 * sc)}px serif`; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.88)';
    ctx.fillText(banner.e, size.w - size.h * .42, size.h * .72);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
    let fs = Math.round(46 * sc);
    ctx.font = `900 ${fs}px "Arial Black",Arial,sans-serif`;
    while (ctx.measureText(banner.t).width > size.w * .72 && fs > 12) { fs -= 2; ctx.font = `900 ${fs}px "Arial Black",Arial,sans-serif`; }
    ctx.fillText(banner.t, size.h * .15, size.h * .5);
    ctx.font = `${Math.round(20 * sc)}px Arial`; ctx.globalAlpha = .82;
    ctx.fillText(banner.s, size.h * .15, size.h * .74); ctx.globalAlpha = 1;
    ctx.font = `bold ${Math.round(13 * sc)}px Arial`; ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.textAlign = 'right';
    ctx.fillText('crossly.cn', size.w - 10, size.h - 8);
    document.getElementById('cx-dl').style.display = 'block';
    document.getElementById('cx-dl-tip').style.display = 'block';
    document.getElementById('cx-inject').style.display = 'block';
    document.getElementById('cx-sizeinfo').style.display = 'block';
    const kb = Math.round(canvas.toDataURL('image/jpeg', .85).length * 3 / 4 / 1024);
    document.getElementById('cx-sizeinfo').textContent = `📐 ${size.w}×${size.h} px | 约${kb}Kb ${kb > 500 ? '⚠️超限，下载时自动降质' : '✅符合规格'}`;
    document.getElementById('cx-txt-wrap').style.display = 'block';
    document.getElementById('cx-txt').textContent = banner.t + '\n' + banner.s;
    document.getElementById('cx-txt').dataset.text = banner.t + ' ' + banner.s;
  }

  panel.addEventListener('click', e => {
    const bb = e.target.closest('[data-bid]');
    if (bb) { curBanner = BANNERS.find(b => b.id === bb.dataset.bid) || curBanner; draw(curBanner, curSize); showToast('✅ 已选：' + curBanner.e + ' ' + curBanner.t.slice(0, 15) + '...'); return; }
    const sb = e.target.closest('[data-sidx]');
    if (sb) { curSize = SIZES[+sb.dataset.sidx]; draw(curBanner, curSize); return; }
  });

  document.getElementById('cx-dl').addEventListener('click', () => {
    const canvas = document.getElementById('cx-canvas');
    let q = .88, d = canvas.toDataURL('image/jpeg', q);
    while (d.length * 3 / 4 > 500 * 1024 && q > .3) { q -= .05; d = canvas.toDataURL('image/jpeg', q); }
    const a = document.createElement('a'); a.href = d; a.download = `crossly-${curBanner.id}-${curSize.w}x${curSize.h}.jpg`; a.click();
    showToast(`✅ 下载 ${curSize.w}×${curSize.h} JPEG！`);
  });

  document.getElementById('cx-inject').addEventListener('click', () => {
    const canvas = document.getElementById('cx-canvas');
    const fi = document.querySelector('input[type="file"]');
    if (!fi) { showToast('❌ 请先点Ozon「请上传图片」区域，再点这里'); return; }
    let q = .88, d = canvas.toDataURL('image/jpeg', q);
    while (d.length * 3 / 4 > 500 * 1024 && q > .3) { q -= .05; d = canvas.toDataURL('image/jpeg', q); }
    fetch(d).then(r => r.blob()).then(blob => {
      const f = new File([blob], `crossly-${curBanner.id}.jpg`, { type: 'image/jpeg' });
      const dt = new DataTransfer(); dt.items.add(f); fi.files = dt.files;
      fi.dispatchEvent(new Event('change', { bubbles: true }));
      fi.dispatchEvent(new Event('input', { bubbles: true }));
      showToast('✅ 图片已注入上传框！');
    });
  });

  document.getElementById('cx-txt').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('cx-txt').dataset.text || '').then(() => showToast('✅ 文案已复制！'));
  });

  document.getElementById('cx-autofill').addEventListener('click', () => {
    showToast('⏳ 扫描类目下拉框...');
    let found = false;

    // 先选尺寸 S
    [...document.querySelectorAll('button,div,span')].forEach(el => {
      if (el.textContent?.trim() === 'S' && el.offsetParent) el.click();
    });

    // 找「类目」标签旁边的触发器
    [...document.querySelectorAll('*')].forEach(el => {
      if (found) return;
      const t = el.childNodes.length === 1 ? el.textContent?.trim() : '';
      if (t === '类目' || t === 'Категория' || t === 'Все категории') {
        let trigger = el.parentElement;
        for (let i = 0; i < 6 && trigger; i++) {
          const cls = trigger.className || '';
          if (trigger.getAttribute('role') === 'combobox' || cls.includes('select') || cls.includes('input') || cls.includes('field') || cls.includes('dropdown')) {
            trigger.click();
            found = true;
            setTimeout(() => {
              const opts = [...document.querySelectorAll('li,[role="option"],[class*="item"],[class*="option"]')]
                .filter(o => o.offsetParent && o.textContent.trim().length > 0 && o.textContent.trim().length < 60
                  && !o.textContent.includes('类目') && !o.textContent.includes('Категория'));
              if (opts.length > 0) {
                opts[0].click();
                setTimeout(() => showToast('✅ 类目已自动选好！红色报错消失了'), 300);
              } else {
                // 下拉已打开，找更宽泛的选项
                const allOpts = [...document.querySelectorAll('li,[role="option"]')]
                  .filter(o => o.offsetParent && o.textContent.trim().length > 0);
                if (allOpts.length > 0) { allOpts[0].click(); showToast('✅ 已选第一个类目'); }
                else showToast('⚠️ 下拉已打开，请手动点选一个类目');
              }
            }, 700);
            break;
          }
          trigger = trigger.parentElement;
        }
      }
    });

    if (!found) showToast('⚠️ 未找到类目框，请手动点开「类目」下拉选一项');
  });

  // 默认加载义乌直发图
  draw(curBanner, curSize);
  showToast('✅ Crossly装修面板启动！右下角📦按钮点开');
})();
