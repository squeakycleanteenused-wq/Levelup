# 🍁 Levelup

Selge ülevaade Stuudiumist lapsevanemale: mis on **kiire**, millal on **kontrolltööd**, mis **märkused** ja **madalad hinded** tulid, mida klassijuhataja **uut kirjutas** ja millised **kodused tööd** on tegemata. Lisaks lapsele punktimäng ja vanemate privaatne chat.

> Stuudiumi parooli ei küsi ega näe keegi. Andmed kogub laiendus sinu brauserist (kus oled juba sisse logitud) ja salvestab need **krüpteeritult**. Kellelgi teisel pole seda sinu paroolita võimalik lugeda.

---

## Mida sa vajad

- Arvuti brauseriga **Chrome, Edge, Brave või Opera** (need töötavad). **Firefox** on katsetamisel, vt allpool.
- Oma **Stuudiumi vanema konto** (sama, millega tavaliselt sisse logid).
- Veebiäpi **link** (küsi selle käest, kes sulle selle saatis).
- 10 minutit aega esimesel korral.

---

## Samm 1. Ava Levelup ja loo perekonna parool

Ava veebiäpi link (**LINK TULEB SIIA**) ja kirjuta kasti perekonna parool, mille ise välja mõtled. Kontot ega e-posti pole vaja. Kui äpp ütleb, et selle parooliga pole veel andmeid, sisesta parool uuesti ja vajuta **Loo uus pere ja jätka**. Äpp näitab siis järgmised sammud ja kontrollib ise, kas andmed on kohale jõudnud.

See parool on **sinu pere luku kood**. Sellega krüpteeritakse sinu lapse andmed.

- Mõtle välja **pikk, ainulaadne parool** (vähemalt 8 märki), nt kolm sõna kokku.
- **Ei ole** sinu Stuudiumi parool. Ära kasuta kunagi seda!
- **Kirjuta see üles** (parooli haldurisse). Kui unustad, ei saa andmeid taastada.
- Kes sama parooli teab, näeb samu andmeid. Seega **ära vali lihtsat sõna** ja ära jaga seda teiste peredega.

## Samm 2. Paigalda laiendus (üks kord)

1. Lae alla fail **[levelup-extension.zip](releases/levelup-extension.zip)** (GitHubis vajuta nuppu **Download raw file**).
2. Paki ZIP **lahti**, nt kausta `Levelup-laiendus` (kaust jääb alles, ära kustuta seda).
3. Ava brauseris laienduste leht:
   - Chrome, Brave: kirjuta aadressiribale `chrome://extensions`
   - Opera: `opera://extensions`
   - Edge: `edge://extensions`
4. Lülita sisse **Developer mode** (Arendaja režiim, tavaliselt paremal üleval).
5. Vajuta **Load unpacked** (Laadi lahti pakitud) ja vali lahti pakitud **kaust**.
6. Laiendus **"Levelup Stuudiumi sild"** ilmub nimekirja. Kinnita see tööriistaribale (pusle-ikoon 🧩).

### Kui kasutad Firefoxi (katsetamisel)

1. Lae alla **[levelup-extension-firefox.zip](releases/levelup-extension-firefox.zip)** ja paki **lahti**.
2. Ava aadress `about:debugging#/runtime/this-firefox`.
3. Vajuta **Load Temporary Add-on** ja vali lahti pakitud kaustast fail **manifest.json**.
4. Ava `about:addons` → Levelup → **Permissions** ja luba juurdepääs saitidele (Stuudium).
5. **Pane tähele:** Firefoxis kaob ajutine laiendus brauseri sulgemisel ja tuleb uuesti laadida. Püsivaks tegemiseks tuleb laiendus Mozilla poolt allkirjastada (vt administraatori osa). Seda versiooni pole veel Firefoxis testitud, anna vigadest teada.

## Samm 3. Täida laienduse seaded (üks kord)

1. Klõpsa laienduse ikoonil. Avaneb **uus vaheleht** seadetega.
2. Täida:
   - **Perekonna parool**: see, mille mõtlesid Sammus 1.
   - **Kooli aadress**: sinu kooli Stuudiumi aadress (nt `variku.ope.ee`, ilma `https://`).
   - **Klassijuhataja eesnimi**: nt `Olena`. Selle järgi tõstetakse tema postitused esikohale.
   - **Klass**: nt `5b`.
   - Muud väljad jäta nii, nagu on.
3. Vajuta **Salvesta seaded**.

## Samm 4. Saada Stuudiumi info pilve

1. Ava Stuudium uuel vahelehel ja **logi sisse** nagu tavaliselt.
2. Klõpsa laienduse ikoonil ja vajuta **Uuenda kohe**.
3. Oota umbes 20 sekundit (laiendus avab hetkeks mõne taustalehe). Peaks ilmuma "Uuendatud" ja numbrid.

> Edaspidi uuendab laiendus ise (vaikimisi iga 30 minuti järel), **kui brauser on lahti ja oled Stuudiumis sisse logitud**.

## Samm 5. Ava Levelup

1. Ava äpp. Teises seadmes (nt telefon) sisesta sama perekonna parool. Äpp jätab selle seadmesse meelde.
2. Vajuta **Kontrolli, kas andmed jõudsid kohale**.
3. Näed **Hetkeseisu**, õpilase tegevust, klassijuhataja postitusi ja kodutöid.

## Samm 6. Pane telefoni

- **Android (Chrome):** menüü ⋮ → **Lisa avaekraanile**.
- **iPhone (Safari):** jagamise nupp → **Lisa avaekraanile**.

Telefon näitab sama infot. Uuendamiseks peab arvutis olema laiendus käimas (vt Samm 4).

---

## Mida äpis näed

| Koht | Mis see on |
|---|---|
| **Hetkeseis** | Üks lause: kas on midagi kiiret. Kontrolltööd päevadega |
| **Õpilase tegevus** | Hinded 3 ja madalamad, märkused (!), hilinemised, tegemata tööd, kiitused ja tagasiside. Lingid Stuudiumisse |
| **Klassijuhataja** | Tema postitused, märgiga **Uus** või **Uuendatud** |
| **Kodused tööd** | Päevade kaupa, linnuke tehtud tööle |
| **Punktid** | Lapse "Minu päev", vanema kinnitus, trahv põhjusega, auhinnad |
| **Vanemate chat** | Privaatne vestlus (vt allpool) |

### Vanemate chat

- Chati jaoks on **eraldi ühine parool**, mille klassi vanemad omavahel kokku lepivad. See **ei ole** sinu perekonna parool.
- Kõik, kes sisestavad sama chati parooli, näevad sama vestlust. Server ei näe sisu.

### Punktimäng (lapsele)

- Laps märgib **Minu päev** all tehtud asjad. Vanem vajutab **Vanema režiim** (oma PIN) → **Kinnita kõik**.
- Vanem saab anda **trahvi** või **boonuse** (põhjus on lapsele nähtav) ja muuta ülesandeid ning auhindu.

---

## Privaatsus ja turvalisus

- **Stuudiumi parooli** ei küsi ega salvesta keegi. Laiendus kasutab sinu juba sisseloginud brauserit.
- Andmed krüpteeritakse **sinu seadmes** (AES-256) sinu perekonna parooliga enne pilve saatmist. Pilvest ei saa neid lugeda ei Supabase ega äpi autor.
- **Sinu pere ei näe teiste perede andmeid.** Iga parool avab oma hoidla.
- Kui kaotad parooli, ei saa andmeid taastada.
- Tee seda ainult **enda lapse** konto andmetega. Järgi kooli ja Stuudiumi kasutustingimusi.

---

## Tõrked ja lahendused

| Probleem | Mida teha |
|---|---|
| Laiendus ütleb "Pole Stuudiumis sisse logitud" | Logi Stuudiumisse uuel vahelehel sisse ja vajuta **Uuenda kohe** |
| Äpp ütleb "Selle parooliga pole andmeid" | Kontrolli parooli (sama mis laiendusel). Kui õige, vajuta laiendusel **Uuenda kohe** |
| Sisestasin vale parooli | Äpis lehe lõpus **🔑 Vaheta parool**. Või lisa lingi lõppu `?reset=1` |
| Laiendus ütleb "Ühendus ebaõnnestus" | Kontrolli internetti, siis proovi uuesti |
| Laienduse aken sulgub | Ikooni klõps avab tavalise vahelehe, kasuta seda |
| Äpp näitab "Invalid API key" | Võti on vale. Anna teada äpi autorile |
| Uuenduse nupp ei tee midagi | Veendu, et seaded on salvestatud (parool täidetud) |

---

## Piirangud

- Laiendus töötab **ainult arvutis** (Chrome, Opera, Edge, Brave). Telefon näitab valmis infot.
- Automaatne uuendus vajab, et **brauser on lahti** ja Stuudiumis oled sisse logitud.
- Kui Stuudium muudab oma lehe kujundust, võib lugemine katki minna. Anna siis teada.
- Mitme lapse korral valib laiendus praegu ühe lapse. Õpilase id saab seadetes käsitsi sisestada (nt `2876` aadressist `/s/2876`).

---

## Äpi administraatorile (sellele, kes veebi üles paneb)

**Veebi üles (Vercel, tasuta)**
1. vercel.com → **Add New → Project** → vali GitHubi repo `Levelup`.
2. Vali rida **`app` (Vite)** → **Import single project** (mitte `src-tauri`).
3. **Environment Variables**: `VITE_SUPABASE_URL` ja `VITE_SUPABASE_ANON_KEY` (lühike `sb_publishable_...` võti). **Ära pane** `VITE_FAMILY_PASSWORD`.
4. **Deploy**. Pane saadud link ülal Sammu 5 kohale.

**Supabase** (andmebaas): tabelid on kaustas `supabase/migrations/` (001 chat, 002 sünkroon, 003 õigused, 004 punktiraamat). Käivita need SQL Editoris järjest.

**Laiendus poodi (soovitus, kui jagad paljudele):** Chrome Web Store ($5 ühekordselt), Edge Add-ons (tasuta) ja Firefox AMO (tasuta, allkirjastab ja teeb püsivaks). Siis paigaldus on üks klikk ja "Developer mode" pole vaja. Chrome ütleb arendaja režiimis laaditud laienduste kohta iga käivitusel hoiatuse.

**Laienduse ehitus ise** (kui tahad muuta):
```
npm install
npm run build:ext            # Chrome, Edge, Brave, Opera -> extension/dist
npm run build:ext:firefox    # Firefox -> extension/dist-firefox
```
Valmis kaust on `extension/dist`. Ava `.env` näidis failist `.env.example`.

**Arendus**
```
npm install
npm run dev      # http://localhost:1420
npm run build
```
Kood: Tauri 2 + React + TypeScript. Natiivsed rakendused (Windows, Linux, Android, iOS) on veel ehitamata.
