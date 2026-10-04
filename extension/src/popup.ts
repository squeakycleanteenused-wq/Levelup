import { cleanHost, defaults, getSettings, getStatus, saveSettings, type ExtSettings } from "./shared";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const keys = Object.keys(defaults) as (keyof ExtSettings)[];

async function render() {
  const st = await getStatus();
  const el = $("status");
  if (!st) el.textContent = "Pole veel uuendatud.";
  else {
    const when = new Date(st.at).toLocaleString("et-EE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    el.className = st.ok ? "ok" : "err";
    el.textContent = `${when}: ${st.message}` + (st.counts ? ` · ${Object.entries(st.counts).map(([k, v]) => `${k} ${v}`).join(", ")}` : "");
  }
}

const inTab = new URLSearchParams(location.search).has("tab");
if (inTab) { document.body.classList.add("tab"); $("tabhint").style.display = "none"; }
const openInTab = () => chrome.tabs.create({ url: chrome.runtime.getURL("popup.html?tab=1") });
$("openTab").addEventListener("click", () => { openInTab(); window.close(); });

(async () => {
  const s = await getSettings();
  // Väike popup sulgub fookuse kaotamisel (nt kopeerimisel). Seadistamiseks avame tavalise vahelehe.
  if (!inTab && (!s.supabaseUrl || !s.supabaseKey || !s.password)) { openInTab(); window.close(); return; }
  keys.forEach((k) => { const i = document.getElementById(k) as HTMLInputElement | null; if (i) i.value = String(s[k]); });
  if (!s.supabaseUrl || !s.supabaseKey || !s.password) ($("cfg") as HTMLDetailsElement).open = true;
  await render();
})();

$("save").addEventListener("click", async () => {
  const s = { ...(await getSettings()) } as Record<string, unknown>;
  keys.forEach((k) => { const i = document.getElementById(k) as HTMLInputElement | null; if (i) s[k] = typeof defaults[k] === "number" ? Number(i.value) : i.value.trim(); });
  s.host = cleanHost(String(s.host ?? ""));
  const pw = String(s.password ?? "").trim();
  if (pw && pw.length < 8) { $("status").className = "err"; $("status").textContent = "Perekonna parool peab olema vähemalt 8 märki ja ainulaadne (kes sama parooli teab, näeb samu andmeid)."; return; }
  await saveSettings(s as unknown as ExtSettings);
  $("status").className = "ok";
  $("status").textContent = "Seaded salvestatud.";
});

$("sync").addEventListener("click", async () => {
  $("status").className = "";
  $("status").textContent = "Uuendan… (avan hetkeks taustalehti)";
  await chrome.runtime.sendMessage({ target: "background", type: "sync" });
  await render();
});
