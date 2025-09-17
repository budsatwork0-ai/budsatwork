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
  } catch {
    return null;
  }
}

function heroNoiseSVG(){
  return `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 0 0.06 0.12 0.16 0.2 0.24 0.28 0.32 0.36 0.4'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.3'/></svg>`;
}

function baseHTML(){
  return `
<header class="site-header" role="banner">
  <div class="container row">
    <div class="brand" aria-label="brand"><span class="dot"></span><strong>Buds at Work</strong></div>
    <nav class="nav" aria-label="primary">
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
  <div class="container">
    <h2>Services & Pricing</h2>
    <div class="grid-3">
      <div class="card"><h3>Window Cleaning</h3><p>Streak-free residential & commercial.</p><div class="price">from $80</div></div>
      <div class="card"><h3>Lawn & Garden</h3><p>Mowing, edging, hedges, tidy-ups.</p><div class="price">from $50/hr</div></div>
      <div class="card"><h3>Dump Runs</h3><p>Rubbish & green waste removal.</p><div class="price">from $80/m³</div></div>
    </div>
  </div>
</section>
<section id="work" class="section alt">
  <div class="container">
    <h2>Recent Work</h2>
    <div class="work-grid">
      <figure class="work ph"></figure>
      <figure class="work ph"></figure>
      <figure class="work ph"></figure>
      <figure class="work ph"></figure>
      <figure class="work ph"></figure>
      <figure class="work ph"></figure>
    </div>
  </div>
</section>
<section class="section">
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
    <form class="contact" aria-label="contact form">
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
:root{ --primary:${primary}; --accent:${accent}; --paper:${paper}; --ink:#18221b; --muted:#495a50; --radius:16px; --shadow:0 10px 30px rgba(0,0,0,.08) }
*{box-sizing:border-box} body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif;color:var(--ink);background:var(--paper)}
.container{max-width:1100px;margin:0 auto;padding:24px}
.row{display:flex;gap:24px;align-items:center;justify-content:space-between}
.grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.site-header{position:sticky;top:0;background:rgba(15,61,46,.95);color:#fff;border-bot

}

main();
