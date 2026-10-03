# Levelup Stuudiumi sild (brauserilaiendus)

Toob Stuudiumi info (hinded, märkused, kodused tööd, Olena postitused, kalender) sinu Levelup äppi.
Töötab **sinu brauseris sinu enda sisselogimisega**, parooli ei küsi ega salvesta.

## Paigaldus (Opera, Chrome, Edge, Brave)
1. `npm install && npm run build:ext`
2. Ava `opera://extensions` (Chrome: `chrome://extensions`), lülita sisse **Arendaja režiim**.
3. Vajuta **Laadi lahti pakitud laiendus** (Load unpacked) ja vali kaust `extension/dist`.
4. Klõpsa laienduse ikooni, täida seaded (Supabase'i aadress, anon-võti, perekonna parool).
5. Logi Stuudiumisse sisse tavalisel viisil ja vajuta **Uuenda kohe**.

## Kuidas see töötab
- Serveris renderdatud lehed (ülevaade, hinded, kokkuvõtvad) tuuakse fetch'iga sinu sessiooniga.
- Suhtluse lehed (postitused, kalender) ja jututuba avatakse hetkeks taustalehel, loetakse ja suletakse.
- Info krüpteeritakse perekonna parooliga ja salvestatakse Supabase'i. Äpp laeb selle sealt.
- Automaatne uuendus (vaikimisi iga 30 min) töötab, kui brauser on lahti ja Stuudiumis sisse logitud.
- Laste jututuba ei lähe pilve.
