import type { Grade } from "./types";

const numeric = (g: Grade[]) => g.filter((x): x is Grade & { value: number } => x.value !== null);

export const avg = (g: Grade[]) => {
  const n = numeric(g);
  return n.length ? n.reduce((s, x) => s + x.value, 0) / n.length : 0;
};

export function bySubject(grades: Grade[]) {
  const m = new Map<string, Grade[]>();
  grades.forEach((g) => m.set(g.subject, [...(m.get(g.subject) ?? []), g]));
  return [...m].map(([subject, list]) => ({ subject, avg: avg(list), count: list.length }));
}

/** Jooksev keskmine ajas, graafiku jaoks. */
export function trend(grades: Grade[]) {
  const sorted = numeric(grades).sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((g, i) => ({ date: g.date.slice(5), avg: +avg(sorted.slice(0, i + 1)).toFixed(2) }));
}
