# Guida Build Hub — Gestione Sito

## A. Come modificare il sito (autonomo)

### Accesso al pannello di gestione

1. Apri il browser e vai su: **https://buildhubitalia.com/gestione**
2. Inserisci la **password** dell'area riservata
3. Premi **Accedi** → si apre il pannello di gestione

> La password è personale: non condividerla. Se serve cambiarla, contatta lo sviluppatore.

### Modificare una pagina

1. Nella barra a sinistra (**Raccolte**) scegli il gruppo della pagina da modificare
   (es. **Home**, **Chi Siamo**, **Contatti**)
2. Clicca la voce della pagina
3. Modifica i campi che vuoi cambiare (testo, numeri, email)
4. Clicca **Pubblica** in alto a destra → **Pubblica ora**
5. Il sito si aggiorna da solo in pochi secondi

> Se una pagina appare vuota o con i testi di quella precedente, fai un **refresh completo
> del browser** (tasto **⌘R** su Mac / **Ctrl+F5** su Windows): è una cache interna del pannello.

### Le pagine e le raccolte disponibili

| Gruppo | Cosa contiene |
|---|---|
| **Home** | Homepage italiana (hero, valori, CTA) |
| **Chi Siamo** | Pagina Chi Siamo (storia, approccio, visione, missione, valori, territorio) |
| **Contatti** | Pagina Contatti (hero + "Cosa succede dopo") |
| **Contatti Footer** | Indirizzo, telefoni ed email mostrati nel footer di **tutte** le pagine |
| **Home EN** / **About EN** / **Contact EN** | Le stesse pagine in inglese |
| **Servizi IT** / **Services EN** | Le schede dei singoli servizi |
| **Progetti IT** / **Projects EN** | I singoli progetti |

### Aggiungere un progetto

1. Dal menu, clicca **Progetti IT**
2. Clicca **＋ Progetto**
3. Compila:
   - **Titolo**: nome del progetto
   - **Descrizione**: descrizione breve
   - **Immagine**: carica una foto (JPG/PNG)
   - **Categoria**: es. "Residenziale", "Commerciale", "Pubblico"
   - **Pubblicato**: lascia attivo
   - **Ordine**: numero per l'ordine di visualizzazione
4. Clicca **Pubblica** → **Pubblica ora**

### Aggiungere un servizio

1. Dal menu, clicca **Servizi IT**
2. Clicca **＋ Servizio**
3. Compila:
   - **Titolo**: nome del servizio
   - **Descrizione**: cosa include il servizio
   - **Icona**: scegli dall'elenco (management, permits, supervision, ecc.)
   - **Slug**: identificativo breve (es. "project-management")
   - **Caratteristiche**: elenco dei punti chiave del servizio
   - **Ordine**: numero per l'ordine di visualizzazione
4. Clicca **Pubblica** → **Pubblica ora**

### Cambiare i contatti (telefono, email, indirizzo)

1. Dal menu, clicca **Contatti Footer**
2. Modifica i campi:
   - **Indirizzo**: es. "Catania, Italia"
   - **Telefono**: es. "+39 334 181 9317"
   - **Telefono 2**: opzionale
   - **Email**: es. "info@buildhubitalia.com"
3. Clicca **Pubblica** → **Pubblica ora**

> I contatti del footer si aggiornano automaticamente su tutte le pagine del sito.

### Tradurre in inglese

Per ogni pagina in italiano esiste la corrispondente in inglese:

- **Home** → **Home EN**
- **Chi Siamo** → **About EN**
- **Contatti** → **Contact EN**
- **Servizi IT** → **Services EN**
- **Progetti IT** → **Projects EN**

> ⚠️ Le modifiche in italiano **non** si riflettono automaticamente in inglese: aggiorna entrambe le versioni.

---

## B. Cose da chiedere allo sviluppatore

Le seguenti modifiche richiedono intervento tecnico. Contattami per:

| Intervento | Esempio |
|---|---|
| Aggiungere una **nuova pagina** | Aggiungere una pagina "Blog" o "Lavora con noi" |
| Cambiare il **design** | Colori diversi, posizione elementi, nuovo layout |
| Aggiungere una **funzionalità** | Form newsletter, e-commerce |
| Correggere un **bug** | Qualcosa non funziona come dovrebbe |
| Modifiche **DNS** | Cambiare record DNS, aggiungere sottodomini |
| Aggiornamento **sicurezza** | Aggiornare dipendenze npm per vulnerabilità |
| Modifiche al **codice** | Qualsiasi modifica alla struttura del sito |

**Come contattarmi**: [inserire il tuo contatto qui]

---

## C. Manutenzione periodica

### Ogni mese (5 minuti)
- [ ] Accedere a `buildhubitalia.com/gestione` → verificare che l'accesso funzioni
- [ ] Controllare che non ci siano errori nel deploy (Workers & Pages → `buildhubitalia` → Deployments, oppure GitHub → Actions)

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
| **Pannello di gestione** | https://buildhubitalia.com/gestione |
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
| CMS | Decap CMS (pannello `/gestione`, accesso con password) |
| Email contatti | `info@buildhubitalia.com` (inoltrata a Gmail) |
| Deploy | Automatico — ogni pubblicazione aggiorna il sito in pochi secondi |
| Repo GitHub | nicogrippaldi17-oss/buildhubitalia |
| GA4 ID | G-3M9ZJ0KXMT |
| Dominio .com | Aruba (rinnovo annuale) |
| Dominio .it | Aruba (redirect a .com) |
| Sviluppatore | [inserire nome/contatto] |

---

*Guida aggiornata a ottobre 2026*
