# Build Hub — Sito Web

## Progetto
Sito vetrina statico bilingue (IT/EN) per Build Hub, azienda di Project Management in Sicilia.

## Stack
- **Static site generator:** Eleventy (11ty)
- **CMS:** Decap CMS (per modifiche del cliente)
- **Hosting:** Netlify (deploy automatico da GitHub)
- **Build:** `npx @11ty/eleventy`
- **Output:** `_site/`

## Struttura directory
```
buildhub-site/
├── src/                    # Sorgente (input Eleventy)
│   ├── _data/
│   │   └── site.json       # Dati globali (URL, anno)
│   ├── _includes/          # Template Nunjucks
│   │   ├── base.njk        # Layout principale (navbar + footer + SEO + JSON-LD)
│   │   └── icons.njk       # Macro icone servizi
│   ├── index.njk           # Homepage IT (frontmatter con hero, valori, stats, cta)
│   ├── chi-siamo.njk       # About IT
│   ├── servizi.njk         # Servizi IT (itera su collections.services_it)
│   ├── progetti.njk        # Progetti IT (itera su collections.projects_it)
│   ├── contatti.njk        # Contatti IT
│   ├── en/
│   │   ├── index.njk       # Homepage EN
│   │   ├── about.njk
│   │   ├── services.njk
│   │   ├── projects.njk
│   │   └── contact.njk
│   ├── services_it/        # 4 file .md — servizi IT editabili (collezione)
│   ├── services_en/        # 4 file .md — servizi EN editabili (collezione)
│   ├── projects_it/        # Progetti IT (vuoto, cliente aggiunge via CMS)
│   ├── projects_en/        # Progetti EN (vuoto, cliente aggiunge via CMS)
│   ├── admin/
│   │   ├── index.html      # Pannello Decap CMS
│   │   └── config.yml      # Configurazione CMS
│   ├── css/style.css
│   ├── js/main.js
│   ├── img/logo.png
│   └── favicon.svg
├── .eleventy.js            # Config Eleventy
├── netlify.toml            # Config deploy Netlify
├── package.json
└── .gitignore
```

## Comandi
- `npm run build` — genera il sito in `_site/` (+ minifica CSS/JS)
- `npm run serve` — server locale con live-reload su `http://localhost:8080`

## Per il deploy
1. Push su GitHub
2. Connettere a Netlify (root: `buildhub-site/`, build: `npm run build`, publish: `_site`)
3. Abilitare Netlify Identity + Git Gateway
4. Invitare il cliente come utente

## Per il cliente (modifiche via admin)
1. Aprire `buildhubitalia.com/admin`
2. Login via email (link magico)
3. Modificare testi/immagini
4. Cliccare "Publish" → sito aggiornato in ~30 secondi

## Pagina Chi Siamo — struttura finale (16/06/2026)
1. **Hero** — "Un unico punto di riferimento per il tuo progetto" + accento decorativo
2. **Storia** — testo full-width centrato (2 paragrafi)
3. **Approccio** — 5 bullet con check (riposizionato dopo Storia)
4. **Valori** — 3 card (Unico Referente, Coordinamento & Controllo, Comunicazione & Supporto)
5. **Visione + Missione** — fuse in un'unica sezione a 2 colonne, ciascuna con icona
6. **Territorio** — invariato (sfondo primary)
7. **CTA finale** — "Parlaci del tuo progetto" → bottone Contattaci

## Navbar
- **Header** — `<nav class="site-navbar">`, fisso in alto, blu (#021164), altezza 90px desktop, 70px mobile
- **Clip-path SVG** — maschera vettoriale nativa tramite `clip-path: url(#webuild-curve)`. Il tracciato definito in `objectBoundingBox` taglia la barra blu al centro con curve fluide concave: la navbar segue fedelmente la geometria Webuild
- **Logo** — posizionato in `.nav-brand-center` (absolute, left 50%, top 0, transform translateX), width 220px, height 110px, z-index 1001. Logo max-height 75px
- **Menu** — 2 blocchi simmetrici (`<ul class="nav-menu">`) separati dal logo centrale, gap 40px, font-weight 700, uppercase, letter-spacing 1.2px, width 38% ciascuno
- **Shadow** — `box-shadow: 0 4px 20px rgba(0,0,0,0.15)`
- **Language switcher** — spostato dal navbar al footer su mobile/tablet (< 1023px), rimane in navbar solo su desktop. Nel footer posizionato accanto a Privacy/Cookie Policy links

## SEO implementato
- **Sitemap.xml** — `src/sitemap.njk` (14 URL, con priorità e changefreq)
- **Robots.txt** — `src/robots.njk` (Allow: /, Disallow: /admin/)
- **Google Search Console** — meta tag in `base.njk` (attivo se `site.search_console_meta` valorizzato)
- **Google Analytics GA4** — gtag.js in `base.njk` (attivo se `site.ga_id` valorizzato)
- **Canonical tag** — `src/_includes/base.njk` (basato su `site.url + page.url`)
- **Open Graph** — og:title, og:description, og:url, og:image, og:locale
- **Twitter Card** — summary_large_image
- **JSON-LD** — Organization schema con indirizzo e contatto
- **Google Fonts** — caricati via preconnect + link (non più @import)
- **Meta description** — aggiornata in chi-siamo.njk e en/about.njk
- **Minificazione HTML** — via `html-minifier-terser` (transform Eleventy)
- **Minificazione CSS/JS** — via `csso` + `terser` (post-build script)

## Configurazioni post-deploy
Dopo il deploy su Netlify, attivare GA4 e Search Console:
1. Ottenere **Measurement ID** (G-XXXXXXXXXX) da https://analytics.google.com
2. Inserirlo in `src/_data/site.json` → campo `ga_id`
3. Per Search Console: ottenere meta tag di verifica da https://search.google.com/search-console
4. Inserirlo in `src/_data/site.json` → campo `search_console_meta`
5. Oppure: verificare dominio via DNS (record TXT) — non serve modificare codice

## Consegna (da fare dopo il push)
- [ ] Connettere repository a Netlify (root: `buildhub-site/`, build: `npm run build`, publish: `_site/`)
- [ ] Abilitare Netlify Identity + Git Gateway
- [ ] Invitare il cliente come utente CMS (email)
- [ ] Puntare DNS `buildhubitalia.com` a Netlify
