import type { Absence, CalEvent, Grade, Homework, SummaryRow } from "./types";

/**
 * Parserid on kirjutatud päris Stuudiumi lehtede (lapsevanema vaade, variku.ope.ee) järgi.
 * Töötavad nii brauseris kui Node'is (DOMParser/jsdom), sisend on Document.
 */
const txt = (el: Element | null | undefined) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
const numeric = (label: string) => (/^[1-5]$/.test(label) ? Number(label) : null);

/** /users/summary/<id>: kokkuvõtvad hinded aastate kaupa */
export function parseSummary(doc: Document): SummaryRow[] {
  const table = doc.querySelector("table.generic_styled");
  if (!table) return [];
  const years = [...table.querySelectorAll("thead th.subject_period")].map((th) => txt(th));
  return [...table.querySelectorAll("tbody tr")].map((tr) => {
    const cells = [...tr.querySelectorAll("td.subject_period")];
    return {
      subject: txt(tr.querySelector("th")),
      years: cells
        .map((td, i) => {
          const periods = [...td.querySelectorAll(":scope > span:not(.sum)")].map((s) => {
            const label = txt(s);
            return label === "•" ? "" : label;
          });
          const final = txt(td.querySelector(".sum")).replace("→", "").trim();
          return { year: years[i] ?? "", periods, final: final || undefined };
        })
        .filter((y) => y.periods.length || y.final),
    };
  });
}

/** Kuupäev "dd.mm" või "d. oktoober" tekstist -> ISO (aasta antakse ette, Stuudium aastat ei näita). */
const months = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];
export function eeDate(text: string, year: number): string | null {
  const m1 = text.match(/(\d{1,2})\.\s*([a-zäöõü]+)/i);
  if (m1) {
    const mi = months.indexOf(m1[2].toLowerCase());
    if (mi >= 0) return `${year}-${String(mi + 1).padStart(2, "0")}-${m1[1].padStart(2, "0")}`;
  }
  const m2 = text.match(/(\d{1,2})\.(\d{2})(?!\d)/);
  return m2 ? `${year}-${m2[2]}-${m2[1].padStart(2, "0")}` : null;
}

/** /s/<id>: hinded (stream-entry) ja tunnid kodutöödega päevade kaupa */
export function parseDashboardGrades(doc: Document, year: number): Grade[] {
  const out: Grade[] = [];
  doc.querySelectorAll(".stream-entry").forEach((e) => {
    const cur = e.querySelector(".grade-current");
    if (!cur) return;
    const verbose = cur.querySelector(".grade-current-verbose");
    const label = verbose ? txt(verbose).replace(/[()]/g, "") : txt(cur);
    const ctx = txt(e.querySelector(".stream-entry-context a")); // "Muusika, R 02. oktoober"
    out.push({
      subject: ctx.split(",")[0].trim(),
      value: numeric(label),
      label,
      date: eeDate(ctx, year) ?? "",
      kind: txt(e.querySelector(".grade-label")) || "Hinne",
    });
  });
  return out;
}

/** Ülesanded, kodutööd ja kontrolltööd (täpse kuupäevaga, data-date=YYYYMMDD) */
export function parseTodos(doc: Document): (Homework & { id: string; isTest: boolean })[] {
  return [...doc.querySelectorAll(".todo_container")].flatMap((c) => {
    const todo = c.querySelector(".todo");
    const ymd = c.getAttribute("data-date") ?? "";
    if (!todo || ymd.length !== 8) return [];
    return [
      {
        id: todo.querySelector("input")?.getAttribute("data-k") ?? "",
        subject: txt(todo.querySelector(".subject_name")),
        text: txt(todo.querySelector(".todo_content")),
        due: `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`,
        isTest: todo.classList.contains("is_test"),
      },
    ];
  });
}

/** /suhtlus/calendar: sündmused (postitused) kuupäeva järgi */
export function parseCalendar(doc: Document): CalEvent[] {
  return [...doc.querySelectorAll(".cal-day[data-cal-date]")].flatMap((day) => {
    const date = day.getAttribute("data-cal-date")!;
    return [...day.querySelectorAll("a.cal-ev")].map((a) => {
      let title = txt(a);
      let start = date;
      let end: string | undefined;
      const t = title.match(/^(\d{1,2}(?::\d{2})?)\s*[–-]\s*(\d{1,2}(?::\d{2})?)\s+(.*)$/); // "11–11:45 Pealkiri"
      if (t) {
        const hm = (x: string) => (x.includes(":") ? x.padStart(5, "0") : x.padStart(2, "0") + ":00");
        start = `${date}T${hm(t[1])}`;
        end = `${date}T${hm(t[2])}`;
        title = t[3];
      }
      const cls = title.match(/\b(\d{1,2}\.\s?[a-zA-Z])\b/); // "5.b klassiõhtu"
      return {
        id: a.getAttribute("data-post-id") ?? `${date}-${title}`,
        title,
        start,
        end,
        allDay: !t,
        scope: cls ? "class" : "school",
        className: cls ? cls[1].replace(/\s/g, "").toLowerCase() : undefined,
      } as CalEvent;
    });
  });
}

export function parseAbsences(_doc: Document): Absence[] {
  return []; // õpilase puudumised pole veel näidislehel (praegu ainult õpetajate puudumised)
}
