// scripts/generate_site.js
// ESM static site generator -> writes HTML files into dist/
// Usage: node scripts/generate_site.js [--prompt "your blurb"]

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = process.cwd();
const DIST       = path.join(ROOT, "dist");
const CONFIG     = path.join(ROOT, "site.json");

// ---- prompt arg (optional) ---------------------------------------------------
function getPromptArg() {
  const idx = process.argv.indexOf("--prompt");
  if (idx !== -1 && process.argv[idx + 1]) return String(process.argv[idx + 1]);
  const kv = process.argv.find(a => a.startsWith("--prompt="));
  if (kv) return kv.split("=").slice(1).join("=");
  return "";
}
const USER_PROMPT = getPromptArg().trim();

// ---- read config with fallbacks ---------------------------------------------
async function loadConfig() {
  let cfg = {};
  try {
    const raw = await fsp.readFile(CONFIG, "utf8");
    cfg = JSON.parse(raw);
  } catch {
    // no site.json or invalid JSON -> use defaults
  }
  // defaults + shallow merge
  const defaults = {
    brand: "Buds at Work",
    email: "budsatwork@malucare.org",
    phone: "0474 766 703",
    colors: {
      green:  "#003A34",
      cream:  "#FAF0D9",
      mustard:"#E7A637",
      text:   "#0f172a",
      muted:  "#64748b"
    },
    nav: [
      { label: "Home",               href: "index.html" },
      { label: "About",              href: "about.html" },
      { label: "Services & Pricing", href: "services.html" },
      { label: "Shop",               href: "shop.html" },
      { label: "Get Involved",       href: "get-involved.html" }
    ],
    services: [
      { name:"Car Cleaning & Detailing", price:"from $80",    blurb:"Interior & exterior detailing that shines." },
      { name:"Home Cleaning",            price:"from $50/hr", blurb:"Reliable, thorough, flexible schedules." },
      { name:"Dump Runs",                price:"from $80/m³", blurb:"Rubbish & green waste removal, fast." },
      { name:"Lawn & Garden",            price:"from $50",    blurb:"Mowing, edging, hedges, tidy-ups." },
      { name:"Window Cleaning",          price:"quote",       blurb:"Streak-free residential & commercial." },
    ],
    shop: [
      { name:"BAW Tee",       tag:"Streetwear drop 01" },
      { name:"Sticker Pack",  tag:"The Buds Were Here" },
      { name:"Dad Cap",       tag:"Clean & subtle" },
    ]
  };

  // shallow merges for top level and some arrays/objects
  const merged = {
    ...defaults,
    ...cfg,
    colors: { ...defaults.colors, ...(cfg.colors||{}) },
    nav: Array.isArray(cfg.nav) && cfg.nav.length ? cfg.nav : defaults.nav,
    services: Array.isArray(cfg.services)&&cfg.services.length ? cfg.services : defaults.services,
    shop: Array.isArray(cfg.shop)&&cfg.shop.length ? cfg.shop : defaults.shop
  };
  return merged;
}

// ---- tiny HTML helpers -------------------------------------------------------
function esc(s = "") { return String(s).replace(/[&<>"']/g, m => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[m])); }

// Tailwind via CDN; brand colors injected as CSS variables for easy reuse
function baseHead(cfg, title, description) {
  const d = esc(description);
  return `
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} • ${esc(cfg.brand)}</title>
<meta name="description" content="${d}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' rx='12' fill='%23E7A637'/%3E%3Ctext x='50%25' y='56%25' font-size='36' text-anchor='middle'%3E%F0%9F%8C%B1%3C/text%3E%3C/svg%3E">

<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: { extend: {
      colors: {
        brand: {
          green: '${cfg.colors.green}',
          cream: '${cfg.colors.cream}',
          mustard: '${cfg.colors.mustard}'
        }
      }
    } }
  }
</script>
`.trim();
}

function headerHTML(cfg, activeHref) {
  const link = (item) => {
    const isActive = item.href === activeHref;
    const cls = "hover:underline " + (isActive ? "font-semibold" : "opacity-90");
    return `<a class="${cls}" href="${esc(item.href)}">${esc(item.label)}</a>`;
  };
  return `
<header class="bg-[${cfg.colors.green}] text-[${cfg.colors.cream}] border-b border-white/10">
  <div class="max-w-5xl mx-auto h-16 px-4 flex items-center justify-between gap-4">
    <a href="index.html" class="flex items-center gap-2 font-bold">
      <span class="inline-block w-6 h-6 rounded bg-[${cfg.colors.mustard}]"></span>
      <span>${esc(cfg.brand)}</span>
    </a>
    <nav class="hidden md:flex items-center gap-5">
      ${cfg.nav.map(link).join("")}
    </nav>
    <div class="flex items-center gap-2">
      <a href="services.html#quote" class="inline-flex items-center gap-2 font-semibold rounded-xl border border-black/5 bg-[${cfg.colors.mustard}] text-black px-3 py-2">
        <span class="w-2 h-2 rounded-full bg-black/40"></span> Book now
      </a>
      <a class="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 bg-white/10" href="cart.html" aria-label="Cart">🛒</a>
    </div>
  </div>
</header>
`.trim();
}

function footerHTML(cfg) {
  return `
<footer class="mt-16 bg-[#0f1f1c] text-[${cfg.colors.cream}]">
  <div class="max-w-5xl mx-auto px-4 py-8">
    <div class="flex items-center gap-2 mb-1">
      <span class="inline-block w-6 h-6 rounded bg-[${cfg.colors.mustard}]"></span>
      <strong>${esc(cfg.brand)}</strong>
    </div>
    <p class="text-white/70">Email: ${esc(cfg.email)} · Phone: ${esc(cfg.phone)}</p>
    <div class="flex flex-wrap gap-4 mt-3">
      ${cfg.nav.map(n => `<a class="text-white/80 hover:underline" href="${esc(n.href)}">${esc(n.label)}</a>`).join("")}
    </div>
  </div>
</footer>
`.trim();
}

function basePage(cfg, {title, h1, activeHref, mainHTML}) {
  const desc = USER_PROMPT || `${cfg.brand} — inclusive work, real-world jobs, and a community that backs each other.`;
  return `
<!doctype html>
<html lang="en">
<head>
${baseHead(cfg, title, desc)}
</head>
<body class="bg-[${cfg.colors.cream}] text-[${cfg.colors.green}]">
  ${headerHTML(cfg, activeHref)}
  <main>
    <section class="py-16 bg-black/0">
      <div class="max-w-5xl mx-auto px-4">
        <h1 class="text-3xl font-bold mb-2">${esc(h1)}</h1>
        <p class="text-[${cfg.colors.green}] opacity-80">${esc(desc)}</p>
      </div>
    </section>
    <div class="max-w-5xl mx-auto px-4">
      ${mainHTML}
    </div>
  </main>
  ${footerHTML(cfg)}
</body>
</html>
`.trim();
}

// ---- page bodies -------------------------------------------------------------
function homeSection(cfg) {
  const cards = cfg.services.slice(0,3).map(s => `
  <div class="bg-white border border-black/10 rounded-xl p-4">
    <h3 class="font-semibold">${esc(s.name)}</h3>
    <div class="text-sm text-[${cfg.colors.muted}] mb-1">${esc(s.price)}</div>
    <p class="text-[${cfg.colors.green}] opacity-90 mb-2">${esc(s.blurb)}</p>
    <div class="flex gap-2 text-sm">
      <a class="px-2 py-1 rounded-full bg-gray-100 border border-gray-200" href="services.html#quote">Book now</a>
      <span class="px-2 py-1 rounded-full bg-gray-100 border border-gray-200">Add to quote</span>
    </div>
  </div>`).join("");

  return `
<section class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
  ${cards}
</section>
<p class="text-[${cfg.colors.muted}] mt-4">Shop purchases are immediate checkout. Service bookings go to a quote.</p>
`.trim();
}

function aboutSection(cfg) {
  return `
<div class="bg-white border border-black/10 rounded-xl p-5">
  <h3 class="font-semibold mb-2">Two mates, one mission</h3>
  <p class="opacity-90">We’re building real opportunities through real jobs. Our work empowers, and our services shine.</p>
  <p class="text-[${cfg.colors.muted}] mt-2">Brisbane-based and proud to support our local community.</p>
</div>
`.trim();
}

function servicesSection(cfg) {
  const li = cfg.services.map(s => `
  <li><strong>${esc(s.name)}</strong> — ${esc(s.price)} <span class="opacity-80">· ${esc(s.blurb)}</span></li>`).join("");
  return `
<div class="grid md:grid-cols-2 gap-4">
  <div class="bg-white border border-black/10 rounded-xl p-5">
    <h3 class="font-semibold mb-2">Services & Pricing</h3>
    <p class="text-[${cfg.colors.muted}] mb-2">Pricing is indicative only. When you “Book now”, we collect details to generate a <strong>quote</strong> — not a final charge.</p>
    <ul class="space-y-1">${li}</ul>
  </div>
  <div class="bg-white border border-black/10 rounded-xl p-5" id="quote">
    <h3 class="font-semibold mb-2">Request a Quote</h3>
    <p class="text-[${cfg.colors.muted}] mb-3">Tell us about the job — we’ll text and email you a quote.</p>
    <form onsubmit="event.preventDefault(); alert('Thanks! We\\'ll be in touch with your quote.');" class="space-y-3">
      <div class="grid sm:grid-cols-2 gap-2">
        <input aria-label="Preferred date" placeholder="Preferred date" class="w-full px-3 py-2 rounded-lg border border-gray-200">
        <input aria-label="Preferred time" placeholder="Preferred time" class="w-full px-3 py-2 rounded-lg border border-gray-200">
      </div>
      <input aria-label="Property address" placeholder="Property address" class="w-full px-3 py-2 rounded-lg border border-gray-200">
      <textarea aria-label="Property details" placeholder="Property details (size, access, notes)" rows="4" class="w-full px-3 py-2 rounded-lg border border-gray-200"></textarea>
      <div class="grid sm:grid-cols-2 gap-2">
        <input aria-label="Email" placeholder="Email for confirmation" class="w-full px-3 py-2 rounded-lg border border-gray-200">
        <input aria-label="Mobile" placeholder="Mobile (for SMS updates)" class="w-full px-3 py-2 rounded-lg border border-gray-200">
      </div>
      <button class="inline-flex items-center gap-2 font-semibold rounded-xl border border-black/5 bg-[${cfg.colors.mustard}] text-black px-4 py-2">
        <span class="w-2 h-2 rounded-full bg-black/40"></span> Submit for quote
      </button>
    </form>
  </div>
</div>
`.trim();
}

function shopSection(cfg) {
  const cards = cfg.shop.map(p => `
  <div class="bg-white border border-black/10 rounded-xl p-4">
    <h3 class="font-semibold">${esc(p.name)}</h3>
    <p class="text-sm text-[${cfg.colors.muted}] mb-2">${esc(p.tag||"")}</p>
    <div class="flex gap-2 text-sm">
      <span class="px-2 py-1 rounded-full bg-gray-100 border border-gray-200">Add to cart</span>
      <span class="px-2 py-1 rounded-full bg-gray-100 border border-gray-200">Details</span>
    </div>
  </div>`).join("");

  return `<section class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">${cards}</section>`;
}

function involvedSection() {
  return `
<div class="grid md:grid-cols-2 gap-4">
  <div class="bg-white border border-black/10 rounded-xl p-5">
    <h3 class="font-semibold">Partner / Host</h3>
    <p class="opacity-90">RTOs, local trades, and community groups — let’s build inclusive work pathways.</p>
    <div class="mt-3"><span class="px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-sm">Expression of interest</span></div>
  </div>
  <div class="bg-white border border-black/10 rounded-xl p-5">
    <h3 class="font-semibold">Sponsor Impact</h3>
    <p class="text-gray-600">Simple, transparent outcomes. Monthly onboarding goals. Real stories.</p>
    <div class="mt-3 flex gap-2 text-sm">
      <span class="px-2 py-1 rounded-full bg-gray-100 border border-gray-200">See impact</span>
      <span class="px-2 py-1 rounded-full bg-gray-100 border border-gray-200">Donate</span>
    </div>
  </div>
</div>
`.trim();
}

function cartSection() {
  return `
<div class="bg-white border border-black/10 rounded-xl p-5">
  <h3 class="font-semibold">Your Cart</h3>
  <p class="text-gray-600">Cart is for shop items only. Service bookings are quoted via the request form.</p>
  <div class="mt-3 flex gap-2 text-sm">
    <span class="px-2 py-1 rounded-full bg-gray-100 border border-gray-200">Checkout</span>
    <a class="px-2 py-1 rounded-full bg-gray-100 border border-gray-200" href="shop.html">Back to shop</a>
  </div>
</div>
`.trim();
}

// ---- write pages -------------------------------------------------------------
async function writePage(file, html) {
  await fsp.writeFile(path.join(DIST, file), html, "utf8");
  console.log("✓", file);
}

async function main() {
  const cfg = await loadConfig();
  await fsp.mkdir(DIST, { recursive: true });

  await writePage("index.html",        basePage(cfg, { title:"Home",               h1:"Home",               activeHref:"index.html",        mainHTML: homeSection(cfg) }));
  await writePage("about.html",        basePage(cfg, { title:"About",              h1:"About Us",           activeHref:"about.html",        mainHTML: aboutSection(cfg) }));
  await writePage("services.html",     basePage(cfg, { title:"Services & Pricing", h1:"Services & Pricing", activeHref:"services.html",     mainHTML: servicesSection(cfg) }));
  await writePage("shop.html",         basePage(cfg, { title:"Shop",               h1:"Shop",               activeHref:"shop.html",         mainHTML: shopSection(cfg) }));
  await writePage("get-involved.html", basePage(cfg, { title:"Get Involved",       h1:"Get Involved",       activeHref:"get-involved.html", mainHTML: involvedSection() }));
  await writePage("cart.html",         basePage(cfg, { title:"Cart",               h1:"Cart",               activeHref:"cart.html",         mainHTML: cartSection() }));

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, "\n**Built pages:** index, about, services, shop, get-involved, cart\n");
  }
}

main().catch(err => {
  console.error("Build failed:", err);
  process.exitCode = 1;
});
