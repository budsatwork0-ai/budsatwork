// scripts/generate_site.js
// ESM static site generator for Buds at Work (simplified)
// Builds: dist/index.html, about.html, services.html, shop.html, get-involved.html, cart.html

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ---------- helpers ----------
async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}
async function writeFile(p, data) {
  await ensureDir(path.dirname(p));
  await fsp.writeFile(p, data, "utf8");
  console.log("✓ wrote", path.relative(process.cwd(), p));
}

const dist = path.join(__dirname, "..", "dist");

// ---------- site config ----------
const SITE = {
  brand: "Buds at Work",
  email: "budsatwork@malucare.org",
  phone: "0474 766 703",
  palette: {
    green: "#003A34",
    cream: "#FAF0E6",
    mustard: "#E7A637",
    text: "#1a1a1a",
    muted: "#6b7280",
    white: "#ffffff",
  },
  pages: [
    { title: "Home",             file: "index.html",        label: "Home" },
    { title: "About Us",         file: "about.html",        label: "About Us" },
    { title: "Services & Pricing", file: "services.html",   label: "Services & Pricing" },
    { title: "Shop",             file: "shop.html",         label: "Shop" },
    { title: "Get Involved",     file: "get-involved.html", label: "Get Involved" },
    { title: "Cart",             file: "cart.html",         label: "Cart" },
  ],
};

// ---------- routing helpers ----------
function hrefFor(label) {
  switch (label) {
    case "Home": return "index.html";
    case "About Us": return "about.html";
    case "Services & Pricing": return "services.html";
    case "Shop": return "shop.html";
    case "Get Involved": return "get-involved.html";
    case "Cart": return "cart.html";
    default: return "#";
  }
}

// ---------- layout ----------
function baseCSS() {
  const { green, cream, mustard, text, muted, white } = SITE.palette;
  return `
:root{
  --green:${green};
  --cream:${cream};
  --mustard:${mustard};
  --text:${text};
  --muted:${muted};
  --white:${white};
}

*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
  color:var(--text);
  background:var(--cream);
}

.container{max-width:1100px;margin:0 auto;padding:0 16px}
.muted{color:var(--muted)}

/* Header */
.site-header{
  background:var(--green);
  color:var(--cream);
  position:sticky;top:0;z-index:20;
  border-bottom:1px solid rgba(255,255,255,.08);
}
.header-inner{
  display:flex;align-items:center;justify-content:space-between;gap:16px;
  height:64px;
}
.brand{
  display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--cream);
  font-weight:700;letter-spacing:.2px;
}
.logo-icon{
  width:28px;height:28px;border-radius:7px;background:var(--mustard);
  display:inline-block;flex-shrink:0;
}

.nav{
  display:flex;align-items:center;gap:18px;
}
.nav a{
  color:var(--cream);text-decoration:none;font-weight:500;opacity:.95;
}
.nav a:hover{opacity:1;text-decoration:underline}

/* Book Now button */
.btn-book{
  background:var(--mustard); color:#1b1b1b; text-decoration:none;
  padding:10px 14px;border-radius:10px;font-weight:700;display:inline-flex;align-items:center;gap:8px;
  border:1px solid rgba(0,0,0,.05);
}
.btn-book:active{transform:translateY(1px)}
.btn-book .dot{width:8px;height:8px;border-radius:999px;background:#1b1b1b;opacity:.4}

/* Icons group */
.icons{display:flex;align-items:center;gap:14px}
.icon-btn{
  width:34px;height:34px;border-radius:10px;background:rgba(255,255,255,.08);
  display:inline-flex;align-items:center;justify-content:center;color:var(--cream);
  text-decoration:none;border:1px solid rgba(255,255,255,.08)
}
.icon-btn:hover{background:rgba(255,255,255,.12)}

/* Mobile */
.hamburger{display:none}
.mobile-menu{
  display:none;background:var(--green);padding:10px 0;border-top:1px solid rgba(255,255,255,.1)
}
.mobile-menu a{display:block;padding:12px 16px;color:var(--cream);text-decoration:none}
.mobile-menu .mobile-book{padding:12px 16px}

@media (max-width:860px) {
  .nav{display:none}
  .hamburger{display:inline-flex}
  .icons .btn-book{display:none}
}

/* Sections */
.hero{
  padding:80px 0;background:linear-gradient(0deg, rgba(0,0,0,.02), rgba(0,0,0,0));
}
h1{font-size:36px;margin:0 0 10px}
h2{font-size:28px;margin:24px 0 12px}
p{line-height:1.6}

/* Cards */
.grid{display:grid;gap:14px}
.grid.cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.grid.cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
@media (max-width:860px){ .grid.cols-3{grid-template-columns:1fr} .grid.cols-2{grid-template-columns:1fr} }

.card{
  background:var(--white);border:1px solid rgba(0,0,0,.07);border-radius:14px;padding:16px;
  box-shadow:0 1px 0 rgba(0,0,0,.03);
}
.card h3{margin:0 0 6px}
.card .sub{color:var(--muted);font-size:14px;margin-bottom:10px}
.card .row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.card .chip{
  font-size:12px;padding:4px 8px;border-radius:999px;background:#f3f4f6;border:1px solid #e5e7eb;
}

/* Footer */
.site-footer{
  margin-top:60px;padding:24px 0;background:#0e1e1c;color:var(--cream)
}
.footer-links{display:flex;gap:16px;flex-wrap:wrap}
.footer-links a{color:var(--cream);opacity:.9;text-decoration:none}
.footer-links a:hover{opacity:1;text-decoration:underline}
`.trim();
}

function headerHTML() {
  return `
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="${hrefFor('Home')}">
      <span class="logo-icon" aria-hidden="true"></span>
      <span>${SITE.brand}</span>
    </a>

    <nav class="nav" aria-label="Primary">
      <a href="${hrefFor('Home')}">Home</a>
      <a href="${hrefFor('About Us')}">About Us</a>
      <a href="${hrefFor('Services & Pricing')}">Services & Pricing</a>
      <a href="${hrefFor('Get Involved')}">Get Involved</a>
      <a href="${hrefFor('Shop')}">Shop</a>
    </nav>

    <div class="icons">
      <a class="btn-book" href="${hrefFor('Services & Pricing')}#quote">
        <span class="dot" aria-hidden="true"></span>
        Book now
      </a>
      <a class="icon-btn" href="${hrefFor('Cart')}" aria-label="Cart">🛒</a>
      <a class="icon-btn" href="#" aria-label="Profile">👤</a>
      <button class="icon-btn hamburger" aria-expanded="false" aria-label="Open menu">☰</button>
    </div>
  </div>
  <div class="mobile-menu" id="mobileMenu">
    <a href="${hrefFor('Home')}">Home</a>
    <a href="${hrefFor('About Us')}">About Us</a>
    <a href="${hrefFor('Services & Pricing')}">Services & Pricing</a>
    <a href="${hrefFor('Get Involved')}">Get Involved</a>
    <a href="${hrefFor('Shop')}">Shop</a>
    <div class="mobile-book">
      <a class="btn-book" href="${hrefFor('Services & Pricing')}#quote"><span class="dot"></span> Book now</a>
    </div>
  </div>
</header>
  `.trim();
}

function footerHTML(){
  return `
<footer class="site-footer">
  <div class="container">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
      <span class="logo-icon" aria-hidden="true"></span>
      <strong>${SITE.brand}</strong>
    </div>
    <p class="muted">Email: ${SITE.email} · Phone: ${SITE.phone}</p>
    <div class="footer-links" style="margin-top:8px">
      <a href="${hrefFor('Home')}">Home</a>
      <a href="${hrefFor('About Us')}">About Us</a>
      <a href="${hrefFor('Services & Pricing')}">Services & Pricing</a>
      <a href="${hrefFor('Get Involved')}">Get Involved</a>
      <a href="${hrefFor('Shop')}">Shop</a>
    </div>
  </div>
</footer>
  `.trim();
}

function baseDoc(title, h1, mainHTML){
  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} • ${SITE.brand}</title>
  <meta name="description" content="${SITE.brand} – Services that shine. Busy? Leave it to Buds.">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' rx='12' fill='%23E7A637'/%3E%3Ctext x='50%25' y='54%25' font-size='36' text-anchor='middle'%3E%F0%9F%8C%B1%3C/text%3E%3C/svg%3E">
  <style>${baseCSS()}</style>
</head>
<body>
  ${headerHTML()}
  <main>
    <section class="hero">
      <div class="container">
        <h1>${h1}</h1>
        <p class="muted">Busy? Leave it to Buds — inclusive work, real-world jobs, and a community that backs each other.</p>
      </div>
    </section>
    <div class="container">${mainHTML}</div>
  </main>
  ${footerHTML()}
  <script>
    // mobile menu toggle
    const btn = document.querySelector('.hamburger');
    const menu = document.getElementById('mobileMenu');
    if (btn && menu) {
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        menu.style.display = open ? 'none' : 'block';
      });
    }
  </script>
</body>
</html>
  `.trim();
}

// ---------- page content ----------
function homeMain(){
  return `
<div class="grid cols-3">
  <div class="card">
    <h3>Car Cleaning & Detailing</h3>
    <div class="sub">From $80</div>
    <p>Professional interior & exterior cleaning that makes your pride and joy sparkle.</p>
    <div class="row">
      <span class="chip">Add to quote</span>
      <a class="chip" href="services.html#quote">Book now</a>
    </div>
  </div>
  <div class="card">
    <h3>Home Cleaning</h3>
    <div class="sub">From $50/hr</div>
    <p>Reliable, thorough home cleaning. Flexible schedules and friendly service.</p>
    <div class="row">
      <span class="chip">Add to quote</span>
      <a class="chip" href="services.html#quote">Book now</a>
    </div>
  </div>
  <div class="card">
    <h3>Dump Runs</h3>
    <div class="sub">From $80/m³</div>
    <p>Rubbish & green waste removal done right—fast and affordable.</p>
    <div class="row">
      <span class="chip">Add to quote</span>
      <a class="chip" href="services.html#quote">Book now</a>
    </div>
  </div>
</div>
  `.trim();
}

function aboutMain(){
  return `
<div class="card">
  <h3>Two mates, one mission</h3>
  <p>We’re building real opportunities through real jobs. Our work empowers, and our services shine.</p>
  <p class="muted">We’re Brisbane-based and proud to support our local community.</p>
</div>
  `.trim();
}

function servicesMain(){
  return `
<div class="grid cols-2">
  <div class="card">
    <h3>Services & Pricing</h3>
    <p class="muted">Pricing is indicative only. When you “Book now”, we collect details to generate a <strong>quote</strong> — not a final charge.</p>
    <ul>
      <li><strong>Car Cleaning & Detailing</strong> — from $80</li>
      <li><strong>Home Cleaning</strong> — from $50/hr</li>
      <li><strong>Dump Runs</strong> — from $80/m³</li>
      <li><strong>Lawn & Garden</strong> — from $50</li>
      <li><strong>Window Cleaning</strong> — contact for quote</li>
    </ul>
  </div>
  <div class="card" id="quote">
    <h3>Request a Quote</h3>
    <p class="muted">Tell us about the job — we’ll text and email you a quote.</p>
    <form onsubmit="event.preventDefault(); alert('Thanks! We\\'ll be in touch with your quote.');">
      <div class="row">
        <input aria-label="Preferred date" placeholder="Preferred date" style="flex:1;padding:10px;border-radius:10px;border:1px solid #e5e7eb">
        <input aria-label="Preferred time" placeholder="Preferred time" style="flex:1;padding:10px;border-radius:10px;border:1px solid #e5e7eb">
      </div>
      <div style="height:10px"></div>
      <input aria-label="Property address" placeholder="Property address" style="width:100%;padding:10px;border-radius:10px;border:1px solid #e5e7eb">
      <div style="height:10px"></div>
      <textarea aria-label="Property details" placeholder="Property details (size, access, notes)" rows="4" style="width:100%;padding:10px;border-radius:10px;border:1px solid #e5e7eb"></textarea>
      <div style="height:10px"></div>
      <div class="row">
        <input aria-label="Email" placeholder="Email for confirmation" style="flex:1;padding:10px;border-radius:10px;border:1px solid #e5e7eb">
        <input aria-label="Mobile" placeholder="Mobile (for SMS updates)" style="flex:1;padding:10px;border-radius:10px;border:1px solid #e5e7eb">
      </div>
      <div style="height:14px"></div>
      <button class="btn-book" type="submit"><span class="dot"></span> Submit for quote</button>
    </form>
  </div>
</div>
  `.trim();
}

function shopMain(){
  return `
<div class="grid cols-3">
  <div class="card">
    <h3>BAW Tee</h3>
    <p class="sub">Streetwear drop 01</p>
    <div class="row"><span class="chip">Add to cart</span><span class="chip">Details</span></div>
  </div>
  <div class="card">
    <h3>Sticker Pack</h3>
    <p class="sub">The Buds Were Here</p>
    <div class="row"><span class="chip">Add to cart</span><span class="chip">Details</span></div>
  </div>
  <div class="card">
    <h3>Dad Cap</h3>
    <p class="sub">Clean & subtle</p>
    <div class="row"><span class="chip">Add to cart</span><span class="chip">Details</span></div>
  </div>
</div>
<p class="muted">Shop purchases are immediate checkout. Service bookings go to a quote.</p>
  `.trim();
}

function getInvolvedMain(){
  return `
<div class="grid cols-2">
  <div class="card">
    <h3>Partner / Host</h3>
    <p>RTOs, local trades, and community groups — let’s build inclusive work pathways.</p>
    <div class="row"><span class="chip">Expression of interest</span></div>
  </div>
  <div class="card">
    <h3>Sponsor Impact</h3>
    <p class="muted">Simple, transparent outcomes. Monthly onboarding goals. Real stories.</p>
    <div class="row"><span class="chip">See impact</span><span class="chip">Donate</span></div>
  </div>
</div>
  `.trim();
}

function cartMain(){
  return `
<div class="card">
  <h3>Your Cart</h3>
  <p class="muted">Cart is for shop items only. Service bookings are quoted via the request form.</p>
  <div class="row">
    <span class="chip">Checkout</span>
    <a class="chip" href="shop.html">Back to shop</a>
  </div>
</div>
  `.trim();
}

// ---------- build ----------
async function main(){
  await ensureDir(dist);
  await writeFile(path.join(dist, "index.html"),        baseDoc("Home", "Home", homeMain()));
  await writeFile(path.join(dist, "about.html"),        baseDoc("About Us", "About Us", aboutMain()));
  await writeFile(path.join(dist, "services.html"),     baseDoc("Services & Pricing", "Services & Pricing", servicesMain()));
  await writeFile(path.join(dist, "shop.html"),         baseDoc("Shop", "Shop", shopMain()));
  await writeFile(path.join(dist, "get-involved.html"), baseDoc("Get Involved", "Get Involved", getInvolvedMain()));
  await writeFile(path.join(dist, "cart.html"),         baseDoc("Cart", "Cart", cartMain()));

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `\n**Built pages:** index, about, services, shop, get-involved, cart\n`
    );
  }
}
main().catch(err=>{
  console.error("Build failed:", err);
  process.exitCode = 1;
});
