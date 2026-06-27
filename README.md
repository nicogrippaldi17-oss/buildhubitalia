# Build Hub — Sito Web

Sito vetrina statico bilingue (IT/EN) per **Build Hub**, azienda di Project Management in Sicilia.

**URL:** [buildhubitalia.com](https://buildhubitalia.com)

## Stack

- **Static site generator:** [Eleventy](https://www.11ty.dev/) (11ty) v3
- **Template:** Nunjucks
- **CMS:** Decap CMS (pannello admin per il cliente)
- **Hosting:** Netlify (deploy automatico da GitHub)
- **CSS:** Vanilla CSS
- **Mappa:** Leaflet con tiles CARTO dark_all
- **Geocoding:** Nominatim (OSM)
- **Routing:** OSRM

## Funzionalità implementate

- **Mappa interattiva** Leaflet con tile layer CARTO dark_all, marker gold personalizzato per la sede Build Hub (Catania), popup al click
- **Geocoding** con Nominatim — campi partenza/destinazione con autocomplete (via + città + regione)
- **Calcolo percorso** OSRM — distanza (km) e durata (min), polyline sulla mappa, auto-fit bounds
- **Click sulla mappa** per impostare waypoint
- **Scroll zoom** disabilitato di default, abilitato su hover
- **Pannello routing** collapsibile (nascosto di default, si apre automaticamente al calcolo del percorso)
- **Form contatti** con validazione bilingue, privacy checkbox con link alla privacy policy, disclaimer GDPR (ritenzione 24 mesi, diritto di cancellazione)
- **Cookie policy** con disclosure dei servizi terzi reali (Google Fonts, Leaflet/CARTO tiles, Nominatim, OSRM)
- **SEO** — Canonical tag, Open Graph, Twitter Card, JSON-LD Organization schema
- **Statistiche automatiche** — Progetti Completati (conteggio progetti CMS), Anni di Esperienza (dal 2026), Servizi Offerti (conteggio servizi CMS)
- **Progetti e Servizi** gestiti via Decap CMS (creare, modificare, eliminare)
- **Pagine About/Chi Siamo** interamente editabili via CMS (storia, approccio, visione/missione, valori, CTA, territorio)
- **Contatti footer** editabili via CMS (indirizzo, telefono, email) — si riflettono su tutto il sito incluso JSON-LD SEO

## Struttura directory

```
buildhub-site/
├── src/
│   ├── _data/
│   │   ├── site.json          # URL, anno
│   │   └── contact.json       # Indirizzo, telefono, email (editabile via CMS)
│   ├── _includes/
│   │   └── base.njk           # Layout principale (navbar, footer, SEO, JSON-LD)
│   ├── admin/
│   │   ├── index.html         # Pannello Decap CMS
│   │   └── config.yml         # Configurazione CMS
│   ├── css/style.css
│   ├── js/main.js
│   ├── img/
│   ├── index.njk              # Homepage IT
│   ├── chi-siamo.njk          # Chi Siamo IT (editabile via CMS)
│   ├── servizi.njk            # Servizi IT (hero editabile via CMS)
│   ├── progetti.njk           # Progetti IT (hero editabile via CMS)
│   ├── contatti.njk           # Contatti IT (hero editabile via CMS + mappa + routing + form)
│   ├── privacy.njk            # Privacy Policy IT
│   ├── cookie.njk             # Cookie Policy IT
│   ├── en/
│   │   ├── index.njk          # Homepage EN
│   │   ├── about.njk          # About Us EN (editabile via CMS)
│   │   ├── services.njk       # Services EN (hero editabile via CMS)
│   │   ├── projects.njk       # Projects EN (hero editabile via CMS)
│   │   ├── contact.njk        # Contact EN (hero editabile via CMS)
│   │   ├── privacy.njk        # Privacy Policy EN
│   │   └── cookie.njk         # Cookie Policy EN
│   ├── services_it/           # Servizi IT (8 file .md — editabili via CMS)
│   ├── services_en/           # Services EN (8 file .md — editabili via CMS)
│   └── projects_it/           # Progetti IT (creabili via CMS)
│       projects_en/           # Projects EN (creabili via CMS)
├── .eleventy.js
├── netlify.toml
├── package.json
└── .gitignore
```

## Comandi

```bash
npm run build    # Genera il sito in _site/
npm run serve    # Server locale con live-reload su http://localhost:8080
```

## Cosa può modificare il cliente via CMS

| Pagina | Cosa modifica |
|---|---|
| **Homepage** (IT/EN) | Hero (subtitle, tagline, CTA), Valori (3 card), CTA finale |
| **Chi Siamo / About Us** | Tutti i testi: hero, storia, approccio (5 punti), visione, missione, valori (3 card), CTA, territorio |
| **Servizi / Services** | Titolo e sottotitolo hero |
| **Progetti / Projects** | Titolo e sottotitolo hero |
| **Contatti / Contact** | Titolo e sottotitolo hero |
| **Footer** | Indirizzo, telefono, email |
| **Servizi (singoli)** | Creare, modificare, eliminare |
| **Progetti (singoli)** | Creare, modificare, eliminare |

## Come accedere al CMS

1. Aprire `buildhubitalia.com/admin`
2. Inserire l'email → ricevere link magico (nessuna password)
3. Modificare i contenuti → cliccare "Publish"
4. Il sito si aggiorna automaticamente in ~30 secondi

## Deploy su Netlify

1. Push del repository su GitHub
2. Connettere a Netlify:
   - Root directory: `buildhub-site/`
   - Build command: `npm run build`
   - Publish directory: `_site/`
3. Abilitare **Netlify Identity** → **Git Gateway**
4. Invitare il cliente come utente (Settings → Identity → Invite users)
