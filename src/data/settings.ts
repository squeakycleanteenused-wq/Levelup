/** Kasutaja seaded (klass ja klassijuhataja). Vaikimisi 5b ja Olena (tuvastatakse eesnime järgi). */
const KEY = "settings";
export type Role = "vanem" | "õpilane";
export type Settings = { className: string; classTeacher: string; role: Role };
const defaults: Settings = { className: "5b", classTeacher: "Olena", role: "vanem" };

export function getSettings(): Settings {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return defaults;
  }
}
export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignoreeri */
  }
}
