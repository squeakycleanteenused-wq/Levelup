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

/** Postituste versioonid: "uus" (pole nähtud) ja "uuendatud" (nähtud, aga tegevus või vastuste arv muutunud). */
export const postsSeen = {
  state(id: string, sig: string): "uus" | "uuendatud" | "nähtud" {
    try {
      const m = JSON.parse(localStorage.getItem("postsSeen") ?? "{}") as Record<string, string>;
      return !(id in m) ? "uus" : m[id] === sig ? "nähtud" : "uuendatud";
    } catch {
      return "uus";
    }
  },
  markAll(items: { id: string; sig: string }[]) {
    try {
      const m = JSON.parse(localStorage.getItem("postsSeen") ?? "{}");
      items.forEach((i) => (m[i.id] = i.sig));
      localStorage.setItem("postsSeen", JSON.stringify(m));
    } catch {
      /* ignoreeri */
    }
  },
};
