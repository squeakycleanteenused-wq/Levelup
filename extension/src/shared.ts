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

export const defaults: ExtSettings = {
  host: "variku.ope.ee", supabaseUrl: "", supabaseKey: "", password: "", teacher: "Olena", className: "5b", studentId: "", groupId: "", everyMin: 30,
};

export type Status = { at: string; ok: boolean; message: string; counts?: Record<string, number> };

export const getSettings = async (): Promise<ExtSettings> => ({ ...defaults, ...((await chrome.storage.local.get("settings")).settings ?? {}) });
export const saveSettings = (s: ExtSettings) => chrome.storage.local.set({ settings: s });
export const getStatus = async (): Promise<Status | null> => ((await chrome.storage.local.get("status")).status as Status | undefined) ?? null;
export const setStatus = (s: Status) => chrome.storage.local.set({ status: s });
