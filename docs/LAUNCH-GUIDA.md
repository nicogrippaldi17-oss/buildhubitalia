# Guida al lancio — Build Hub

Guida operativa per la messa online e la verifica finale del sito **buildhubitalia.com**.
Documento destinato al cliente: aggiornare i punti spuntati man mano che vengono completati.

---

## 1. Stato del progetto — cosa è già fatto e live

| Voce | Stato |
| --- | --- |
| Sito online su `buildhubitalia.com` e `www.buildhubitalia.com` | ✅ Attivo (Cloudflare Pages, HTTPS, SSL) |
| Redirect da HTTP a HTTPS | ✅ Attivo |
| CMS per modifiche contenuti (`/gestione`) | ✅ Funzionante |
| Form di contatto (email a buildhubitalia@gmail.com) | ✅ Funzionante |
| Google Analytics 4 con banner consenso cookie | ✅ Configurato e conforme |
| Sitemap inviata a Google Search Console | ✅ 14 URL |
| Privacy Policy e Cookie Policy (IT + EN) | ✅ Online, in corso di completamento (vedi §2) |

---

## 2. Checklist legale (da completare al più presto)

> Il sito è **operativo** anche prima di completare questa sezione, ma la normativa
> GDPR richiede che questi punti vengano chiusi **prima dell'avvio commerciale pieno**
> (pubblicità, acquisizione clienti, fatturazione).

### 2.1 Dati fiscali del Titolare da integrare nella Privacy Policy

Quando saranno disponibili, occorre fornire i seguenti dati per completare la sezione
"1. Titolare del trattamento" della Privacy Policy (pagine `privacy.html` ed `en/privacy.html`):

- [ ] **Partita IVA** (o codice fiscale)
- [ ] **Natura giuridica** (es. ditta individuale, SRL, studio professionale)
- [ ] **Ragione sociale** esatta (se diversa da "Build Hub")
- [ ] **Indirizzo completo** della sede (via, numero civico, CAP, città)

**Come procedere:** inviare questi dati allo sviluppatore. L'aggiornamento delle due
pagine Privacy Policy e il nuovo deploy richiedono pochi minuti.

> Nota: oggi la Privacy Policy contiene la dicitura "i dati identificativi fiscali completi
> verranno integrati a breve". Questa nota andrà rimossa quando i dati verranno inseriti.

### 2.2 Riduzione della retention di Google Analytics a 2 mesi

Per coerenza con quanto dichiarato nella Privacy/Cookie Policy (dati conservati max **2 mesi**):

1. Accedere a **Google Analytics** → https://analytics.google.com
2. Selezionare la proprietà del sito **Build Hub** (in alto a sinistra)
3. Andare su **Admin** (ingranaggio in basso a sinistra)
4. Nella colonna *Proprietà*, cliccare su **Data Settings → Data Retention**
5. Impostare la conservazione su **2 months**
6. Abilitare l'opzione **"Reset user data on new activity"** oppure **"Delete user data when not active"** in base alla voce presente
7. Salvare

> Nota: la modifica della retention impatta solo sui dati raccolti da quel momento,
> non su quelli già presenti.

### 2.3 Verifica del banner consenso

- [ ] Il banner cookie compare al **primo accesso** al sito (IT ed EN)
- [ ] Cliccando **"Accetta"**, GA4 si attiva (vedi §4 per la verifica)
- [ ] Cliccando **"Rifiuta"**, nessun cookie analitico viene installato
- [ ] Ricaricando la pagina dopo una scelta, il banner **non riappare**
- [ ] Il banner contiene i link a **Cookie Policy** e **Privacy Policy**

---

## 3. Pulizia servizi legacy (opzionale ma consigliata)

> Questa sezione riguarda vecchi servizi non più in uso. Non blocca il lancio,
> ma evita confusione e costi residui.

### 3.1 Netlify

Il sito era originariamente ospitato su Netlify. Il sito Netlify **non è più in uso** ed è
consigliabile eliminarlo per evitare confusione:

1. Accedere a https://app.netlify.com con l'account utilizzato in precedenza
2. Selezionare il sito **buildhubitalia**
3. Andare su **Site settings → Danger zone → Delete site**
4. Confermare l'eliminazione
5. (Facoltativo) Se non si usano altri progetti su Netlify, è possibile eliminare anche l'account: **avatar in alto a destra → Account settings → Danger zone → Delete account**

### 3.2 Vecchio sottodominio Cloudflare Pages

Il sottodominio `buildhubitalia.pages.dev` risultava già occupato da un progetto "orfano"
creato con un account precedente. Per liberarlo:

1. Accedere all'account Cloudflare usato in fase di test iniziale
2. Cloudflare Pages → selezionare il progetto `buildhubitalia` → **Settings → Danger zone → Delete project**
3. Il dominio `buildhubitalia.pages.dev` tornerà disponibile

> Il sito pubblico usa `buildhubitalia.com` / `www.buildhubitalia.com`: la pulizia di
> `buildhubitalia.pages.dev` **non è necessaria** per il funzionamento del sito.

---

## 4. Verifica finale di lancio — checklist

### 4.1 Cookie banner e Google Analytics

1. Aprire `https://buildhubitalia.com` in **finestra anonima** (o dopo aver cancellato i cookie)
2. Verificare che compaia il banner in basso
3. Aprire **DevTools (F12) → scheda Network**
4. Cliccare **"Accetta"**:
   - deve comparire una richiesta a `www.googletagmanager.com/gtag/js?id=G-3M9ZJ0KXMT`
   - i cookie `_ga`, `_gid`, `_gat` vengono impostati
5. Cliccare **"Rifiuta"** (nuova visita anonima):
   - **nessuna** richiesta verso `googletagmanager.com`
   - nessun cookie `_ga`/`_gid`
6. In **Google Analytics → Report → Tempo reale**: dopo aver accettato e visitato il sito, dovrebbe comparire **1 utente attivo**

### 4.2 Contenuti e funzionalità

- [ ] Homepage IT (`/`) e Homepage EN (`/en/`) caricate correttamente
- [ ] Tutte le pagine rispondono: Chi Siamo, Servizi, Progetti, Contatti, Privacy, Cookie (IT + EN)
- [ ] **Form di contatto**: inviare una richiesta di prova e verificare che l'email arrivi a buildhubitalia@gmail.com
- [ ] **CMS** (`/gestione`): login riuscito, modifica di una pagina pubblicata correttamente
- [ ] **Mappa contatti**: caricamento mappa, ricerca indirizzo e calcolo percorso
- [ ] Sito **responsive**: verifica rapida da smartphone (iPhone/Android)

### 4.3 Google Search Console

- [ ] La **sitemap** risulta in stato **"Success"**
  (Google Search Console → Sitemap → stato "Success", 14 URL)
- [ ] La **proprietà** risulta verificata (senza errori di verifica)

---

## 5. Cosa fare quando si ricevono i dati fiscali

Quando il cliente avrà a disposizione i dati di §2.1, la procedura è:

1. Inviare i dati allo sviluppatore
2. Aggiornare `privacy.njk` ed `en/privacy.njk` (sezione 1: Titolare)
3. Rimuovere la nota "verranno integrati a breve"
4. Aggiornare la data di "Ultimo aggiornamento" alla data corrente
5. Build → deploy → verifica live

---

## Riferimenti rapidi

- **Sito**: https://buildhubitalia.com
- **CMS**: https://buildhubitalia.com/gestione
- **GA4**: https://analytics.google.com (proprietà Build Hub)
- **Search Console**: https://search.google.com/search-console (proprietà buildhubitalia.com)
- **Cloudflare**: https://dash.cloudflare.com (account Buildhubitalia@gmail.com)
- **Resend**: https://resend.com (dominio buildhubitalia.com verificato)
