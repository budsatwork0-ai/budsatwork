[README.md](https://github.com/user-attachments/files/22249436/README.md)
# Buds at Work — Static Site

This repository contains the **Buds at Work** single-page site (hash-based routing) built with plain HTML/CSS/JS. It’s optimized for GitHub Pages: no build step and no server required.

## Quick Start
1. Open `index.html` locally to preview.
2. Optional: serve locally with any static server (e.g., `python -m http.server`).

## Deploy to GitHub Pages
1. Create a **public** GitHub repository (e.g., `buds-at-work-site`).
2. Add `index.html`, `README.md`, `.nojekyll`, and any images/assets to the repo **root**.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch** → `main` → `/ (root)` → **Save**.
5. The site will be available at  
   `https://<your-username>.github.io/<repo-name>/`

### Custom domain (optional)
- In **Settings → Pages**, set your custom domain (e.g., `budsatwork.com`).
- Add the appropriate DNS records with your domain registrar, then commit a `CNAME` file containing the domain.
- DNS changes can take time to propagate.

## Stripe (optional)
The site supports client-side Stripe Checkout. Edit the top of `index.html`:
- `STRIPE_PUBLISHABLE_KEY` – your publishable key
- `PRICE_MAP` – Stripe Price IDs per product
- `STRIPE_PAYMENT_LINK` – alternative: a single Payment Link URL

GitHub Pages is static hosting; if you need webhooks or server-side features, you’ll deploy a separate backend.

## Project Structure
```
/ (repo root)
├── index.html      # main site
├── README.md       # this file
├── .nojekyll       # ensures GitHub Pages serves files as-is
└── assets/         # (optional) images and other static files
```

## License
Choose a license if you want others to reuse code (e.g., MIT).
