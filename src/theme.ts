export type Season = "autumn" | "winter" | "spring" | "summer";

export function seasonOf(d = new Date()): Season {
  const o = new URLSearchParams(location.search).get("season"); // eelvaade: ?season=winter
  if (o === "autumn" || o === "winter" || o === "spring" || o === "summer") return o;
  const m = d.getMonth() + 1; // 1-12
  return m >= 9 && m <= 11 ? "autumn" : m === 12 || m <= 2 ? "winter" : m <= 5 ? "spring" : "summer";
}

/** Variku tunnus: vahtraleht. Üks path, kasutusel nii päises kui langevate lehtede joonistamisel. */
export const MAPLE =
  "M12 1.5l2 4.2 2.6-1.6-.5 4.6 3.4-2.4-1 4 3.2.6-3.4 3.2 1.2 1.7-4.6-.9.1 5.1h-2.6v-5.1l-4.6.9 1.2-1.7L3.6 12.4 6.8 11.8l-1-4 3.4 2.4-.5-4.6L11 5.7z";

export const getAnimOn = () => {
  try {
    return localStorage.getItem("anim") !== "off";
  } catch {
    return true;
  }
};
export const setAnimOn = (on: boolean) => {
  try {
    localStorage.setItem("anim", on ? "on" : "off");
  } catch {
    /* ignoreeri */
  }
};

export type ThemeMode = "auto" | "light" | "dark";
export const getTheme = (): ThemeMode => {
  try {
    const v = localStorage.getItem("theme");
    return v === "light" || v === "dark" ? v : "auto";
  } catch {
    return "auto";
  }
};
export function applyTheme(m: ThemeMode) {
  if (m === "auto") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = m;
  try {
    localStorage.setItem("theme", m);
  } catch {
    /* ignoreeri */
  }
}
