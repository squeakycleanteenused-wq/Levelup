/** Kohalik "nähtud" ja "tehtud" märkimine, et miski ei jääks märkamata. Töötab ka ilma localStorage'ita. */
const get = (k: string): string[] => {
  try {
    return JSON.parse(localStorage.getItem(k) ?? "[]");
  } catch {
    return [];
  }
};
const set = (k: string, v: string[]) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* ignoreeri */
  }
};

export const seen = {
  has: (id: string) => get("seen").includes(id),
  markAll: (ids: string[]) => set("seen", [...new Set([...get("seen"), ...ids])]),
};
export const done = {
  has: (id: string) => get("done").includes(id),
  toggle: (id: string) => set("done", get("done").includes(id) ? get("done").filter((x) => x !== id) : [...get("done"), id]),
};
