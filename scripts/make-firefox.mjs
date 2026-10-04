// Teeb Chromiumi laiendusest Firefoxi versiooni: extension/dist -> extension/dist-firefox
import { cpSync, readFileSync, writeFileSync, rmSync } from "node:fs";
rmSync("extension/dist-firefox", { recursive: true, force: true });
cpSync("extension/dist", "extension/dist-firefox", { recursive: true });
const m = JSON.parse(readFileSync("extension/dist-firefox/manifest.json", "utf8"));
m.background = { scripts: ["background.js"], type: "module" }; // Firefox: taustaleht (event page), mitte service_worker
m.permissions = m.permissions.filter((p) => p !== "offscreen"); // Firefoxis puudub, pole vaja
m.browser_specific_settings = { gecko: { id: "levelup-stuudium@levelup.local", strict_min_version: "115.0" } };
writeFileSync("extension/dist-firefox/manifest.json", JSON.stringify(m, null, 2));
console.log("Firefoxi versioon valmis: extension/dist-firefox");
