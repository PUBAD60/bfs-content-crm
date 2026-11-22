/* BFS Dialogue Studio: list of all posts as text on the left, LinkedIn style preview + editor on the right.
   Needs studio.js (StudioEngine) and, for PNG download, html2canvas. Edits live in this browser (localStorage). */
(function () {
  const LS = 'bfs_studio_edits_v1';
  const STAGE = { 1: 'Stage 1 · $0 to $100k', 2: 'Stage 2 · $100k to $1M', 3: 'Stage 3 · $1M to $3M', 4: 'Stage 4 · $3M to $10M', 5: 'Stage 5 · $10M to $20M', 6: 'Stage 6 · $20M+' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const CSS = `
  .st-wrap{max-width:1500px;margin:0 auto;padding:18px 24px 80px;display:grid;grid-template-columns:minmax(0,1fr) 600px;gap:24px;align-items:start}
  @media(max-width:1100px){.st-wrap{grid-template-columns:1fr}.st-panel{position:static!important;max-height:none!important}}
  .st-bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px}.st-bar .n{color:var(--mute);margin-right:auto}
  .st-list{display:flex;flex-direction:column;gap:10px}
  .sp{background:#fff;border-radius:14px;padding:14px 16px 14px;box-shadow:0 0 0 1px rgba(20,22,24,.07);cursor:pointer;position:relative}
  .sp:hover{box-shadow:0 0 0 1px rgba(0,88,246,.35)}.sp.on{box-shadow:0 0 0 2px var(--blue)}
  .sp .h{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px}
  .sp .num{font:600 13px 'Geist Mono',monospace;color:var(--blue);background:var(--blueBg);border-radius:7px;padding:2px 8px;border:0}
  .sp .meta{font-size:12.5px;color:var(--mute)}.sp .ed{font-size:11.5px;font-weight:600;color:var(--orange);background:var(--orangeBg);border-radius:6px;padding:1px 7px}
  .sp h3{margin:0 0 2px;font-size:17px;letter-spacing:-.02em;line-height:1.25}.sp .sub{color:var(--mute);font-size:13.5px;margin:0 0 8px}
  .sp .ch{font-size:13.5px;line-height:1.45;border-left:2px solid var(--line);padding-left:10px;margin:0 0 8px}
  .sp .ch p{margin:0 0 3px}.sp .ch b{font-weight:650}.sp .ch i{font-style:normal;color:var(--faint);font-size:12px}.sp .ch .dp b{color:var(--blue)}
  .sp .p2{font-size:13px;color:var(--mute);margin:0 0 6px}.sp .p2 b{color:var(--ink)}
  .sp .cap{font-size:13px;color:var(--mute);margin:0}
  .st-panel{position:sticky;top:76px;max-height:calc(100vh - 92px);overflow:auto;display:flex;flex-direction:column;gap:14px;padding-right:4px}
  .li{background:#fff;border-radius:12px;box-shadow:0 0 0 1px rgba(20,22,24,.1);overflow:hidden;width:560px;max-width:100%}
  .li .lh{display:flex;gap:10px;padding:12px 14px 6px;align-items:center}.li .av{width:46px;height:46px;border-radius:50%;background:#16181d;display:grid;place-items:center;overflow:hidden}.li .av img{width:28px;height:28px}
  .li .nm{font-weight:650;font-size:14.5px;line-height:1.2}.li .tl{font-size:12.5px;color:var(--mute)}
  .li .tx{padding:4px 14px 10px;font-size:14.5px;line-height:1.45;white-space:pre-wrap;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}.li .tx.full{-webkit-line-clamp:unset;display:block}
  .li .more{padding:0 14px 8px;color:var(--mute);font-size:13px;cursor:pointer}
  .li .rx{display:flex;justify-content:space-around;padding:8px 6px;border-top:1px solid var(--line);color:var(--mute);font-size:13.5px;font-weight:600}
  .cv{position:relative;width:560px;max-width:100%;background:#E9EAE7;overflow:hidden}.cv .vp{position:relative;overflow:hidden}.cv .tr{display:flex;transition:transform .25s ease}
  .cv .sl{flex:none;position:relative;overflow:hidden}.cv iframe{position:absolute;left:0;top:0;width:1080px;height:1350px;border:0;transform-origin:0 0;background:#fff}
  .cv .nv{position:absolute;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:50%;border:0;background:rgba(20,22,24,.7);color:#fff;font-size:17px;line-height:1;display:grid;place-items:center}
  .cv .nv.l{left:8px}.cv .nv.r{right:8px}.cv .nv[disabled]{opacity:.25}
  .cv .pg{position:absolute;right:10px;bottom:10px;background:rgba(20,22,24,.75);color:#fff;font-size:12px;border-radius:999px;padding:2px 9px}
  .st-err{background:var(--redBg);color:var(--red);border-radius:10px;padding:8px 12px;font-size:13.5px}
  .st-act{display:flex;gap:8px;flex-wrap:wrap}.st-panel>*{flex:none}
  .ed2{background:#fff;border-radius:14px;box-shadow:0 0 0 1px rgba(20,22,24,.08);padding:14px 16px;display:flex;flex-direction:column;gap:10px}
  .ed2 label{font:500 11.5px 'Geist Mono',monospace;letter-spacing:.05em;text-transform:uppercase;color:var(--faint);display:block;margin-bottom:3px}
  .ed2 input,.ed2 textarea,.ed2 select{width:100%;border:1px solid var(--line);border-radius:9px;padding:7px 10px;font:inherit;font-size:14px;background:#fff;resize:vertical}
  .ed2 input:focus,.ed2 textarea:focus,.ed2 select:focus{outline:2px solid var(--blue);outline-offset:0}
  .ed2 .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .ed2 .m{display:grid;grid-template-columns:150px 1fr auto;gap:6px 8px;align-items:start;padding:8px;border-radius:10px;background:#F7F7F5}
  .ed2 .m.dp{background:#EAF0FF}.ed2 .m .to{grid-column:1/2}.ed2 .m textarea{min-height:42px}
  .ed2 .m .bt{display:flex;flex-direction:column;gap:4px}.ed2 .m .bt button{border:1px solid var(--line);background:#fff;border-radius:7px;width:28px;height:26px;font-size:13px;line-height:1}
  .ed2 h4{margin:4px 0 0;font:500 12px 'Geist Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--faint)}
  `;
  const ROLES = ['Founder', 'CEO', 'CFO', 'CMO', 'Head of Marketing', 'VP of Marketing', 'Head of Sales', 'PMM', 'Customer Success', 'Content lead', 'Developer', 'Design Director', 'Regional Marketer', 'Prospect', 'Investor', 'Advisor', 'Press', 'PR lead', 'Customer', 'Candidate', 'Agency', 'Freelancer', 'Design partner'];

  window.Studio = {
    mount(root, scripts, opts) {
      opts = opts || {};
      if (!document.getElementById('st-css')) { const s = document.createElement('style'); s.id = 'st-css'; s.textContent = CSS; document.head.appendChild(s); }
      let edits = {}; try { edits = JSON.parse(localStorage.getItem(LS) || '{}'); } catch (_) {}
      const orig = Object.fromEntries(scripts.map((d) => [d.id, d]));
      const cur = (id) => edits[id] || orig[id];
      const saveEdits = () => { try { localStorage.setItem(LS, JSON.stringify(edits)); } catch (_) {} };
      let sel = (opts.select && orig[opts.select]) ? opts.select : null, slide = 0, timer = null, fontsReady = null, q = (opts.q || '').toLowerCase();
      const all = () => scripts.map((d) => cur(d.id)).sort((a, b) => +a.id - +b.id);
      const isDP = (w) => w === 'Design partner';
      const textOf = (d) => [d.id, d.head, d.sub, d.h2, d.sub2, d.team, d.where, d.arr, d.caption, d.kw, d.pillar, (d.lines || []).map((l) => l[0] + ' ' + l[1]).join(' ')].join(' ').toLowerCase();

      root.innerHTML = `<div class="st-wrap"><div><div class="st-bar"><span class="n" id="st-n"></span><button class="btn sm" id="st-exp">Copy all my edits</button><button class="btn sm" id="st-rst">Reset all edits</button></div><div class="st-list" id="st-list"></div></div><div class="st-panel" id="st-panel"></div></div>`;
      const $ = (s) => root.querySelector(s);

      function listHtml() {
        const items = all().filter((d) => !q || textOf(d).includes(q));
        $('#st-n').textContent = items.length + ' dialogue posts. All text is shown. Click one to preview and edit.';
        $('#st-list').innerHTML = items.map((d) => {
          const lines = (d.lines || []).map((l) => `<p class="${isDP(l[0]) ? 'dp' : ''}"><b>${esc(l[0])}</b>${l[2] ? ' <i>to ' + esc(l[2]) + '</i>' : ''}  ${esc(l[1])}</p>`).join('');
          return `<div class="sp ${d.id === sel ? 'on' : ''}" data-id="${esc(d.id)}"><div class="h"><button class="num" data-copy="DLG-${esc(d.id)}" title="Copy post number">DLG-${esc(d.id)}</button><span class="meta">${esc(STAGE[d.stage] || '')} · ${esc(d.arr)} · ${d.kind === 'email' ? 'Gmail' : 'Slack'} · ${esc(d.pillar)} · ${esc(d.kw)}</span>${edits[d.id] ? '<span class="ed">edited</span>' : ''}</div><h3>${esc(d.head)}</h3><p class="sub">${esc(d.sub)}</p><div class="ch">${lines}</div>${d.h2 ? `<p class="p2"><b>Slide 2.</b> ${esc(d.h2)}. ${esc(d.sub2)}</p>` : ''}<p class="cap"><b>Caption.</b> ${esc(d.caption)}</p></div>`;
        }).join('') || '<p style="color:var(--mute)">No posts match.</p>';
      }

      async function ensureFonts() {
        if (!fontsReady) fontsReady = Promise.all(StudioEngine.fonts.map((f) => document.fonts.load(f))).then(() => document.fonts.ready).catch(() => {});
        return fontsReady;
      }

      function panelHtml(d) {
        const email = d.kind === 'email';
        const speakers = [...new Set([...(d.lines || []).map((l) => l[0]), ...ROLES])];
        const msgs = (d.lines || []).map((l, i) => `<div class="m ${isDP(l[0]) ? 'dp' : ''}" data-i="${i}"><input list="st-roles" data-f="who" value="${esc(l[0])}" aria-label="Speaker">${''}<textarea data-f="text" rows="2" aria-label="Message">${esc(l[1])}</textarea><div class="bt"><button data-a="up" title="Move up">↑</button><button data-a="dn" title="Move down">↓</button><button data-a="del" title="Delete">✕</button></div>${email ? `<input class="to" data-f="to" value="${esc(l[2] || '')}" placeholder="to" list="st-roles" aria-label="Recipient">` : ''}</div>`).join('');
        return `<div class="st-act"><button class="btn sm p" data-do="copynum">Copy post number DLG-${esc(d.id)}</button><button class="btn sm" data-do="png">Download slides PNG</button><button class="btn sm" data-do="cap">Download caption</button><button class="btn sm" data-do="copytxt">Copy post text</button><button class="btn sm" data-do="copyedit">Copy edits for Claude</button><button class="btn sm" data-do="reset">Reset this post</button></div>
        <div class="st-err" id="st-err" style="display:none"></div>
        <div class="li"><div class="lh"><div class="av"><img src="assets/mark-metal.svg" alt=""></div><div><div class="nm">Built for SaaS</div><div class="tl">Design and web for SaaS teams · Now</div></div></div><div class="tx" id="st-cap">${esc(d.caption)}</div><div class="more" id="st-more">...more</div><div class="cv"><div class="vp" id="st-vp"><div class="tr" id="st-tr"></div></div><button class="nv l" id="st-l" aria-label="Previous">‹</button><button class="nv r" id="st-r" aria-label="Next">›</button><span class="pg" id="st-pg"></span></div><div class="rx"><span>Like</span><span>Comment</span><span>Repost</span><span>Send</span></div></div>
        <div class="ed2" id="st-ed"><datalist id="st-roles">${speakers.map((s) => `<option value="${esc(s)}">`).join('')}</datalist>
          <div class="row"><div><label>Post number</label><input value="DLG-${esc(d.id)}" readonly></div><div><label>Type</label><select data-f="kind"><option value="slack" ${!email ? 'selected' : ''}>Slack (inside team)</option><option value="email" ${email ? 'selected' : ''}>Gmail (outsider thread)</option></select></div></div>
          <div class="row"><div><label>${email ? 'Email subject' : 'Slack channel'}</label><input data-f="where" value="${esc(d.where)}"></div><div><label>ARR</label><input data-f="arr" value="${esc(d.arr)}"></div></div>
          <div><label>Heading</label><input data-f="head" value="${esc(d.head)}"></div>
          <div><label>Subtext</label><textarea data-f="sub" rows="2">${esc(d.sub)}</textarea></div>
          <div class="row"><div><label>Slide 2 heading (empty = one slide)</label><input data-f="h2" value="${esc(d.h2 || '')}"></div><div><label>Slide 2 subtext</label><input data-f="sub2" value="${esc(d.sub2 || '')}"></div></div>
          <h4>Messages</h4>${msgs}<div class="st-act"><button class="btn sm" data-do="add">+ Add message</button></div>
          <div><label>LinkedIn caption</label><textarea data-f="caption" rows="5">${esc(d.caption)}</textarea></div>
          <div class="row"><div><label>Keyword</label><input data-f="kw" value="${esc(d.kw)}"></div><div><label>Pillar</label><input data-f="pillar" value="${esc(d.pillar)}"></div></div></div>`;
      }

      async function renderPreview() {
        const d = cur(sel); await ensureFonts();
        StudioEngine.setData(all());
        const r = StudioEngine.build(sel), err = $('#st-err');
        if (r.error) { err.style.display = 'block'; err.textContent = r.error.replace(/^S3G \d+ \(.*?\) /, 'Does not fit. ') + ' Shorten a message, or add or remove a message, or fill Slide 2 heading to split it.'; }
        else err.style.display = 'none';
        const pages = r.error ? [] : r.pages;
        const base = location.href.split('#')[0];
        const w = $('#st-vp').parentElement.clientWidth || 560, k = w / 1080, h = 1350 * k;
        $('#st-vp').style.height = h + 'px';
        const tr = $('#st-tr'); tr.style.width = w * pages.length + 'px';
        tr.innerHTML = pages.map(() => `<div class="sl" style="width:${w}px;height:${h}px"><iframe style="transform:scale(${k})" title="slide"></iframe></div>`).join('');
        [...tr.querySelectorAll('iframe')].forEach((f, i) => { f.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><base href="${base}"><link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet"><script src="https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js"></script><style>${StudioEngine.css}</style></head><body style="margin:0;background:#fff">${pages[i]}</body></html>`; });
        slide = Math.min(slide, Math.max(0, pages.length - 1)); go(0);
        $('#st-cap').textContent = d.caption;
      }
      function go(dx) {
        const n = $('#st-tr').children.length; slide = Math.max(0, Math.min(n - 1, slide + dx));
        const w = $('#st-vp').parentElement.clientWidth; $('#st-tr').style.transform = `translateX(${-slide * w}px)`;
        $('#st-pg').textContent = n ? (slide + 1) + ' / ' + n : '';
        $('#st-l').disabled = slide === 0; $('#st-r').disabled = slide >= n - 1;
      }

      function open(id) {
        sel = id; slide = 0; const d = cur(id);
        $('#st-panel').innerHTML = panelHtml(d);
        root.querySelectorAll('.sp').forEach((e) => e.classList.toggle('on', e.dataset.id === id));
        renderPreview();
      }
      function touch() {
        const d = edits[sel] || (edits[sel] = clone(orig[sel]));
        return d;
      }
      function norm(d) {
        const dp = (d.lines || []).map((l, i) => [l[1].length, i, l[0]]).filter((x) => isDP(x[2])).sort((a, b) => b[0] - a[0]);
        d.key = dp.length ? dp[0][1] : 0;
        if (!d.h2) { delete d.h2; delete d.sub2; }
        return d;
      }
      function later() { clearTimeout(timer); timer = setTimeout(() => { saveEdits(); listHtml(); renderPreview(); }, 450); }

      root.addEventListener('click', async (e) => {
        const cp = e.target.closest('[data-copy]');
        if (cp) { e.stopPropagation(); await navigator.clipboard.writeText(cp.dataset.copy); const o = cp.textContent; cp.textContent = 'Copied'; setTimeout(() => cp.textContent = o, 1000); return; }
        const sp = e.target.closest('.sp'); if (sp) { open(sp.dataset.id); return; }
        if (e.target.id === 'st-l') return go(-1); if (e.target.id === 'st-r') return go(1);
        if (e.target.id === 'st-more') { $('#st-cap').classList.toggle('full'); e.target.textContent = $('#st-cap').classList.contains('full') ? 'less' : '...more'; return; }
        const a = e.target.closest('[data-a]');
        if (a) {
          const i = +a.closest('.m').dataset.i, d = touch(), L = d.lines;
          if (a.dataset.a === 'del') L.splice(i, 1); else if (a.dataset.a === 'up' && i > 0) [L[i - 1], L[i]] = [L[i], L[i - 1]]; else if (a.dataset.a === 'dn' && i < L.length - 1) [L[i + 1], L[i]] = [L[i], L[i + 1]];
          norm(d); saveEdits(); listHtml(); $('#st-panel').innerHTML = panelHtml(d); renderPreview(); return;
        }
        const t = e.target.closest('[data-do]'); if (!t) return; const act = t.dataset.do, d = cur(sel);
        if (act === 'copynum') { await navigator.clipboard.writeText('DLG-' + d.id); t.textContent = 'Copied'; setTimeout(() => t.textContent = 'Copy post number DLG-' + d.id, 1000); }
        if (act === 'add') { const dd = touch(); dd.lines.push(['Founder', 'New message', dd.kind === 'email' ? 'Design partner' : undefined].filter((x, i) => i < 2 || x)); norm(dd); saveEdits(); listHtml(); $('#st-panel').innerHTML = panelHtml(dd); renderPreview(); }
        if (act === 'reset') { delete edits[sel]; saveEdits(); listHtml(); open(sel); }
        if (act === 'cap') { const b = new Blob([d.caption], { type: 'text/plain' }); dl(URL.createObjectURL(b), 'DLG-' + d.id + '-caption.txt'); }
        if (act === 'copytxt') { await navigator.clipboard.writeText(d.head + '\n' + d.sub + '\n\n' + d.lines.map((l) => l[0] + ': ' + l[1]).join('\n') + (d.h2 ? '\n\nSlide 2. ' + d.h2 + '. ' + d.sub2 : '') + '\n\n' + d.caption); t.textContent = 'Copied'; setTimeout(() => t.textContent = 'Copy post text', 1000); }
        if (act === 'copyedit') { await navigator.clipboard.writeText('Edit DLG-' + d.id + ' (' + d.head + ')\n' + JSON.stringify(edits[d.id] || 'no changes', null, 1)); t.textContent = 'Copied'; setTimeout(() => t.textContent = 'Copy edits for Claude', 1000); }
        if (act === 'png') await png(d, t);
      });
      function dl(url, name) { const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
      let noiseP = null;
      function noisePng() {
        if (noiseP) return noiseP;
        noiseP = new Promise((res) => {
          const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .08 0 0 0 0 .09 0 0 0 0 .12 0 0 0 .07 0'/></filter><rect width='160' height='160' filter='url(#n)'/></svg>";
          const im = new Image(); im.onload = () => { try { const c = document.createElement('canvas'); c.width = c.height = 160; c.getContext('2d').drawImage(im, 0, 0); res(c.toDataURL('image/png')); } catch (_) { res(null); } }; im.onerror = () => res(null);
          im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        });
        return noiseP;
      }
      async function png(d, btn) {
        if (!edits[d.id] && opts.exact) { try { const ex = await opts.exact(d.id); if (ex && ex.length) { ex.forEach((x, i) => dl(x, 'DLG-' + d.id + '-slide-' + (i + 1) + '.jpg')); return; } } catch (_) {} }
        const fr = [...root.querySelectorAll('#st-tr iframe')], o = btn.textContent;
        for (let i = 0; i < fr.length; i++) {
          btn.textContent = 'Rendering ' + (i + 1) + '/' + fr.length;
          const w = fr[i].contentWindow, doc = fr[i].contentDocument, art = doc.querySelector('article');
          if (!art || !w.htmlToImage) { btn.textContent = 'Not ready, try again'; setTimeout(() => btn.textContent = o, 1500); return; }
          await doc.fonts.ready;
          const cv = art.querySelector('.canvas'), prev = cv.getAttribute('style'), t1 = [...art.querySelectorAll('.gt1 span:first-child')];
          const noise = await noisePng();
          cv.style.setProperty('background-image', (noise ? 'url(' + noise + '), ' : '') + 'radial-gradient(70% 50% at 50% 0%, rgba(255,255,255,.75), rgba(0,0,0,0) 70%), linear-gradient(#F5F5F3, #F0F0EE)', 'important');
          t1.forEach((e) => { e.style.overflow = 'visible'; e.style.textOverflow = 'clip'; });
          const gr = [...art.querySelectorAll('.grc')]; gr.forEach((e) => { e.style.marginLeft = '10px'; });
          const blob = await w.htmlToImage.toBlob(art, { pixelRatio: 2, cacheBust: true, width: 1080, height: 1350, backgroundColor: '#F7F7F5' });
          if (prev == null) cv.removeAttribute('style'); else cv.setAttribute('style', prev); t1.forEach((e) => { e.style.overflow = ''; e.style.textOverflow = ''; }); gr.forEach((e) => { e.style.marginLeft = ''; });
          dl(URL.createObjectURL(blob), 'DLG-' + d.id + '-slide-' + (i + 1) + '.png');
          await new Promise((r) => setTimeout(r, 300));
        }
        btn.textContent = o;
      }
      root.addEventListener('input', (e) => {
        const f = e.target.dataset.f; if (!f) return; const d = touch();
        const m = e.target.closest('.m');
        if (m) { const i = +m.dataset.i, l = d.lines[i]; if (f === 'who') l[0] = e.target.value; if (f === 'text') l[1] = e.target.value; if (f === 'to') { if (e.target.value) l[2] = e.target.value; else l.length = 2; } m.classList.toggle('dp', isDP(l[0])); norm(d); }
        else d[f] = e.target.value;
        if (f === 'kind') { saveEdits(); listHtml(); $('#st-panel').innerHTML = panelHtml(d); renderPreview(); return; }
        norm(d); later();
      });
      $('#st-exp').onclick = async (e) => { await navigator.clipboard.writeText(JSON.stringify(edits, null, 1)); e.target.textContent = 'Copied'; setTimeout(() => e.target.textContent = 'Copy all my edits', 1000); };
      $('#st-rst').onclick = () => { if (confirm('Remove all your edits in this browser?')) { edits = {}; saveEdits(); listHtml(); if (sel) open(sel); } };
      window.addEventListener('resize', () => { if (sel && root.contains($('#st-panel'))) renderPreview(); });

      this.setQuery = (v) => { q = (v || '').toLowerCase(); listHtml(); };
      listHtml();
      const first = sel || (all()[0] && all()[0].id); if (first) open(first);
    },
  };
})();
