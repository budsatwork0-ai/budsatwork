#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function argsPrompt() {
  const a = process.argv.slice(2);
  const i = a.indexOf('--prompt');
  if (i !== -1) return a[i + 1];
  return null;
}

function loadEventPrompt() {
  try {
    const evtPath = process.env.GITHUB_EVENT_PATH;
    if (!evtPath) return null;
    const evt = JSON.parse(fs.readFileSync(evtPath, 'utf8'));
    if (process.env.GITHUB_EVENT_NAME === 'issues') {
      const hasLabel = (evt.issue.labels || []).some(l => (l.name || '').toLowerCase() === 'deploy');
      if (!hasLabel) return null;
      return evt.issue.body || '';
    }
    if (process.env.GITHUB_EVENT_NAME === 'issue_comment') {
      const body = (evt.comment && evt.comment.body) || '';
      if (body.trim().toLowerCase().startsWith('/deploy')) {
        return body.replace(/^[^\s]+\s*/, '');
      }
      return null;
    }
    if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
      return (process.env.INPUT_PROMPT || '').trim() || null;
    }
    return null;
  } catch (e) {
    return null;
  }
}

function heroNoiseSVG(){
  return `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 0 0.06 0.12 0.16 0.2 0.24 0.28 0.32 0.36 0.4'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.3'/></svg>`;
}

function baseHTML(){
  return `
<header class="site-header">
  <div class="container row">
    <div class="brand"><span class="dot"></span><strong>Buds at Work</strong></div>
    <nav class="nav">
      <a href="#services">Services & Pricing</a>
      <a href="#work">Work</a>
      <a href="#contact" class="btn">Get Involved</a>
    </nav>
  </div>
</header>
<section class="hero">
  <div class="container">
    <h1>Busy? Leave it to Buds.</h1>
    <p>Reliable local help for windows, lawns & gardens, and dump runs — powered by community.</p>
    <div class="actions">
      <a class="btn primary" href="#contact">Book a free quote</a>
      <a class="btn ghost" href="#work">See our work</a>
    </div>
  </div>
</section>
<section id="services" class="section">
  <div class="container grid-3">
    <div class="card"><h3>Window Cleaning</h3><p>Streak-free residential & commercial.</p><div class="price">from $80</div></div>
    <div class="card"><h3>Lawn & Garden</h3><p>Mowing, edging, hedges, tidy-ups.</p><div class="price">from $50/hr</div></div>
    <div class="card"><h3>Dump Runs</h3><p>Rubbish & green waste removal.</p><div class="price">from $80/m³</div></div>
  </div>
</section>
<section class="section alt">
  <div class="container row">
    <div>
      <h2>Why people choose Buds</h2>
      <ul class="ticks">
        <li>Friendly, trained team</li>
        <li>Up-front pricing</li>
        <li>Community impact</li>
      </ul>
    </div>
    <div class="card testimonial">
      <blockquote>“Absolute legends — showed up on time and the windows have never looked better.”</blockquote>
      <div class="who">— Priya, Ipswich</div>
    </div>
  </div>
</section>
<footer class="site-footer" id="contact">
  <div class="container row">
    <div>
      <div class="brand small"><span class="dot"></span><strong>Buds at Work</strong></div>
      <p class="muted">Email: budsatwork@malucare.org · Phone: 0474 766 703</p>
    </div>
    <form class="contact">
      <input placeholder="Name" required />
      <input placeholder="Email" type="email" required />
      <input placeholder="Suburb" />
      <button class="btn primary" type="submit">Request a callback</button>
    </form>
  </div>
</footer>`;
}

function baseCSS({ primary, accent, paper }){
  return `
:root{ --primary:${primary}; --accent:${accent}; --paper:${paper}; --ink:#18221b; --muted:#495a50; --radius:16px }
*{box-sizing:border-box} body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif;color:var(--ink);background:var(--paper)}
.container{max-width:1100px;margin:0 auto;padding:24px}
.row{display:flex;gap:24px;align-items:center;justify-content:space-between}
.grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.site-header{position:sticky;top:0;background:#0f3d2e;color:#fff;border-bottom:1px solid rgba(255,255,255,.08);z-index:20}
.brand{display:flex;align-items:center;gap:10px;letter-spacing:.4px}
.brand .dot{width:12px;height:12px;border-radius:999px;background:var(--accent);display:inline-block}
.nav a{color:#fff;text-decoration:none;margin-left:18px;opacity:.95}
.nav .btn{background:var(--accent);color:#111;padding:10px 14px;border-radius:10px}
.hero{background:linear-gradient(135deg, rgba(15,61,46,.92), rgba(15,61,46,.65)), url('data:image/svg+xml;utf8,${encodeURIComponent(heroNoiseSVG())}') center/cover no-repeat;color:#fff}
.hero .container{padding:96px 24px}
.hero h1{font-size:44px;line-height:1.05;margin:0 0 10px}
.hero p{opacity:.9;max-width:760px}
.actions{display:flex;gap:12px;margin-top:18px}
.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 16px;border:1px solid rgba(0,0,0,.08);border-radius:12px;text-decoration:none;cursor:pointer}
.btn.primary{background:var(--accent);color:#111;border:none}
.btn.ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.5)}
.section{padding:54px 0}
.section.alt{background:rgba(0,0,0,.03)}
.card{background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:var(--radius);padding:18px;box-shadow:0 1px 0 rgba(0,0,0,.02)}
.card h3{margin:0 0 6px}
.card .price{margin-top:10px;font-weight:600;color:var(--primary)}
.ticks{list-style:none;padding:0;margin:0}
.ticks li{padding-left:26px;position:relative;margin:8px 0}
.ticks li::before{content:"";position:absolute;left:0;top:8px;width:16px;height:16px;border-radius:4px;background:var(--accent)}
.testimonial blockquote{margin:0 0 8px;font-size:18px}
.who{color:var(--muted)}
.site-footer{background:#0f3d2e;color:#fff}
.site-footer .muted{opacity:.8}
.site-footer .contact{display:flex;gap:10px}
.site-footer input{border-radius:10px;padding:10px;border:none}
@media (max-width:900px){ .grid-3{grid-template-columns:1fr} .row{flex-direction:column;align-items:flex-start} .site-footer .contact{flex-direction:column;align-items:stretch;width:100%} }
`;
}

function baseJS(){
  return `document.querySelector('.contact')?.addEventListener('submit', (e)=>{e.preventDefault();alert('Thanks! We\\'ll be in touch.');})`;
}

function escapeHTML(s){
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

function mockPlanFromPrompt(prompt){
  const p = (prompt || '').toLowerCase();
  return {
    brand: /buds/.test(p) ? "Buds at Work" : /volu/.test(p) ? "Volu" : "My Brand",
    primary: /purple|lavender/.test(p) ? "#6A1B9A" : "#0f3d2e",
    accent: /coral/.test(p) ? "#ef5350" : /mustard|yellow/.test(p) ? "#c9a227" : "#10b981",
    paper: /cream|ivory/.test(p) ? "#fff6e8" : "#f8fafb",
    services: [
      { title: /window/.test(p) ? "Window Cleaning" : "Product One", desc: "Streak-free shine.", price: "from $80" },
      { title: /lawn|garden/.test(p) ? "Lawn & Garden" : "Product Two", desc: "Neat lawns, tidy hedges.", price: "from $50/hr" },
      { title: /dump|rubbish/.test(p) ? "Dump Runs" : "Product Three", desc: "We haul it away.", price: "from $80/m³" }
    ],
    extras: { testimonials: true, faq: /faq/.test(p) }
  };
}

function renderFromSpec(spec){
  const b = escapeHTML(spec.brand);
  const s0 = { title: escapeHTML(spec.services[0].title), desc: escapeHTML(spec.services[0].desc), price: escapeHTML(spec.services[0].price) };
  const s1 = { title: escapeHTML(spec.services[1].title), desc: escapeHTML(spec.services[1].desc), price: escapeHTML(spec.services[1].price) };
  const s2 = { title: escapeHTML(spec.services[2].title), desc: escapeHTML(spec.services[2].desc), price: escapeHTML(spec.services[2].price) };
  const html = baseHTML()
    .replaceAll("Buds at Work", b)
    .replaceAll("Window Cleaning", s0.title)
    .replaceAll("Streak-free residential & commercial.", s0.desc)
    .replaceAll("from $80", s0.price)
    .replaceAll("Lawn & Garden", s1.title)
    .replaceAll("Mowing, edging, hedges, tidy-ups.", s1.desc)
    .replaceAll("from $50/hr", s1.price)
    .replaceAll("Dump Runs", s2.title)
    .replaceAll("Rubbish & green waste removal.", s2.desc)
    .replaceAll("from $80/m³", s2.price)
    + (spec.extras.faq ? faqHTML() : "");
  const css = baseCSS({ primary: spec.primary, accent: spec.accent, paper: spec.paper });
  const js = baseJS();
  return composeSrcDoc(html, css, js);
}

function faqHTML(){
  return `
<section class="section" id="faq">
  <div class="container">
    <h2>FAQs</h2>
    <details class="card"><summary>Are you insured?</summary><div>Yes — we carry public liability insurance.</div></details>
    <details class="card"><summary>Do you bring gear?</summary><div>All equipment provided unless requested otherwise.</div></details>
  </div>
</section>`;
}

function composeSrcDoc(html, css, js) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
}

function main(){
  const cli = argsPrompt();
  const evt = loadEventPrompt();
  const prompt = cli || evt;
  if (!prompt) {
    fs.mkdirSync('dist', { recursive: true });
    fs.writeFileSync(path.join('dist','index.html'), renderFromSpec(mockPlanFromPrompt('fallback')));
    return;
  }
  const spec = mockPlanFromPrompt(prompt);
  const doc = renderFromSpec(spec);
  fs.mkdirSync('dist', { recursive: true });
  fs.writeFileSync(path.join('dist','index.html'), doc);
  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (summary) fs.appendFileSync(summary, `\n**Deployed prompt**: ${prompt}\n`);
}

main();
