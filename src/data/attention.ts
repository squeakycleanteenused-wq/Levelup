import type { StuudiumData } from "./types";
import { done } from "./seen";

export type Severity = 3 | 2 | 1; // 3 = kiire, 2 = oluline, 1 = info
export type AttentionItem = { severity: Severity; kind: string; title: string; detail: string; date: string; url?: string };

/** Märkesõnad, mis viitavad negatiivsele märkusele (muuda vastavalt vajadusele). */
const NEGATIVE = /lohakas|unustas|ei tei|tegemata|hilines|segas|ebaviisakas|puudus (vahend|õpik|vihik)|pole kaasas|ei olnud kaasas|korrata|parandada/i;

export function attention(data: StuudiumData, today = new Date().toISOString().slice(0, 10), badMax = 3): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const g of data.grades) {
    if ((g.value !== null && g.value <= badMax) || /^MA$/i.test(g.label))
      items.push({ severity: 3, kind: "Madal hinne", title: `${g.subject}: ${g.label}`, detail: g.note ?? (g.kind === "Hinne" ? "" : g.kind), date: g.date });
  }

  for (const r of data.remarks) {
    const who = r.teacher ? ` (${r.teacher})` : "";
    if (r.kind === "puudumine") {
      if (r.excused === false) items.push({ severity: 3, kind: "Põhjendamata puudumine", title: r.subject, detail: r.text, date: r.date });
    } else if (r.kind === "tegemata töö") {
      items.push({ severity: 3, kind: "Tegemata töö", title: r.subject, detail: r.text, date: r.date });
    } else if (r.kind === "hilinemine" || r.kind === "muu") {
      items.push({ severity: 2, kind: r.kind === "hilinemine" ? "Hilinemine" : "Märge", title: r.subject, detail: r.text, date: r.date });
    } else if (r.kind === "märkus") {
      // hüüumärk (!) Stuudiumis = õpetaja märkus
      items.push({ severity: 3, kind: "Märkus (!)", title: `${r.subject}${who}`, detail: r.text, date: r.date });
    } else if (r.kind === "tagasiside" && NEGATIVE.test(r.text)) {
      items.push({ severity: 2, kind: "Tagasiside", title: `${r.subject}${who}`, detail: r.text, date: r.date });
    }
  }

  const week = new Date(Date.parse(today) + 7 * 864e5).toISOString().slice(0, 10);
  for (const h of data.homework) {
    if (h.done || done.has(h.id)) continue;
    if (h.due < today) items.push({ severity: 2, kind: "Tähtaeg möödas", title: h.subject, detail: h.text, date: h.due });
    else if (h.text.startsWith("Kontrolltöö") && h.due <= week) items.push({ severity: 2, kind: "Kontrolltöö", title: h.subject, detail: h.text.replace(/^Kontrolltöö:? ?/, ""), date: h.due });
  }

  const link = (subject: string) => data.links?.[subject];
  items.forEach((i) => { i.url = link(i.title.split(":")[0].replace(/ \(.*\)$/, "")); });
  return items.sort((a, b) => b.severity - a.severity || b.date.localeCompare(a.date));
}

/** Õpilase tegevus: madalad hinded (3 ja alla), märkused (!), hilinemised, tegemata tööd, põhjuseta puudumised, negatiivne tagasiside. */
const CONDUCT = new Set(["Madal hinne", "Märkus (!)", "Põhjendamata puudumine", "Tegemata töö", "Hilinemine", "Tagasiside", "Märge"]);
export const conduct = (data: StuudiumData) => attention(data).filter((i) => CONDUCT.has(i.kind));
