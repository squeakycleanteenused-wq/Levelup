import { defaults, getSettings, getStatus, saveSettings, type ExtSettings } from "./shared";

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

(async () => {
  const s = await getSettings();
  keys.forEach((k) => { const i = document.getElementById(k) as HTMLInputElement | null; if (i) i.value = String(s[k]); });
  if (!s.supabaseUrl || !s.supabaseKey || !s.password) ($("cfg") as HTMLDetailsElement).open = true;
  await render();
})();

$("save").addEventListener("click", async () => {
  const s = { ...(await getSettings()) } as Record<string, unknown>;
  keys.forEach((k) => { const i = document.getElementById(k) as HTMLInputElement | null; if (i) s[k] = typeof defaults[k] === "number" ? Number(i.value) : i.value.trim(); });
  await saveSettings(s as unknown as ExtSettings);
  $("status").textContent = "Seaded salvestatud.";
});

$("sync").addEventListener("click", async () => {
  $("status").className = "";
  $("status").textContent = "Uuendan… (avan hetkeks taustalehti)";
  await chrome.runtime.sendMessage({ target: "background", type: "sync" });
  await render();
});
