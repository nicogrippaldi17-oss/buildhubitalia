# Build Hub — Sito Web

Sito vetrina statico bilingue (IT/EN) per **Build Hub**, azienda di Project Management in Sicilia.

## Stack

- **Static site generator:** [Eleventy](https://www.11ty.dev/) (11ty) v3
- **Template:** Nunjucks
- **CMS:** Decap CMS (per modifiche del cliente)
- **Hosting:** Netlify (deploy automatico da GitHub)
- **CSS:** Vanilla CSS

## Struttura

```
src/
├── _data/            # Dati globali (URL, anno)
├── _includes/        # Template Nunjucks (layout, icone)
├── admin/            # Decap CMS
├── css/              # Fogli di stile
├── js/               # JavaScript
├── img/              # Immagini (logo, servizi)
├── services_it/      # Servizi IT (markdown)
├── services_en/      # Servizi EN (markdown)
├── projects_it/      # Progetti IT (markdown)
├── projects_en/      # Progetti EN (markdown)
└── en/               # Pagine inglesi (index, about, services, projects, contact)
```

## Comandi

```bash
npm run build    # Genera il sito in _site/
npm run serve    # Server locale con live-reload su http://localhost:8080
```

## Deploy

1. Connettere il repository a Netlify
2. Build command: `npm run build`
3. Publish directory: `_site/`
4. Abilitare Netlify Identity + Git Gateway per Decap CMS

## CMS

Il client può modificare contenuti su `buildhub.it/admin` dopo il login via email (link magico).
