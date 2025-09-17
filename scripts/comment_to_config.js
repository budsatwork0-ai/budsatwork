#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function readEvent() {
  try {
    const p = process.env.GITHUB_EVENT_PATH;
    if (!p || !fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch { return null; }
}

function loadConfig() {
  const p = path.join(process.cwd(), "site.json");
  if (!fs.existsSync(p)) return {};
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return {}; }
}

function saveConfig(cfg) {
  fs.writeFileSync("site.json", JSON.stringify(cfg, null, 2));
}

function pick(hex, fallback){ return hex || fallback; }

function applyFromText(text, cfg) {
  const t = (text || "").toLowerCase();

  cfg.brand ||= "Buds at Work";
  cfg.colors ||= {};
  cfg.features ||= {};
  cfg.contact ||= {};
  cfg.services ||= [];

  const mBrand = t.match(/rename\s+brand\s+to\s+(.+?)(;|$)/);
  if (mBrand) cfg.brand = mBrand[1].trim();

  if (/\bcoral\b/.test(t)) cfg.colors.accent = "#ef5350";
  if (/\bmustard\b|\byellow\b/.test(t)) cfg.colors.accent = "#c9a227";
  if (/\bpurple\b/.test(t)) cfg.colors.primary = "#6A1B9A";
  if (/\bgreen\b/.test(t)) cfg.colors.primary = "#0f3d2e";
  if (/\bcream\b|\bivory\b/.test(t)) cfg.colors.paper = "#fff6e8";

  if (/rounded buttons|rounded/.test(t)) cfg.features.roundedButtons = true;
  if (/bigger hero|bigger heading/.test(t)) cfg.features.biggerHero = true;
  if (/add faq\b/.test(t)) cfg.features.faq = true;
  if (/add gallery|add work section/.test(t)) cfg.features.gallery = true;

  const heroUrl = text.match(/hero(?:\s*image)?\s*:\s*(https?:\S+)/i);
  if (heroUrl) cfg.features.heroImage = heroUrl[1];

  const email = text.match(/email\s*:\s*([^\s;]+)/i);
  if (email) cfg.contact.email = email[1];

  const phone = text.match(/phone\s*:\s*([+\d\s()-]+)/i);
  if (phone) cfg.contact.phone = phone[1].trim();

  const serviceLines = text.match(/service\s*:\s*.+/ig) || [];
  serviceLines.forEach(line => {
    const parts = line.split(":")[1].split("|").map(s => s.trim());
    if (parts.length >= 3) {
      const [title, desc, price] = parts;
      cfg.services.push({ title, desc, price });
    }
  });

  while (cfg.services.length < 3) cfg.services.push({ title: "Service", desc: "Description", price: "from $100" });
  cfg.services = cfg.services.slice(0, 3);

  return cfg;
}

function main() {
  const name = process.env.GITHUB_EVENT_NAME || "";
  if (name !== "issue_comment") return; // only act on comments
  const evt = readEvent();
  const body = evt?.comment?.body || "";
  if (!/^\s*\/(deploy|design)\b/i.test(body)) return;

  const text = body.replace(/^\s*\/(deploy|design)\s*/i, "");
  const cfg = loadConfig();
  const updated = applyFromText(text, cfg);
  saveConfig(updated);

  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (summary) {
    fs.appendFileSync(summary, `\n**Applied prompt to site.json**\n\n\`\`\`txt\n${text}\n\`\`\`\n`);
  }
}

main();
