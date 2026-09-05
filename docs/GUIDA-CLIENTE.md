# Guida Build Hub — Gestione Sito

## A. Come modificare il sito (autonomo)

### Accesso al pannello amministratore

1. Apri il browser e vai su: **https://buildhubitalia.com/admin/**
2. Clicca **"Login with GitHub"**
3. Inserisci le tue credenziali GitHub (email + password)
4. Se hai l'autenticazione a due fattori (2FA), inserisci il codice

> La prima volta che accedi, GitHub chiede di autorizzare l'app "Build Hub CMS". Clicca **"Authorize"**.

### Modificare una pagina

1. Dopo il login, vedi la lista delle **collezioni** (Pagine IT, Pages EN, Servizi, Progetti)
2. Clicca sulla collezione che vuoi modificare (es. **"Pagine IT"**)
3. Clicca sulla pagina da modificare (es. **"Contatti"**)
4. Modifica i campi che vuoi cambiare (testo, numeri, email)
5. Clicca **"Publish"** in alto a destra
6. Il sito si aggiorna in **~30 secondi**

### Aggiungere un progetto

1. Dal menu, clicca **"Progetti IT"**
2. Clicca **"New Progetto"**
3. Compila:
   - **Titolo**: nome del progetto
   - **Descrizione**: descrizione breve
   - **Immagine**: carica una foto (formato JPG/PNG, max 2MB)
   - **Categoria**: es. "Residenziale", "Commerciale", "Pubblico"
   - **Pubblicato**: lascia attivo (verde)
   - **Ordine**: numero per stabilire l'ordine di visualizzazione
4. Clicca **"Publish"**

### Aggiungere un servizio

1. Dal menu, clicca **"Servizi IT"**
2. Clicca **"New Servizio"**
3. Compila:
   - **Titolo**: nome del servizio
   - **Descrizione**: cosa include il servizio
   - **Icona**: scegli dall'elenco (management, permits, supervision, ecc.)
   - **Slug**: identificativo breve (es. "project-management")
   - **Caratteristiche**: elenco dei punti chiave del servizio
   - **Ordine**: numero per l'ordine di visualizzazione
4. Clicca **"Publish"**

### Cambiare i contatti (telefono, email, indirizzo)

1. Dal menu, clicca **"Pagine IT"** → **"Contatti Footer"**
2. Modifica i campi:
   - **Indirizzo**: es. "Catania, Italia"
   - **Telefono**: es. "+39 334 181 9317"
   - **Telefono 2**: opzionale
   - **Email**: es. "buildhubitalia@gmail.com"
3. Clicca **"Publish"**

### Tradurre in inglese

Per ogni pagina IT, esiste la corrispondente in EN:
- **Pagine IT** → **Pages EN**
- **Servizi IT** → **Services EN**
- **Progetti IT** → **Projects EN**

> ⚠️ Le modifiche in IT **NON** si riflettono automaticamente in EN. Devi aggiornare entrambe le versioni.

---

## B. Cose da chiedere allo sviluppatore

Le seguenti modifiche richiedono intervento tecnico. Contattami per:

| Intervento | Esempio |
|---|---|
| Aggiungere una **nuova pagina** | Aggiungere una pagina "Blog" o "Lavora con noi" |
| Cambiare il **design** | Colori diversi, posizione elementi, nuovo layout |
| Aggiungere una **funzionalità** | Form newsletter, e-commerce, mappa interattiva |
| Correggere un **bug** | Qualcosa non funziona come dovrebbe |
| Modifiche **DNS** | Cambiare record DNS, aggiungere sottodomini |
| Aggiornamento **sicurezza** | Aggiornare dipendenze npm per vulnerabilità |
| Modifiche al **codice** | Qualsiasi modifica alla struttura del sito |

**Come contattarmi**: [inserire il tuo contatto qui]

---

## C. Manutenzione periodica

### Ogni mese (5 minuti)
- [ ] Accedere a `buildhubitalia.com/admin/` → verificare che il login funzioni
- [ ] Controllare che non ci siano errori nei build log Cloudflare (Workers & Pages → buildhubitalia → Deployments)

### Ogni 3 mesi (10 minuti)
- [ ] Verificare che il sito funzioni su mobile (apri da smartphone)
- [ ] Controllare Google Search Console per errori di indicizzazione
- [ ] Verificare che i link nel sito siano tutti funzionanti

### Ogni 6 mesi (15 minuti)
- [ ] Controllare che Google Analytics riceva dati (analytics.google.com → buildhubitalia.com)
- [ ] Verificare scadenza dominio `.com` su Aruba
- [ ] Aggiornare le dipendenze npm se ci sono security alert su GitHub

### Una volta l'anno
- [ ] Rinnovare dominio `.com` su Aruba (se non è auto-renew)
- [ ] Rinnovare dominio `.it` su Aruba
- [ ] Rivedere Privacy/Cookie Policy (cambiamenti normativi)

---

## D. Link utili

| Servizio | Link |
|---|---|
| **CMS Admin** | https://buildhubitalia.com/admin/ |
| **Sito live** | https://buildhubitalia.com |
| **Cloudflare Dashboard** | https://dash.cloudflare.com |
| **Google Analytics** | https://analytics.google.com |
| **Google Search Console** | https://search.google.com/search-console |
| **Aruba (domini)** | https://admin.aruba.it |
| **GitHub** | https://github.com/nicogrippaldi17-oss/buildhubitalia |

---

## E. Informazioni tecniche (per riferimento)

| Parametro | Valore |
|---|---|
| Sito | buildhubitalia.com |
| Hosting | Cloudflare Pages |
| CMS | Decap CMS (GitHub backend) |
| Repo GitHub | nicogrippaldi17-oss/buildhubitalia |
| GA4 ID | G-3M9ZJ0KXMT |
| Dominio .com | Aruba (rinnovo annuale) |
| Dominio .it | Aruba (www redirect a .com) |
| Sviluppatore | [inserire nome/contatto] |

---

*Guida aggiornata a settembre 2026*
