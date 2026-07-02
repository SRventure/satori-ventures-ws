# Satori Ventures — Revamp Brief (2026-07-02)

Goal: most prestige, high-tech VC site on the web. Red & white, world-class UI/UX motion.
Feel: a16z / Paradigm / Sequoia polish but warmer, red-toned. "Quiet gallery, loud brand."

## Design system
- Palette: red `#9B0801` (primary/CTA/accents), maroon `#441611` (headings), warm whites `#FAF8F7` / `#F6F4F2` (sections), body `#6F5D5B`. NO dark theme (owner rejected).
- Type: DM Serif Display (display headings), DM Sans (body), Inter (small UI/labels). Generous line-height, large hero heading.
- Motion: Framer Motion — fade/slide-up scroll reveals, subtle hero parallax, magnetic CTA hover, animated stat counters, portfolio logo marquee. Lenis smooth scroll. ALL motion gated by `prefers-reduced-motion`.

## Info architecture (single page, react-scroll anchors home/about/portfolio/contact)
1. Sticky nav — logo left, anchors + Contact CTA right, blur-on-scroll.
2. Hero — serif headline "Fostering the Blockchain Renaissance", subline, CTA, red-dot globe right.
3. Stats band — animated counters. Headline: "128+ investments (Since 2022)" + 2-3 more.
4. About — thesis: transformative Web3, blockchain, AI.
5. Portfolio — logo wall (mono #5F4945 @55% opacity) → hover card (red uppercase category / DM Serif maroon name / 2-3 line description). 26 companies strongest-first, show 10 + See More. Links target=_blank rel="noopener noreferrer". Data: src/data/data.jsx.
6. Contact — EmailJS (service_q7rgzm8 / template_4zis24c / public RElQ17WxbehSv1AID as fallbacks; VITE_EMAILJS_* env first). Honeypot `company_website`. Disable while sending. react-hot-toast.
7. Footer — brand, otc@satoriresearch.io, canonical www.satori.ventures.

## Globe (signature element)
- react-globe.gl: NO earth photo. Sphere MeshPhongMaterial #f3eeec, opacity .95, shininess 6; hexPolygonUseDots red #9B0801; atmosphere #9b0901f8; slow auto-rotate.
- CSS radial-gradient fallback IS the LCP element; WebGL mounts via requestIdleCallback (setTimeout 1200 fallback), React.lazy + Suspense + ErrorBoundary. reduced-motion ⇒ stay on fallback forever.
- Headless screenshot flags: `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --virtual-time-budget=9000`.

## SEO / security
- Meta/OG/Twitter/JSON-LD (Organization + ItemList 26 cos), favicons, site.webmanifest, sitemap.xml, robots.txt, theme-color #9B0801, canonical https://www.satori.ventures/.
- vercel.json: strict CSP (script-src self inline unpkg jsdelivr va.vercel-scripts; style-src self inline fonts.googleapis unpkg; font-src self fonts.gstatic data:; img-src self data: blob:; connect-src self api.emailjs.com vitals.vercel-insights.com va.vercel-scripts.com; frame-ancestors none; base-uri self; form-action self https://api.emailjs.com; object-src none; upgrade-insecure-requests) + HSTS/nosniff/DENY/Referrer/Permissions + SPA rewrite. Missing CSP origin = SILENT prod breakage.

## Workflow
- Verify locally only (Vercel bot checkpoint blocks curl/headless on prod): `npm run build` + `npm run preview` + headless shots.
- Commit inline identity: `git -c user.name="eternalvalu" -c user.email="otc@satoriresearch.io" commit -m "..."` → `git push origin main`.
- Deploy verified by live bundle hash CHANGE: `curl -sL https://www.satori.ventures/ | grep -oE 'index-[A-Za-z0-9_-]+\.js'` (never compare to local dist hash). Tell owner to hard-refresh.
- Node 24.x pinned (engines + .nvmrc) — never downgrade.

## Acceptance
- Red/white prestige, no dark theme, no earth-photo globe.
- Lighthouse mobile: Perf ≥90, A11y ≥95, BP ≥95, SEO 100.
- LCP = CSS globe fallback; WebGL deferred; reduced-motion respected site-wide.
- 26 companies w/ hover detail + working links; "128+ investments (Since 2022)".
- Contact sends via EmailJS; honeypot works.
- SEO assets + JSON-LD + sitemap/robots; CSP passes in prod.
- No secrets committed; deploy verified by hash change.
