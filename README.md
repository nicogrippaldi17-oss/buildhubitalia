# Build Hub — Sito Web

Sito vetrina statico bilingue (IT/EN) per **Build Hub**, azienda di Project Management in Sicilia.

**URL:** [buildhubitalia.com](https://buildhubitalia.com)

## Stack

- **Static site generator:** [Eleventy](https://www.11ty.dev/) (11ty) v3
- **Template:** Nunjucks
- **Hosting:** **Cloudflare Pages** (progetto `buildhubitalia`)
- **Deploy:** **GitHub Actions** → `wrangler pages deploy` (automatico su push in `main`)
- **CMS:** **Decap CMS** — pannello di gestione in `/gestione` (gate con password + backend `proxy`)
- **Funzioni serverless:** Cloudflare Pages Functions (`functions/`) — form contatti, proxy CMS, OAuth admin
- **Email transazionali:** [Resend](https://resend.com) (invio form contatti)
- **Email di ricezione:** **Cloudflare Email Routing** (`info@buildhubitalia.com` → Gmail)
- **CSS:** Vanilla CSS
- **Mappa:** Leaflet con tiles **ESRI Dark Gray** (`services.arcgisonline.com`)
- **Geocoding:** Nominatim (OSM) · **Routing:** OSRM · **Geolocalizzazione:** pulsante "Usa la mia posizione"

## Funzionalità implementate

- **Mappa interattiva** Leaflet con tile layer ESRI Dark Gray, marker per la sede Build Hub (Catania)
- **Ricerca indirizzi** con Nominatim — campi partenza/destinazione con autocomplete
- **Calcolo percorso** OSRM — distanza (km) e durata (min), polyline sulla mappa, auto-fit bounds
- **"Usa la mia posizione"** — geolocalizzazione del browser come punto di partenza
- **Click sulla mappa** per impostare waypoint · scroll zoom su hover · pannello routing collassabile
- **Form contatti** con validazione bilingue e disclaimer GDPR (ritenzione 24 mesi) — invio via **Resend**
- **Cookie policy** con disclosure dei servizi terzi reali (Google Fonts, Leaflet/ESRI, Nominatim, OSRM)
- **SEO** — Canonical, Open Graph, Twitter Card, JSON-LD Organization, sitemap, robots
- **Statistiche automatiche** — Progetti Completati, Anni di Esperienza, Servizi Offerti (conteggi CMS)
- **Contenuti editabili via CMS** — Home, Chi Siamo, Contatti, footer, Servizi e Progetti (IT + EN)

## Struttura directory

```
buildhub-site/
├── src/
│   ├── _data/
│   │   ├── site.json          # URL, anno, GA, Search Console
│   │   ├── contact.json       # Indirizzo, telefoni, email (editabile via CMS)
│   │   └── territorio.json    # Testi sezione territorio
│   ├── _includes/
│   │   ├── base.njk           # Layout principale (navbar, footer, SEO, JSON-LD)
│   │   └── icons.njk          # Macro icone servizi
│   ├── gestione/              # Pannello CMS "cliente"
│   │   ├── index.html         # Gate con password (SHA-256) → carica Decap CMS
│   │   └── config.yml         # Config Decap (backend: proxy)
│   ├── admin/                 # Pannello CMS alternativo
│   │   ├── index.html
│   │   └── config.yml         # Config Decap (backend: github + OAuth)
│   ├── css/style.css
│   ├── js/main.js
│   ├── img/
│   ├── index.njk              # Homepage IT (editabile)
│   ├── chi-siamo.njk          # Chi Siamo IT (editabile)
│   ├── servizi.njk            # Servizi IT (itera su collections.services_it)
│   ├── progetti.njk           # Progetti IT (itera su collections.projects_it)
│   ├── contatti.njk           # Contatti IT (editabile + mappa + routing + form)
│   ├── privacy.njk            # Privacy Policy IT
│   ├── cookie.njk             # Cookie Policy IT
│   ├── sitemap.njk / robots.njk / 404.njk
│   ├── en/                    # index, about, services, projects, contact, privacy, cookie
│   ├── services_it/           # 8 file .md — servizi IT (collezione CMS)
│   ├── services_en/           # 8 file .md — servizi EN (collezione CMS)
│   ├── projects_it/           # Progetti IT (creabili via CMS)
│   └── projects_en/           # Progetti EN (creabili via CMS)
├── functions/                 # Cloudflare Pages Functions
│   ├── _middleware.js         # Redirect host non-canonici → buildhubitalia.com
│   ├── contact.js             # POST /contact → invio email via Resend
│   ├── proxy.js               # Backend CMS (legge/scrive su GitHub via GITHUB_PAT)
│   └── api/auth.js            # OAuth GitHub per il pannello /admin
├── .github/workflows/deploy.yml  # Auto-deploy su push in main
├── .eleventy.js               # Config Eleventy + minificazione HTML
├── minify.js                  # Minifica post-build CSS/JS (csso + terser)
├── wrangler.toml              # Config Cloudflare Pages
├── package.json
└── .gitignore
```

## Comandi

```bash
npm run build    # Genera il sito in _site/ (+ minifica CSS/JS)
npm run serve    # Server locale con live-reload su http://localhost:8080
```

## Deploy (automatico)

Il deploy è **automatico**: ogni `push` sul branch `main` avvia il workflow
`.github/workflows/deploy.yml`, che esegue:

1. `npm ci`
2. `npm run build` (Eleventy + minify)
3. `wrangler pages deploy _site --project-name=buildhubitalia --branch=main`

Il workflow legge **due secret del repository GitHub** (Settings → Secrets and variables → Actions):

- un **token API Cloudflare** con permesso *Account → Cloudflare Pages → Edit*
- l'**ID dell'account Cloudflare** che possiede il progetto

> Per pubblicare una modifica è quindi sufficiente `git push` (o un salvataggio dal CMS,
> che committa su GitHub e innesca lo stesso workflow).

### Deploy manuale (fallback)

```bash
npm run build
npx wrangler pages deploy _site --project-name=buildhubitalia --branch=main
```

## Variabili d'ambiente (Cloudflare Pages → Settings → Variables)

| Variabile | Uso |
|---|---|
| `RESEND_API_KEY` | Invio email del form contatti |
| `CONTACT_FROM` | Mittente (default `noreply@buildhubitalia.com`) |
| `CONTACT_TO` | Destinatario (default `info@buildhubitalia.com`) |
| `GITHUB_PAT` | Token GitHub per il CMS proxy (lettura/scrittura contenuti) |
| `GITHUB_REPO` | Repo CMS (default `nicogrippaldi17-oss/buildhubitalia`) |

## CMS — cosa può modificare il cliente

Pannello: `https://buildhubitalia.com/gestione`

| Gruppo | Cosa modifica |
|---|---|
| **Home** (IT/EN) | Hero (subtitle, tagline, CTA), Valori (3 card), CTA finale |
| **Chi Siamo / About EN** | Hero, storia, approccio (5 punti), visione, missione, valori (3 card), CTA, territorio |
| **Contatti / Contact EN** | Hero + sezione "Cosa succede dopo" (3 step) |
| **Contatti Footer** | Indirizzo, telefoni, email (footer di tutto il sito + JSON-LD) |
| **Servizi IT / Services EN** | Singoli servizi: creare, modificare, eliminare |
| **Progetti IT / Projects EN** | Singoli progetti: creare, modificare, eliminare |

Alcuni campi sono opzionali: se lasciati vuoti, la pagina usa i valori predefiniti del template.

### Accesso al CMS

1. Aprire `https://buildhubitalia.com/gestione`
2. Inserire la **password** dell'area riservata
3. Modificare i contenuti → **Pubblica**
4. Il workflow di deploy parte da solo in pochi secondi

> Nota: navigando tra le pagine *dentro* il CMS può capitare di vedere per un attimo i dati
> della pagina precedente (cache interna di Decap). In quel caso fare un refresh completo
> del browser (`⌘R`).

## Email

- **Ricezione:** `info@buildhubitalia.com` (Cloudflare Email Routing) → inoltro a `buildhubitalia@gmail.com`
- **Invio (form contatti):** Resend, mittente `noreply@buildhubitalia.com`, destinatario `info@buildhubitalia.com`
