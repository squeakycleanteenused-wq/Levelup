# Levelup

Stuudiumi andmete parem visualiseerimine. Üks koodibaas: Windows, Linux, Android, iOS (Tauri 2 + React).

## Käivitamine
- Brauseris (demoandmed): `npm install && npm run dev`
- Töölaud: `npm run tauri dev`
- Ikoonid (üks kord): `npx tauri icon path/to/logo.png`
- Android: `npx tauri android init && npx tauri android dev`
- iOS (vajab Maci + Xcode): `npx tauri ios init && npx tauri ios dev`

## Stuudiumi ühendus
Avalikku API-t pole. Rust (`src-tauri/src/lib.rs`) logib sisse ja toob HTML-i, TS (`src/data/stuudium.ts`) parsib.
Aadress, vormiväljad ja valijad on PLACEHOLDER, need tuleb kohandada päris lehe järgi.
Parool jääb ainult mällu.
