import type { Grade } from "./types";

export const avg = (g: Grade[]) => (g.length ? g.reduce((s, x) => s + x.value, 0) / g.length : 0);

export function bySubject(grades: Grade[]) {
  const m = new Map<string, Grade[]>();
  grades.forEach((g) => m.set(g.subject, [...(m.get(g.subject) ?? []), g]));
  return [...m].map(([subject, list]) => ({ subject, avg: avg(list), count: list.length }));
}

/** Jooksev keskmine ajas, graafiku jaoks. */
export function trend(grades: Grade[]) {
  const sorted = [...grades].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((g, i) => ({ date: g.date.slice(5), avg: +avg(sorted.slice(0, i + 1)).toFixed(2) }));
}
