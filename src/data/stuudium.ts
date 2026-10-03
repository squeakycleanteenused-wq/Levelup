import type { DataSource, Grade, StuudiumData } from "./types";

/**
 * Päris Stuudiumi ühendus (töötab ainult Tauri äpis, sest brauser blokeerib CORS-i).
 * Rust poolel (src-tauri) hoitakse sessiooni küpsiseid; siin parsitakse saadud HTML.
 *
 * NB! Valijad (selectors) allpool on PLACEHOLDER. Need tuleb kohandada päris
 * Stuudiumi lehe struktuuri järgi (vaata brauseris "Inspect" või salvesta leht).
 */
type Invoke = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;

async function invoke(): Promise<Invoke> {
  const mod = await import("@tauri-apps/api/core");
  return mod.invoke as Invoke;
}

export const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export async function login(username: string, password: string): Promise<void> {
  await (await invoke())("stuudium_login", { username, password });
}

async function page(path: string): Promise<Document> {
  const html = await (await invoke())<string>("stuudium_get", { path });
  return new DOMParser().parseFromString(html, "text/html");
}

function parseGrades(doc: Document): Grade[] {
  // PLACEHOLDER: kohanda päris lehe järgi
  return [...doc.querySelectorAll("[data-grade]")].map((el) => ({
    subject: el.getAttribute("data-subject") ?? "",
    value: Number(el.getAttribute("data-grade")),
    label: el.getAttribute("data-grade") ?? "",
    date: el.getAttribute("data-date") ?? "",
    kind: el.getAttribute("data-kind") ?? "",
  }));
}

export const stuudiumSource: DataSource = {
  async load(): Promise<StuudiumData> {
    const grades = parseGrades(await page("/diary/grades")); // PLACEHOLDER tee
    return { student: "", grades, schedule: [], events: [], summary: [], homework: [], absences: [] };
  },
};
