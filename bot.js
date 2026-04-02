(function () {
  // ── Detect Discord host from current page URL ──
  const host = window.location.hostname; // e.g. "ptb.discord.com" or "discord.com"
  const BASE = `https://${host}/api/v9/gorilla/activity`;

  const SUPER_PROPS = 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRGlzY29yZCBDbGllbnQiLCJyZWxlYXNlX2NoYW5uZWwiOiJwdGIiLCJjbGllbnRfdmVyc2lvbiI6IjEuMC4xMTg2Iiwib3NfdmVyc2lvbiI6IjEwLjAuMTkwNDUiLCJvc19hcmNoIjoieDY0IiwiYXBwX2FyY2giOiJ4NjQiLCJzeXN0ZW1fbG9jYWxlIjoicnUiLCJoYXNfY2xpZW50X21vZHMiOmZhbHNlLCJjbGllbnRfbGF1bmNoX2lkIjoiMWFlZmEzNzgtY2VlZi00Mjg3LTk3MmItNGNhZjI4MzVkMTE1IiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgZGlzY29yZC8xLjAuMTE4NiBDaHJvbWUvMTM4LjAuNzIwNC4yNTEgRWxlY3Ryb24vMzcuNi4wIFNhZmFyaS81MzcuMzYiLCJicm93c2VyX3ZlcnNpb24iOiIzNy42LjAiLCJvc19zZGtfdmVyc2lvbiI6IjE5MDQ1IiwiY2xpZW50X2J1aWxkX251bWJlciI6NTIxNDQ3LCJuYXRpdmVfYnVpbGRfbnVtYmVyIjo3ODQ4OCwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbCwibGF1bmNoX3NpZ25hdHVyZSI6ImVmMjQ0ZWVhLWI3OGEtNDIyZS04ZDU0LTJmYmI4NmQ4MTRjOSIsImNsaWVudF9oZWFydGJlYXRfc2Vzc2lvbl9pZCI6IjhiNWY0ZDM2LTIxMjYtNGE1OS1hYzlhLTU0OTNjMzVhODJmNSIsImNsaWVudF9hcHBfc3RhdGUiOiJmb2N1c2VkIn0=';

  // ── Extract token from webpack (works on both discord.com and ptb.discord.com) ──
  function extractToken() {
    try {
      const chunks = [], key = '_lm_' + Date.now();
      webpackChunkdiscord_app.push([[key], {}, e => { for (let k in e.c) chunks.push(e.c[k]); }]);
      for (const m of chunks) {
        try {
          const t = m?.exports?.default?.getToken?.();
          if (typeof t === 'string' && t.length > 20) return t;
        } catch (_) {}
      }
    } catch (_) {}
    return null;
  }

  const autoToken = extractToken();

  const jitter    = ms => ms + Math.round((Math.random() - 0.5) * ms * 0.3);
  const sleep     = ms => new Promise(r => setTimeout(r, ms));
  const COOLDOWNS = { gathering: 1500,   crafting: 150000, combat: 180000 };
  const DELAYS    = { gathering: 1500,   crafting: 2500,   combat: 2500   };
  const state     = { gathering: false,  crafting: false,  combat: false  };
  const running   = { gathering: false,  crafting: false,  combat: false  };
  const logLines  = [];

  const log = msg => {
    logLines.unshift(new Date().toLocaleTimeString('en') + '  ' + msg);
    if (logLines.length > 10) logLines.length = 10;
    const el = document.getElementById('lm-log');
    if (el) el.textContent = logLines.join('\n');
  };

  const getToken = () => (document.getElementById('lm-token')?.value || '').trim();

  async function doActivity(type) {
    const tok = getToken();
    if (!tok) { log('⚠️  No token provided'); return; }
    const h = {
      'Authorization':      tok,
      'Content-Type':       'application/json',
      'x-super-properties': SUPER_PROPS,
      'x-discord-locale':   'ru',
      'x-discord-timezone': 'Asia/Krasnoyarsk',
      'x-debug-options':    'bugReporterEnabled',
    };
    try {
      const r1 = await fetch(`${BASE}/${type}/start`, { method: 'POST', headers: h });
      log(`🔄 [${type}] start → ${r1.status}`);
      await sleep(jitter(DELAYS[type]));
      const r2   = await fetch(`${BASE}/${type}/complete`, { method: 'POST', headers: h });
      const data = await r2.json().catch(() => ({}));
      const gains = data?.changes
        ? ' · ' + Object.entries(data.changes).map(([k, v]) => `+${v} ${k}`).join(', ')
        : '';
      log(`✅ [${type}] done → ${r2.status}${gains}`);
    } catch (e) { log(`❌ [${type}] ${e.message}`); }
  }

  function startLoop(type) {
    if (running[type]) return;
    running[type] = true;
    (async () => {
      while (state[type]) {
        await doActivity(type);
        if (state[type]) await sleep(jitter(COOLDOWNS[type]));
      }
      running[type] = false;
    })();
  }

  document.getElementById('lm-modal')?.remove();

  const $ = (tag, css, txt) => {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (txt !== undefined) e.textContent = txt;
    return e;
  };

  // ── MODAL ──
  const modal = $('div', `
    position:fixed; top:24px; right:24px; z-index:2147483647; width:300px;
    background:linear-gradient(160deg,#1e1f28 0%,#23253a 50%,#1a1c2e 100%);
    border:1px solid rgba(88,101,242,.45); border-radius:16px; padding:0;
    font-family:'gg sans',system-ui,sans-serif; color:#e3e5e8;
    box-shadow:0 16px 48px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.04) inset;
    overflow:hidden; user-select:none;
  `);
  modal.id = 'lm-modal';

  // ── HEADER ──
  const header = $('div', `
    background:linear-gradient(90deg,#5865f2 0%,#7b5ea7 50%,#eb459e 100%);
    padding:12px 14px; display:flex; align-items:center;
    justify-content:space-between; cursor:grab;
  `);

  const tw = $('div', 'display:flex;align-items:center;gap:8px');
  tw.appendChild($('span', 'font-size:18px;line-height:1', '⚔️'));
  const ttx = $('div');
  ttx.appendChild($('div', 'font-size:13px;font-weight:700;color:#fff;letter-spacing:.3px', 'Last Meadow Bot'));
  // Show which host the bot targets
  ttx.appendChild($('div', 'font-size:10px;color:rgba(255,255,255,.65);margin-top:1px',
    `Farm automation · ${host}`));
  tw.appendChild(ttx);
  header.appendChild(tw);

  const closeBtn = $('div', `
    width:22px; height:22px; border-radius:50%; background:rgba(0,0,0,.3);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; font-size:13px; color:rgba(255,255,255,.8); transition:background .2s;
  `, '✕');
  closeBtn.onmouseenter = () => closeBtn.style.background = 'rgba(237,68,69,.8)';
  closeBtn.onmouseleave = () => closeBtn.style.background = 'rgba(0,0,0,.3)';
  closeBtn.onclick = () => {
    Object.keys(state).forEach(t => { state[t] = false; running[t] = false; });
    modal.remove();
  };
  header.appendChild(closeBtn);
  modal.appendChild(header);

  // ── DRAG ──
  let dragX = 0, dragY = 0, dragging = false;
  header.onmousedown = e => {
    dragging = true;
    const r = modal.getBoundingClientRect();
    dragX = e.clientX - r.left;
    dragY = e.clientY - r.top;
    header.style.cursor = 'grabbing';
    e.preventDefault();
  };
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    modal.style.left  = (e.clientX - dragX) + 'px';
    modal.style.top   = (e.clientY - dragY) + 'px';
    modal.style.right = 'auto';
  });
  document.addEventListener('mouseup', () => { dragging = false; header.style.cursor = 'grab'; });

  // ── BODY ──
  const body = $('div', 'padding:14px');

  // Token section
  const tokenSection = $('div', `
    margin-bottom:12px; background:rgba(255,255,255,.03);
    border:1px solid rgba(255,255,255,.07); border-radius:10px; padding:10px 12px;
  `);

  const tokenLabelRow = $('div', 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px');
  tokenLabelRow.appendChild($('span',
    'font-size:11px;font-weight:600;color:#80848e;text-transform:uppercase;letter-spacing:.5px',
    '🔑  Token'));

  const setStatus = found => {
    tokenStatus.textContent    = found ? '✓ auto' : '⟳ detect';
    tokenStatus.style.background   = found ? 'rgba(87,242,135,.15)' : 'rgba(237,68,69,.15)';
    tokenStatus.style.color        = found ? '#57f287' : '#ed4245';
    tokenStatus.style.borderColor  = found ? 'rgba(87,242,135,.3)'  : 'rgba(237,68,69,.3)';
  };

  const tokenStatus = $('span', `
    font-size:10px; font-weight:600; padding:2px 7px; border-radius:99px; cursor:pointer;
    background:${autoToken ? 'rgba(87,242,135,.15)' : 'rgba(237,68,69,.15)'};
    color:${autoToken ? '#57f287' : '#ed4245'};
    border:1px solid ${autoToken ? 'rgba(87,242,135,.3)' : 'rgba(237,68,69,.3)'};
    transition:all .2s;
  `, autoToken ? '✓ auto' : '⟳ detect');

  tokenStatus.title   = 'Click to re-detect token';
  tokenStatus.onclick = () => {
    const found = extractToken();
    const inp   = document.getElementById('lm-token');
    if (found) {
      inp.value = found;
      setStatus(true);
      log('🔑 Token auto-detected');
    } else {
      inp.value = '';
      inp.focus();
      setStatus(false);
      log('⚠️  Could not detect — paste manually');
    }
  };

  tokenLabelRow.appendChild(tokenStatus);
  tokenSection.appendChild(tokenLabelRow);

  const tokenInput = document.createElement('input');
  tokenInput.id          = 'lm-token';
  tokenInput.type        = 'password';
  tokenInput.placeholder = 'Paste Authorization token…';
  tokenInput.autocomplete = 'off';
  tokenInput.style.cssText = `
    width:100%; box-sizing:border-box; background:rgba(0,0,0,.25);
    border:1px solid rgba(255,255,255,.1); border-radius:7px;
    padding:6px 9px; color:#e3e5e8; font-size:12px; outline:none; transition:border-color .2s;
  `;
  tokenInput.onfocus = () => tokenInput.style.borderColor = 'rgba(88,101,242,.7)';
  tokenInput.onblur  = () => tokenInput.style.borderColor = 'rgba(255,255,255,.1)';
  if (autoToken) tokenInput.value = autoToken;
  tokenSection.appendChild(tokenInput);
  body.appendChild(tokenSection);

  // ── TOGGLES ──
  const TYPES = [
    { key: 'gathering', icon: '🌿', label: 'Gathering', sub: '1.5 s cooldown' },
    { key: 'crafting',  icon: '🔨', label: 'Crafting',  sub: '2.5 m cooldown' },
    { key: 'combat',    icon: '⚔️', label: 'Combat',    sub: '3 m cooldown'   },
  ];

  const togglesSection = $('div', 'display:flex;flex-direction:column;gap:6px;margin-bottom:12px');

  TYPES.forEach(({ key, icon, label, sub }) => {
    const row = $('div', `
      display:flex; justify-content:space-between; align-items:center;
      background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07);
      border-radius:10px; padding:9px 12px; transition:border-color .2s;
    `);

    const left = $('div', 'display:flex;align-items:center;gap:9px');
    left.appendChild($('span', 'font-size:16px;line-height:1', icon));
    const texts = $('div');
    texts.appendChild($('div', 'font-size:13px;font-weight:600;color:#e3e5e8', label));
    texts.appendChild($('div', 'font-size:10px;color:#80848e;margin-top:1px', sub));
    left.appendChild(texts);
    row.appendChild(left);

    const track = $('div', `
      position:relative; width:44px; height:24px; min-width:44px;
      background:#4e5058; border-radius:24px; cursor:pointer;
      transition:background .25s; box-shadow:inset 0 1px 3px rgba(0,0,0,.35);
    `);
    const knob = $('div', `
      position:absolute; top:4px; left:4px; width:16px; height:16px;
      background:#fff; border-radius:50%;
      transition:transform .25s; box-shadow:0 1px 4px rgba(0,0,0,.4);
    `);
    track.appendChild(knob);

    let on = false;
    track.onclick = () => {
      on = !on;
      track.style.background = on ? 'linear-gradient(90deg,#5865f2,#7b5ea7)' : '#4e5058';
      knob.style.transform   = on ? 'translateX(20px)' : 'translateX(0)';
      row.style.borderColor  = on ? 'rgba(88,101,242,.4)' : 'rgba(255,255,255,.07)';
      state[key] = on;
      if (on) startLoop(key);
      log(on ? `▶️  ${label} started` : `⏹️  ${label} stopped`);
    };

    row.appendChild(track);
    togglesSection.appendChild(row);
  });

  body.appendChild(togglesSection);

  // ── LOG ──
  const logWrap = $('div', `
    background:rgba(0,0,0,.3); border:1px solid rgba(255,255,255,.06);
    border-radius:10px; overflow:hidden;
  `);
  logWrap.appendChild($('div', `
    padding:6px 10px; font-size:10px; font-weight:600; color:#80848e;
    text-transform:uppercase; letter-spacing:.5px;
    border-bottom:1px solid rgba(255,255,255,.05);
  `, '📋  Activity log'));

  const logBox = $('pre', `
    margin:0; padding:8px 10px; height:100px; overflow-y:auto;
    font-size:10.5px; color:#b5bac1; white-space:pre-wrap; word-break:break-all;
    font-family:'Cascadia Code','Fira Code',monospace; line-height:1.5; background:transparent;
  `);
  logBox.id = 'lm-log';
  logWrap.appendChild(logBox);
  body.appendChild(logWrap);

  modal.appendChild(body);
  document.body.appendChild(modal);

  log(autoToken
    ? `🔑 Token auto-detected — ready! (${host})`
    : `⚠️  Click ⟳ detect or paste token · ${host}`);
})();
