export type ExtSettings = {
  host: string; // nt variku.ope.ee
  supabaseUrl: string;
  supabaseKey: string;
  password: string; // perekonna parool (krüpteerib pilve hetktõmmise), jääb ainult sellesse brauserisse
  teacher: string;
  className: string;
  studentId: string; // tühi = tuvasta automaatselt
  groupId: string; // klassi jututoa id, tühi = tuvasta automaatselt
  everyMin: number; // 0 = ainult käsitsi
};

import { cleanSecret } from "../../src/data/clean";

declare const __LEVELUP_DEFAULTS__: { supabaseUrl: string; supabaseKey: string; password: string };

export const defaults: ExtSettings = {
  host: "variku.ope.ee", supabaseUrl: cleanSecret(__LEVELUP_DEFAULTS__.supabaseUrl), supabaseKey: cleanSecret(__LEVELUP_DEFAULTS__.supabaseKey), password: __LEVELUP_DEFAULTS__.password, teacher: "Olena", className: "5b", studentId: "", groupId: "", everyMin: 30,
};

export type Status = { at: string; ok: boolean; message: string; counts?: Record<string, number> };

export const getSettings = async (): Promise<ExtSettings> => {
  const saved = ((await chrome.storage.local.get("settings")).settings ?? {}) as Partial<ExtSettings>;
  const merged = { ...defaults } as Record<string, unknown>;
  // tühje salvestatud välju ei kasutata, nii jäävad ehitamisel .env-st võetud väärtused kehtima
  Object.entries(saved).forEach(([k, v]) => { if (v !== "" && v !== undefined) merged[k] = v; });
  return merged as unknown as ExtSettings;
};
export const saveSettings = (s: ExtSettings) => chrome.storage.local.set({ settings: s });
export const getStatus = async (): Promise<Status | null> => ((await chrome.storage.local.get("status")).status as Status | undefined) ?? null;
export const setStatus = (s: Status) => chrome.storage.local.set({ status: s });
