#!/usr/bin/env node
// CommonJS, no deps. Builds a small multi-page static site into /dist.
const fs = require("node:fs");
const path = require("node:path");

// ---------- prompt plumbing (optional) ----------
function getPrompt() {
  const a = process.argv.slice(2);
  const i = a.indexOf("--prompt");
  if (i !== -1) return a[i + 1];

  try {
    const p = process.env.GITHUB_EVENT_PATH;
    if (!p || !fs.existsSync(p)) return "";
    const evt = JSON.parse(fs.readFileSync(p, "utf8"));
    const name = process.env.GITHUB_EVENT_NAME || "";
    if (name === "issue_comment") {
      const body = evt?.comment?.body || "";
      if (/^\s*\/deploy\b/i.test(body)) return body.replace(/^\s*\/deploy\s*/i, "");
    } else if (name === "workflow_dispatch") {
      return (process.env.INPUT_PROMPT || "").trim();
    }
  } catch {}
  return "";
}

// ---------- design system ----------
function heroNoiseSVG(){
  return `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 0 0.06 0.12 0.16 0.2 0.24 0.28 0.32 0.36 0.4'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.3'/></svg>`;
}

function baseCSS({ primary, accent, paper }) {
  return `
:root{
  --primary:${primary}; --accent:${accent}; --paper:${paper};
  --ink:#18221b; --muted:#5a6a61; --radius:14px; --shadow:0 10px 30px rgba(0,0,0,.08)
}
*{box-sizing:border-box} body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif;color:var(--ink);background:var(--paper)}
a{color:inherit}
.container{max-width:1160px;margin:0 auto;padding:12px 20px}

/* --- Header --- */
.site-header{position:sticky;top:0;background:#fff;border-bottom:1px solid rgba(0,0,0,.08);z-index:50}
.navbar{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center}
.brand{display:inline-flex;align-items:center;gap:10px;text-decoration:none}
.logo-icon{width:20px;height:20px;border-radius:6px;background:var(--primary);position:relative;display:inline-block}
.logo-icon::after{content:"";position:absolute;inset:4px;border-radius:4px;background:var(--accent)}
.logo-text{font-weight:700;letter-spacing:.2px}

.nav-center{display:flex;justify-content:center;gap:20px}
.nav-center a{padding:10px 6px;text-decoration:none;border-radius:8px}
.nav-center a:hover{background:rgba(0,0,0,.04)}
.nav-right{display:flex;gap:10px;align-items:center}
.nav-icon{display:inline-flex;align-items:center;gap:8px;padding:10px 12px;border-radius:10px;border:1px solid rgba(0,0,0,.06);background:#fff;cursor:pointer;text-decoration:none}
.nav-icon:hover{background:#f4f6f5}
.nav-icon svg{width:18px;height:18px}
.hamburger{display:none;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:10px;padding:10px;cursor:pointer}
.hamburger:hover{background:#f4f6f5}

/* Mobile menu */
.mobile-menu{display:none}
.mobile-menu.open{display:block}
.mobile-menu a{display:block;padding:12px 16px;border-top:1px solid rgba(0,0,0,.06);text-decoration:none}
.mobile-menu a:hover{background:#f6f8f7}

/* Account dropdown */
details.account{position:relative}
details.account[open] > summary{background:#eef3ef}
summary.account-toggle{list-style:none;display:inline-flex;align-items:center;gap:8px;padding:10px 12px;border-radius:10px;border:1px solid rgba(0,0,0,.06);cursor:pointer}
summary.account-toggle::-webkit-details-marker{display:none}
.account-menu{position:absolute;top:calc(100% + 8px);right:0;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:12px;box-shadow:var(--shadow);min-width:220px;overflow:hidden}
.account-menu a,.account-menu button{display:block;width:100%;text-align:left;padding:10px 12px;background:#fff;border:0;cursor:pointer}
.account-menu a:hover,.account-menu button:hover{background:#f5f7f6}

/* --- Sections --- */
.hero{background:linear-gradient(135deg, rgba(15,61,46,.92), rgba(15,61,46,.65)), url('data:image/svg+xml;utf8,${encodeURIComponent(heroNoiseSVG())}') center/cover no-repeat;color:#fff}
.hero .container{padding:84px 20px}
.hero h1{margin:0 0 8px;font-size:44px;letter-spacing:-.01em}
.hero p{opacity:.92;max-width:760px}
.actions{display:flex;gap:12px;margin-top:16px}
.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 16px;border:1px solid rgba(0,0,0,.08);border-radius:12px;background:#fff;cursor:pointer;text-decoration:none}
.btn.primary{background:var(--accent);color:#111;border:none}
.btn.ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.5)}
.section{padding:54px 0}
.section.alt{background:rgba(0,0,0,.03)}
.grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.card{background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:var(--radius);padding:18px;box-shadow:0 1px 0 rgba(0,0,0,.02)}
.card h3{margin:0 0 6px}
.card .price{margin-top:10px;font-weight:600;color:var(--primary)}

/* Footer */
.site-footer{background:#0f3d2e;color:#fff}
.site-footer .container{padding:24px 20px}
.site-footer .muted{opacity:.85}

/* Modal (Sign in) */
.modal{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:60}
.modal.hidden{display:none}
.modal-card{width:min(560px, 92vw);background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:16px;box-shadow:var(--shadow);overflow:hidden}
.modal-head{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid rgba(0,0,0,.06)}
.modal-tabs{display:flex;gap:8px;padding:10px 12px;border-bottom:1px solid rgba(0,0,0,.06)}
.modal-tabs button{padding:8px 12px;border-radius:10px;border:1px solid transparent;background:#f4f6f5;cursor:pointer}
.modal-tabs button.active{background:#e9efea;border-color:#d9e5dc}
.modal-body{padding:12px}
.modal-body form{display:grid;gap:10px}
.input{padding:12px;border:1px solid #e1e6e3;border-radius:10px}
.oauth{display:flex;align-items:center;gap:8px;justify-content:center;padding:10px 12px;border:1px solid #e1e6e3;border-radius:12px;background:#fff;cursor:pointer}
.or{display:flex;align-items:center;gap:10px;justify-content:center;color:var(--muted)}
.or::before,.or::after{content:"";height:1px;background:#e1e6e3;flex:1}

/* Responsive header rules */
@media (max-width: 900px){
  .logo-text{display:none}
  .nav-center{display:none}
  .hamburger{display:inline-flex}
  .navbar{grid-template-columns:auto 1fr auto auto}
}

/* Work grid */
.work-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.work{aspect-ratio:4/3;border-radius:var(--radius);border:1px solid rgba(0,0,0,.06);background:linear-gradient(135deg, rgba(0,0,0,.06), rgba(0,0,0,.02))}
@media (max-width: 900px){ .grid-3,.work-grid{grid-template-columns:1fr} }
`;
}

// ---------- components ----------
function headerHTML(active = "Home"){
  const is = (t) => `href="${hrefFor(t)}" class="${active===t?'on':''}"`;
  return `
<header class="site-header">
  <div class="container navbar">
    <a class="brand" href="${hrefFor('Home')}" aria-label="Buds at Work Home">
      <span class="logo-icon" aria-hidden="true"></span>
      <span class="logo-text">Buds at Work</span>
    </a>

    <nav class="nav-center" aria-label="primary">
      <a ${is('Home')}>Home</a>
      <a ${is('About Us')}>About Us</a>
      <a ${is('Services & Pricing')}>Services & Pricing</a>
      <a ${is('Shop')}>Shop</a>
      <a ${is('Get Involved')}>Get Involved</a>
    </nav>

    <div class="nav-right">
      <a class="nav-icon" href="${hrefFor('Cart')}" aria-label="Cart">
        ${iconCart()} <span>Cart</span>
      </a>

      <button class="nav-icon sign-in-btn" aria-haspopup="dialog">
        ${iconUser()} <span class="sign-in-label">Sign in</span>
      </button>

      <details class="account hidden">
        <summary class="account-toggle">${iconUser()} <span>Account</span></summary>
        <div class="account-menu" role="menu">
          <a role="menuitem" href="${hrefFor('Orders')}">Orders</a>
          <a role="menuitem" href="${hrefFor('Bookings')}">Bookings</a>
          <a role="menuitem" href="${hrefFor('Payments')}">Payment Methods</a>
          <button type="button" class="logout" role="menuitem">Logout</button>
        </div>
      </details>

      <button class="hamburger" aria-label="Open menu" aria-expanded="false">${iconHamburger()}</button>
    </div>
  </div>

  <div class="mobile-menu" hidden>
    <a href="${hrefFor('Home')}">Home</a>
    <a href="${hrefFor('About Us')}">About Us</a>
    <a href="${hrefFor('Services & Pricing')}">Services & Pricing</a>
    <a href="${hrefFor('Shop')}">Shop</a>
    <a href="${hrefFor('Get Involved')}">Get Involved</a>
  </div>
</header>
  `;
}

function footerHTML(){
  return `
<footer class="site-footer">
  <div class="container">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
      <span class="logo-icon" aria-hidden="true"></span>
      <strong>Buds at Work</strong>
    </div>
    <p class="muted">Email: budsatwork@malucare.org · Phone: 0474 766 703</p>
  </div>
</footer>`;
}

function iconCart(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="9" cy="20" r="1"/><circle cx="16" cy="20" r="1"/><path d="M1 2h3l2.6 12.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L22 7H6"/></svg>`; }
function iconUser(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>`; }
function iconHamburger(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`; }

function signInModalHTML(){
  return `
<div class="modal hidden" id="auth-modal" role="dialog" aria-modal="true" aria-label="Sign in">
  <div class="modal-card">
    <div class="modal-head">
      <strong>Welcome</strong>
      <button class="nav-icon close-auth" aria-label="Close">${iconHamburger().replace('18h18','6h6')}</button>
    </div>
    <div class="modal-tabs">
      <button class="tab-btn active" data-tab="signin">Sign in</button>
      <button class="tab-btn" data-tab="create">Create account</button>
    </div>
    <div class="modal-body">
      <div class="pane signin">
        <form id="magic-link-form">
          <input class="input" type="email" name="email" placeholder="Email for magic link" required />
          <button class="btn primary" type="submit">Send magic link</button>
        </form>
        <div class="or">or</div>
        <button class="oauth" type="button">Continue with Google</button>
        <button class="oauth" type="button">Continue with Apple</button>
        <details style="margin-top:10px">
          <summary>Use email & password</summary>
          <form id="password-form" style="margin-top:8px">
            <input class="input" type="email" name="email" placeholder="Email" required />
            <input class="input" type="password" name="password" placeholder="Password" required />
            <button class="btn" type="submit">Sign in</button>
          </form>
        </details>
      </div>
      <div class="pane create" hidden>
        <form id="create-form">
          <input class="input" name="name" placeholder="Full name" required />
          <input class="input" type="email" name="email" placeholder="Email" required />
          <input class="input" type="password" name="password" placeholder="Password" required />
          <button class="btn primary" type="submit">Create account</button>
        </form>
      </div>
    </div>
  </div>
</div>`;
}

// ---------- pages ----------
function homeMain() {
  return `
<section class="hero">
  <div class="container">
    <h1>Busy? Leave it to Buds.</h1>
    <p>Reliable local help for windows, lawns & gardens, and dump runs — powered by community.</p>
    <div class="actions">
      <a class="btn primary" href="${hrefFor('Services & Pricing')}">See services & pricing</a>
      <a class="btn ghost" href="${hrefFor('Get Involved')}">Get involved</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2>Services & Pricing</h2>
    <div class="grid-3">
      <div class="card"><h3>Window Cleaning</h3><p>Streak-free residential & commercial.</p><div class="price">from $80</div></div>
      <div class="card"><h3>Lawn & Garden</h3><p>Mowing, edging, hedges, tidy-ups.</p><div class="price">from $50/hr</div></div>
      <div class="card"><h3>Dump Runs</h3><p>Rubbish & green waste removal.</p><div class="price">from $80/m³</div></div>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="container">
    <h2>Recent Work</h2>
    <div class="work-grid">
      <div class="work"></div><div class="work"></div><div class="work"></div>
      <div class="work"></div><div class="work"></div><div class="work"></div>
    </div>
  </div>
</section>
`;
}

function aboutMain(){
  return `
<section class="section">
  <div class="container">
    <h1>About Us</h1>
    <p>We’re a local team focused on friendly service, fair pricing, and community impact.</p>
  </div>
</section>`;
}

function servicesMain(){
  return `
<section class="section">
  <div class="container">
    <h1>Services & Pricing</h1>
    <div class="grid-3">
      <div class="card"><h3>Window Cleaning</h3><p>Interior & exterior, frames & tracks.</p><div class="price">from $80</div></div>
      <div class="card"><h3>Lawn & Garden</h3><p>Mowing, edging, hedges, tidy-ups.</p><div class="price">from $50/hr</div></div>
      <div class="card"><h3>Dump Runs</h3><p>Rubbish & green waste removal.</p><div class="price">from $80/m³</div></div>
    </div>
  </div>
</section>`;
}

function shopMain(){
  return `
<section class="section">
  <div class="container">
    <h1>Shop</h1>
    <p class="muted">Products coming soon.</p>
  </div>
</section>`;
}

function getInvolvedMain(){
  return `
<section class="section">
  <div class="container">
    <h1>Get Involved</h1>
    <p>Volunteer, partner, or refer someone who could use a hand. Replace the placeholder below with your file’s HTML if you have it.</p>
    <!-- REPLACE_ME_GET_INVOLVED_HTML -->
  </div>
</section>`;
}

function cartMain(){
  return `
<section class="section">
  <div class="container">
    <h1>Your Cart</h1>
    <p class="muted">Your cart is empty.</p>
  </div>
</section>`;
}

// ---------- JS shared on all pages ----------
function appJS(active){
  return `(() => {
  // Auth state (demo): store email in localStorage to simulate sign-in
  const authEmail = localStorage.getItem('buds_auth_email') || '';
  const signBtn = document.querySelector('.sign-in-btn');
  const account = document.querySelector('details.account');
  const signLabel = document.querySelector('.sign-in-label');
  function setAuthed(email){
    if(email){
      localStorage.setItem('buds_auth_email', email);
      signBtn?.classList.add('hidden');
      account?.classList.remove('hidden');
    } else {
      localStorage.removeItem('buds_auth_email');
      account?.classList.add('hidden');
      signBtn?.classList.remove('hidden');
      signLabel && (signLabel.textContent = 'Sign in');
    }
  }
  if(authEmail) setAuthed(authEmail);

  // Account dropdown actions
  document.querySelector('.logout')?.addEventListener('click', ()=>{ setAuthed(''); location.reload(); });

  // Mobile menu
  const ham = document.querySelector('.hamburger');
  const menu = document.querySelector('.mobile-menu');
  ham?.addEventListener('click', ()=>{
    const open = menu?.hasAttribute('hidden') ? false : true;
    if(open){ menu.setAttribute('hidden',''); ham.setAttribute('aria-expanded','false'); menu.classList.remove('open'); }
    else { menu.removeAttribute('hidden'); ham.setAttribute('aria-expanded','true'); menu.classList.add('open'); }
  });
  window.addEventListener('resize', ()=>{ if(window.innerWidth>900){ menu?.setAttribute('hidden',''); ham?.setAttribute('aria-expanded','false'); menu?.classList.remove('open'); } });

  // Sign in modal
  const modal = document.getElementById('auth-modal');
  const openAuth = () => modal?.classList.remove('hidden');
  const closeAuth = () => modal?.classList.add('hidden');
  signBtn?.addEventListener('click', openAuth);
  modal?.addEventListener('click', (e)=>{ if(e.target===modal) closeAuth(); });
  document.querySelector('.close-auth')?.addEventListener('click', closeAuth);

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(b=>{
    b.addEventListener('click', ()=>{
      document.querySelectorAll('.tab-btn').forEach(t=>t.classList.remove('active'));
      b.classList.add('active');
      const tab = b.getAttribute('data-tab');
      document.querySelector('.pane.signin')?.toggleAttribute('hidden', tab!=='signin');
      document.querySelector('.pane.create')?.toggleAttribute('hidden', tab!=='create');
    });
  });

  // Magic link (demo)
  document.getElementById('magic-link-form')?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = new FormData(e.target).get('email');
    alert('Magic link sent to '+email+'. (Demo) You are now signed in.');
    setAuthed(String(email||''));
    closeAuth();
  });

  // Password fallback (demo)
  document.getElementById('password-form')?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = new FormData(e.target).get('email');
    setAuthed(String(email||''));
    closeAuth();
  });

  // Create account (demo)
  document.getElementById('create-form')?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = new FormData(e.target).get('email');
    alert('Account created for '+email+'.');
    setAuthed(String(email||''));
    closeAuth();
  });

  // Active link underline
  document.querySelectorAll('.nav-center a').forEach(a=>{
    if(a.classList.contains('on')) a.style.textDecoration='underline';
  });
})();`
}

// ---------- templating ----------
function baseDoc(title, active, mainHTML){
  const css = baseCSS({ primary: "#0f3d2e", accent: "#c9a227", paper: "#fffef8" });
  const header = headerHTML(active);
  const modal = signInModalHTML();
  const footer = footerHTML();
  const js = appJS(active);
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title} — Buds at Work</title><meta name="theme-color" content="#0f3d2e"/>
<style>${css}</style>
</head><body>
${header}
${mainHTML}
${footer}
${modal}
<script>${js}<\/script>
</body></html>`;
}

function hrefFor(name){
  switch(name){
    case "Home": return "index.html";
    case "About Us": return "about.html";
    case "Services & Pricing": return "services.html";
    case "Shop": return "shop.html";
    case "Get Involved": return "get-involved.html";
    case "Cart": return "cart.html";
    case "Orders": return "#";
    case "Bookings": return "#";
    case "Payments": return "#";
    default: return "index.html";
  }
}

// ---------- build ----------
function ensureDir(p){ fs.mkdirSync(p, { recursive: true }); }
function writeFile(p, content){ ensureDir(path.dirname(p)); fs.writeFileSync(p, content); }

function main(){
  const prompt = getPrompt(); // not required for the header; kept for future tweaks
  const dist = path.join(process.cwd(), "dist");
  ensureDir(dist);

  writeFile(path.join(dist, "index.html"),        baseDoc("Home", "Home", homeMain()));
  writeFile(path.join(dist, "about.html"),        baseDoc("About Us", "About Us", aboutMain()));
  writeFile(path.join(dist, "services.html"),     baseDoc("Services & Pricing", "Services & Pricing", servicesMain()));
  writeFile(path.join(dist, "shop.html"),         baseDoc("Shop", "Shop", shopMain()));
  writeFile(path.join(dist, "get-involved.html"), baseDoc("Get Involved", "Get Involved", getInvolvedMain()));
  writeFile(path.join(dist, "cart.html"),         baseDoc("Cart", "Home", cartMain()));

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n**Built pages:** index, about, services, shop, get-involved, cart\n`);
  }
}
main();
