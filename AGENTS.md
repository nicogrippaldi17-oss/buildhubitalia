# Build Hub — Sito Web

## Progetto
Sito vetrina statico bilingue (IT/EN) per Build Hub, azienda di Project Management in Sicilia.
Sito live: **https://buildhubitalia.com**

## Stack
- **Static site generator:** Eleventy (11ty) v3 — `npm run build`
- **Template:** Nunjucks
- **Hosting:** **Cloudflare Pages** (progetto `buildhubitalia`)
- **Deploy:** **GitHub Actions** — ogni push in `main` esegue build + `wrangler pages deploy`
- **CMS:** **Decap CMS** — pannello in `/gestione` (gate password + backend `proxy`)
- **Funzioni serverless:** Cloudflare Pages Functions (`functions/`)
- **Email:** Resend (invio form) + Cloudflare Email Routing (`info@buildhubitalia.com` → Gmail)
- **Output:** `_site/`

## Struttura directory
```
buildhub-site/
├── src/                    # Sorgente (input Eleventy)
│   ├── _data/              # site.json, contact.json, territorio.json
│   ├── _includes/          # base.njk (layout), icons.njk (macro icone)
│   ├── gestione/           # Pannello CMS cliente: index.html (gate password) + config.yml (backend proxy)
│   ├── admin/              # Pannello CMS alternativo: index.html + config.yml (backend github/OAuth)
│   ├── index.njk           # Homepage IT (frontmatter editabile)
│   ├── chi-siamo.njk       # Chi Siamo IT
│   ├── servizi.njk         # Servizi IT (itera su collections.services_it)
│   ├── progetti.njk        # Progetti IT (itera su collections.projects_it)
│   ├── contatti.njk        # Contatti IT (mappa + routing + form)
│   ├── privacy.njk / cookie.njk / sitemap.njk / robots.njk / 404.njk
│   ├── en/                 # index, about, services, projects, contact, privacy, cookie
│   ├── services_it/        # 8 file .md — servizi IT (collezione CMS)
│   ├── services_en/        # 8 file .md — servizi EN (collezione CMS)
│   ├── projects_it/        # Progetti IT (creabili via CMS)
│   ├── projects_en/        # Progetti EN (creabili via CMS)
│   ├── css/style.css
│   ├── js/main.js
│   └── img/
├── functions/              # Cloudflare Pages Functions
│   ├── _middleware.js      # Redirect host non-canonici → buildhubitalia.com
│   ├── contact.js          # POST /contact → email via Resend
│   ├── proxy.js            # Backend CMS (GitHub API via GITHUB_PAT)
│   └── api/auth.js         # OAuth GitHub per /admin
├── .github/workflows/deploy.yml
├── .eleventy.js            # Config Eleventy + minificazione HTML
├── minify.js               # Minifica post-build CSS/JS (csso + terser)
├── wrangler.toml           # Config Cloudflare Pages
├── package.json
└── .gitignore
```

## Comandi
- `npm run build` — genera il sito in `_site/` (+ minifica CSS/JS)
- `npm run serve` — server locale con live-reload su `http://localhost:8080`

Nota ambiente locale (macOS): `npx @11ty/eleventy` può fallire; usare `./node_modules/.bin/eleventy`.
Il build completo: `./node_modules/.bin/eleventy && node minify.js`.

## Deploy (automatico)
Il deploy avviene da **GitHub Actions** (`.github/workflows/deploy.yml`) a ogni push su `main`:
1. `npm ci`
2. `npm run build`
3. `wrangler pages deploy _site --project-name=buildhubitalia --branch=main`

Il workflow usa **due secret del repository GitHub**: un token API Cloudflare (permesso *Cloudflare Pages: Edit*) e l'ID dell'account Cloudflare.

Deploy manuale (fallback):
```bash
npm run build
npx wrangler pages deploy _site --project-name=buildhubitalia --branch=main
```

> Il progetto Pages è di tipo **Direct Upload** (nessuna integrazione Git nativa): il deploy
> automatico è garantito dal workflow GitHub Actions, **non** da Cloudflare.

## Variabili d'ambiente (Cloudflare Pages → Variables)
`RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO`, `GITHUB_PAT`, `GITHUB_REPO`.

## Per il cliente (modifiche via CMS)
1. Aprire `buildhubitalia.com/gestione`
2. Inserire la password dell'area riservata
3. Modificare testi → **Pubblica** (committa su GitHub → deploy automatico)

### Collezioni CMS
- **Pagine I file singoli** (backend `format: yaml-frontmatter` per `.njk`, `format: json` per `contact.json`):
  Home, Chi Siamo, Contatti, Contatti Footer (IT) · Home EN, About EN, Contact EN
- **Collezioni a cartella** (`extension: md`): Servizi IT, Services EN, Progetti IT, Projects EN

> I campi non obbligatori usano `required: false`: se lasciati vuoti, il template applica il `default`.
> Salvare una pagina **non** danneggia il corpo del template (verificato): Decap riscrive solo il frontmatter.

## Pagina Chi Siamo — struttura finale
1. **Hero** — "Un unico punto di riferimento per il tuo progetto" + accento decorativo
2. **Storia** — testo full-width centrato (2 paragrafi)
3. **Approccio** — 5 bullet con check
4. **Valori** — 3 card (Unico Referente, Coordinamento & Controllo, Comunicazione & Supporto)
5. **Visione + Missione** — sezione a 2 colonne con icona
6. **Territorio** — sfondo primary
7. **CTA finale** — "Parlaci del tuo progetto" → Contatti

## Navbar
- `<nav class="site-navbar">`, fisso in alto, blu (#021164), 90px desktop / 70px mobile
- **Clip-path SVG** — maschera `clip-path: url(#webuild-curve)` (curva Webuild)
- **Logo** in `.nav-brand-center` (absolute, left 50%, translateX), width 220px
- **Menu** — 2 blocchi simmetrici separati dal logo centrale, uppercase, letter-spacing 1.2px
- **Language switcher** — nel footer su mobile/tablet (< 1023px), in navbar su desktop

## SEO
- **Sitemap.xml** (`src/sitemap.njk`), **Robots.txt** (`src/robots.njk`)
- **GA4** (gtag in `base.njk`, attivo se `site.ga_id`) · **Search Console** (meta, attivo se `site.search_console_meta`)
- **Canonical**, **Open Graph**, **Twitter Card**, **JSON-LD** Organization
- **Google Fonts** via preconnect + link
- **Minificazione**: HTML (`html-minifier-terser`, transform Eleventy) + CSS/JS (`csso` + `terser`, `minify.js`)

## Configurazioni post-deploy
- **GA4:** Measurement ID → `src/_data/site.json` → `ga_id`
- **Search Console:** meta di verifica → `src/_data/site.json` → `search_console_meta` (oppure verifica DNS via record TXT)

## Email
- **Ricezione:** `info@buildhubitalia.com` (Cloudflare Email Routing) → inoltro a `buildhubitalia@gmail.com`
- **Invio form:** Resend, da `noreply@buildhubitalia.com`
