import { getSettings, setStatus, type ExtSettings } from "./shared";

/**
 * Käib Stuudiumi lehed läbi SINU brauseris sinu sisselogimisega (tavaline vanem, mitte robot).
 * Serveris renderdatud lehed toob fetch, Suhtluse lehed (JS-iga) avatakse hetkeks taustalehel.
 * Töötlemine (parsimine, krüpteerimine, pilve saatmine) tehakse offscreen-dokumendis, sest teenindustöötajal pole DOM-i.
 */
const PAGE_WAIT_MS = 15000;

class NotLoggedIn extends Error {}

async function fetchHtml(url: string): Promise<string> {
  const r = await fetch(url, { credentials: "include", redirect: "follow" });
  if (/\/auth\b/.test(new URL(r.url).pathname)) throw new NotLoggedIn("Pole Stuudiumis sisse logitud");
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

/** Avab lehe taustalehel, ootab kuni sisu (selector) ilmub, loeb DOM-i ja sulgeb lehe. */
async function renderHtml(url: string, selector: string): Promise<string> {
  const tab = await chrome.tabs.create({ url, active: false });
  try {
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("leht ei laadinud: " + url)), PAGE_WAIT_MS);
      const on = (id: number, info: { status?: string }) => {
        if (id === tab.id && info.status === "complete") { clearTimeout(t); chrome.tabs.onUpdated.removeListener(on); resolve(); }
      };
      chrome.tabs.onUpdated.addListener(on);
    });
    const [res] = await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      args: [selector, PAGE_WAIT_MS],
      func: (sel: string, max: number) =>
        new Promise<string>((resolve) => {
          const t0 = Date.now();
          const tick = () => {
            if (location.pathname.startsWith("/auth")) return resolve("AUTH");
            if (document.querySelector(sel) || Date.now() - t0 > max) return resolve(document.documentElement.outerHTML);
            setTimeout(tick, 300);
          };
          tick();
        }),
    });
    if (res.result === "AUTH") throw new NotLoggedIn("Pole Stuudiumis sisse logitud");
    return res.result as string;
  } finally {
    if (tab.id) chrome.tabs.remove(tab.id).catch(() => {});
  }
}

async function ensureOffscreen() {
  const ctx = await chrome.runtime.getContexts({ contextTypes: ["OFFSCREEN_DOCUMENT" as chrome.runtime.ContextType] });
  if (ctx.length) return;
  await chrome.offscreen.createDocument({ url: "offscreen.html", reasons: ["DOM_PARSER" as chrome.offscreen.Reason], justification: "Stuudiumi lehtede parsimine ja krüpteerimine" });
}

async function detectIds(s: ExtSettings): Promise<{ studentId: string; groupId: string; dash: string }> {
  let studentId = s.studentId;
  let dashHtml = "";
  if (!studentId) {
    const r = await fetch(`https://${s.host}/`, { credentials: "include", redirect: "follow" });
    if (/\/auth\b/.test(new URL(r.url).pathname)) throw new NotLoggedIn("Pole Stuudiumis sisse logitud");
    studentId = /\/s\/(\d+)/.exec(r.url)?.[1] ?? /\/s\/(\d+)/.exec(await r.text())?.[1] ?? "";
    if (!studentId) throw new Error("Ei leidnud õpilase id-d. Sisesta see laienduse seadetes (nt 2876 aadressist /s/2876).");
  }
  dashHtml = await fetchHtml(`https://${s.host}/s/${studentId}`);
  const groupId = s.groupId || /\/chat\/g\/(\d+)/.exec(dashHtml)?.[1] || "";
  return { studentId, groupId, dash: dashHtml };
}

export async function runSync(): Promise<string> {
  const s = await getSettings();
  const at = new Date().toISOString();
  try {
    if (!s.supabaseUrl || !s.supabaseKey || !s.password) throw new Error("Täida seaded: Supabase'i aadress, võti ja perekonna parool.");
    const { studentId, groupId, dash } = await detectIds(s);
    const base = `https://${s.host}`;
    const pages: string[] = [dash];
    const errors: string[] = [];
    const grab = async (label: string, f: () => Promise<string>) => {
      try { pages.push(await f()); } catch (e) { if (e instanceof NotLoggedIn) throw e; errors.push(`${label}: ${(e as Error).message}`); }
    };
    await grab("hinded", () => fetchHtml(`${base}/grades/student/${studentId}`));
    await grab("kokkuvõtvad", () => fetchHtml(`${base}/users/summary/${studentId}`));
    await grab("postitused", () => renderHtml(`${base}/suhtlus/`, ".post-in-list"));
    await grab("kalender", () => renderHtml(`${base}/suhtlus/calendar`, ".cal-day[data-cal-date]"));
    if (groupId) await grab("jututuba", () => renderHtml(`${base}/chat/g/${groupId}`, ".chat-room-messages .msg"));

    await ensureOffscreen();
    const res = (await chrome.runtime.sendMessage({ target: "offscreen", type: "process", pages, settings: s })) as { ok: boolean; message: string; counts?: Record<string, number> };
    const message = res.ok ? `Uuendatud${errors.length ? " (osaliselt: " + errors.join("; ") + ")" : ""}` : res.message;
    await setStatus({ at, ok: res.ok, message, counts: res.counts });
    return message;
  } catch (e) {
    const message = (e as Error).message;
    await setStatus({ at, ok: false, message });
    return message;
  }
}

async function schedule() {
  const s = await getSettings();
  await chrome.alarms.clear("sync");
  if (s.everyMin > 0) chrome.alarms.create("sync", { periodInMinutes: Math.max(15, s.everyMin) });
}

chrome.runtime.onInstalled.addListener(schedule);
chrome.runtime.onStartup.addListener(schedule);
chrome.storage.onChanged.addListener((c) => { if (c.settings) schedule(); });
chrome.alarms.onAlarm.addListener((a) => { if (a.name === "sync") runSync(); });
chrome.runtime.onMessage.addListener((m, _s, send) => {
  if (m?.target === "background" && m.type === "sync") { runSync().then((message) => send({ message })); return true; }
  return false;
});

// Ikooni klõps avab (või toob ette) tavalise vahelehe. Väike popup sulgub fookuse kaotamisel ja sobib halvasti seadistamiseks.
const PANEL = () => chrome.runtime.getURL("popup.html?tab=1");
chrome.action.onClicked.addListener(async () => {
  const existing = (await chrome.tabs.query({})).find((t) => t.url === PANEL());
  if (existing?.id) {
    await chrome.tabs.update(existing.id, { active: true });
    if (existing.windowId) await chrome.windows.update(existing.windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: PANEL() });
  }
});
