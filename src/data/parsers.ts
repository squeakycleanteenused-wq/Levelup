import type { ChatRoom, Post, ClassNote, LessonCell, Absence, CalEvent, Grade, Homework, Remark, SummaryRow } from "./types";

/**
 * Parserid on kirjutatud päris Stuudiumi lehtede (lapsevanema vaade, variku.ope.ee) järgi.
 * Töötavad nii brauseris kui Node'is (DOMParser/jsdom), sisend on Document.
 */
const txt = (el: Element | null | undefined) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
/** Loetav tekst: reavahetused tühikuks, lingi URL (.slh) välja, et tekst ei jookseks kokku. */
const readable = (el: Element | null | undefined) => {
  if (!el) return "";
  const c = el.cloneNode(true) as Element;
  c.querySelectorAll("br").forEach((b) => b.replaceWith(" "));
  c.querySelectorAll(".slh").forEach((x) => x.remove());
  return (c.textContent ?? "").replace(/\s+/g, " ").trim();
};
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
        text: readable(todo.querySelector(".todo_content")),
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

/** Märked, puudumised ja õpetajate kommentaarid, mida Stuudium peidab hindade vahele. */
export function parseRemarks(doc: Document, year: number): Remark[] {
  const out: Remark[] = [];
  doc.querySelectorAll(".stream-entry").forEach((e) => {
    const ctx = txt(e.querySelector(".stream-entry-context a"));
    const base = {
      subject: ctx.split(",")[0].trim(),
      date: eeDate(ctx, year) ?? "",
      teacher: e.querySelector(".stream-entry-avatar")?.getAttribute("data-balloon") ?? undefined,
      hasGrade: !!e.querySelector(".grade-current"),
    };
    e.querySelectorAll(".grade-param").forEach((p) => {
      const cls = p.className;
      const label = txt(p);
      const extra = txt(p.nextElementSibling?.classList.contains("grade-param-extra") ? p.nextElementSibling : null);
      const unexcused = /unexcused/.test(cls) || /põhjendamata/i.test(extra);
      const excused = !unexcused && (/excused/.test(cls) || /põhjendatud/i.test(extra));
      const kind: Remark["kind"] = /absent/.test(cls) || /^puud/i.test(label) ? "puudumine"
        : /late|hili/i.test(cls + label) ? "hilinemine"
        : /kodu|tegemata|homework/i.test(cls + label) ? "tegemata töö"
        : "muu";
      out.push({ ...base, kind, text: [label, extra].filter(Boolean).join(": "), excused: kind === "puudumine" ? excused : undefined });
    });
    const note = txt(e.querySelector(".ng-notes"));
    if (note) out.push({ ...base, kind: "tagasiside", text: note });
  });
  return out;
}

/** "Klassijuhatamine" tundide märkmed ja kodutööd päeva kaupa (klassijuhataja info dashboardil). */
export function parseClassNotes(doc: Document, year: number): ClassNote[] {
  const out: ClassNote[] = [];
  doc.querySelectorAll(".daily-summaries-segment").forEach((seg) => {
    const date = eeDate(txt(seg.querySelector(".daily-summaries-segment-heading")), year) ?? "";
    seg.querySelectorAll(".daily-summaries-segment-block-lesson").forEach((l) => {
      if (!/klassijuhatamine/i.test(txt(l.querySelector(".daily-summaries-segment-lesson-subject")))) return;
      const hw = l.querySelector(".daily-summaries-segment-lesson-homework-contents");
      const hwText = txt(hw).replace(/^Kodutöö tähtajaga[^:]*:\s*/, "");
      out.push({
        id: l.getAttribute("data-ds-lesson") ?? `${date}-cl`,
        date,
        text: txt(l.querySelector(".daily-summaries-segment-lesson-notes")),
        homework: hwText || undefined,
        homeworkDue: hw ? eeDate(txt(hw.querySelector("strong")), year) ?? undefined : undefined,
      });
    });
  });
  return out;
}

/**
 * /grades/student/<id>: hinnete tabel (ained x päevad).
 * Sümbolid: H hilines, P puudus (põhjusega/põhjuseta), V vabastatud, K kodutöö tegemata,
 * ! tähelepanu (õpetaja märkus), jutumull = õpetaja tagasiside hindele.
 */
export function parseGradeGrid(doc: Document): { grades: Grade[]; remarks: Remark[]; cells: LessonCell[]; links: Record<string, string> } {
  const links: Record<string, string> = {};
  const grades: Grade[] = [];
  const remarks: Remark[] = [];
  const cells: LessonCell[] = [];
  doc.querySelectorAll("table.student_lessons_grades tbody tr").forEach((tr) => {
    const subject = txt(tr.querySelector("th"));
    const href = tr.querySelector("th a")?.getAttribute("href");
    if (href && subject) links[subject] = href;
    tr.querySelectorAll("td.summary").forEach((td) => {
      const ymd = /lesson_(\d{8})/.exec(td.className)?.[1];
      if (!ymd) return;
      const date = `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
      const noteOf = (n: Element | null) => {
        if (!n) return "";
        const c = n.cloneNode(true) as Element;
        c.querySelectorAll(".grade_params").forEach((x) => x.remove());
        return txt(c);
      };
      const topics = [...td.querySelectorAll(".lesson_notes")].map(noteOf).filter(Boolean);
      const homework = [...td.querySelectorAll(".lesson_homework")]
        .map((h) => {
          const c = h.cloneNode(true) as Element;
          const due = txt(c.querySelector("strong b")); // "05.10"
          c.querySelector("strong")?.remove(); // "Kodutöö 05.10:" on juba kirjas, ei korda
          return { due, text: readable(c) };
        })
        .filter((x) => x.text);
      const cell: LessonCell = { subject, date, topics, homework };
      const added = new Set<string>();
      const add = (r: Remark) => {
        const k = r.kind + r.text;
        if (!added.has(k)) { added.add(k); remarks.push(r); }
      };
      const base = { subject, date, hasGrade: false };

      td.querySelectorAll(".grade").forEach((g) => {
        const label = txt(g.querySelector(".grade_active"));
        if (!label) return;
        const note = txt(g.querySelector(".grade_notes"));
        grades.push({ subject, value: numeric(label), label, date, kind: g.closest(".grade_is_important") ? "Kontrolltöö" : "Hinne", note: note || undefined });
        if (note) add({ ...base, hasGrade: true, kind: "tagasiside", text: note });
      });

      td.querySelectorAll('[class*="grade_param_is_"]').forEach((p) => {
        const c = p.className;
        if (/is_notify/.test(c)) {
          add({ ...base, kind: "märkus", text: td.getAttribute("data-notes") || noteOf(p.closest(".lesson_notes")) || "Tähelepanu" });
        } else if (/is_absent/.test(c)) {
          const excused = /absent_excused/.test(c);
          add({ ...base, kind: "puudumine", excused, text: excused ? "Puudus põhjusega" : "Puudus põhjuseta" });
        } else if (/is_late/.test(c)) add({ ...base, kind: "hilinemine", text: "Hilines" });
        else if (/is_no_homework/.test(c)) add({ ...base, kind: "tegemata töö", text: "Kodutöö tegemata" });
        else if (/is_excused/.test(c)) add({ ...base, kind: "vabastatud", text: "Vabastatud" });
      });
      if (topics.length || homework.length || td.querySelector(".grade_container")) cells.push(cell);
    });
  });
  return { grades, remarks, cells, links };
}

/** Nimi sobib eesnime järgi ("Olena" leiab "Olena Shanina"), tõstutundetult. */
const hasName = (text: string, name: string) => !!name && new RegExp(`(^|\\s)${name.trim()}(\\s|$)`, "i").test(text);

const shortMonths = ["jaan", "veebr", "märts", "apr", "mai", "juuni", "juuli", "aug", "sept", "okt", "nov", "dets"];
/** "2. okt kell 15:38" -> "2026-10-02" */
function postDate(text: string, year: number): string {
  const m = text.match(/(\d{1,2})\.\s*([a-zäöõü]+)/i);
  const mi = m ? shortMonths.findIndex((x) => m[2].toLowerCase().startsWith(x)) : -1;
  if (!m || mi < 0) return "";
  const iso = `${year}-${String(mi + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  // Stuudium ei näita aastat: tulevikku jääv kuupäev kuulub eelmisesse aastasse
  return iso > new Date(Date.now() + 864e5).toISOString().slice(0, 10) ? `${year - 1}${iso.slice(4)}` : iso;
}
/** Postituste nimekirja kuupäevapealkiri "02.10" / "29.9" -> ISO */
function dividerDate(text: string, year: number): string {
  const m = text.match(/(\d{1,2})\.(\d{1,2})/);
  return m ? `${year}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : "";
}

/**
 * /suhtlus/ (postkast) ja /suhtlus/p/<id> (üks postitus koos vastustega).
 * Nimekirja kuupäevapealkiri = viimane tegevus; kui see on hilisem kui loomise kuupäev, on postitust uuendatud.
 */
export function parsePosts(doc: Document, year: number, teacher: string, className: string): Post[] {
  const out: Post[] = [];
  const cls = className.toLowerCase().replace(/\s|\./g, "");
  let divider = "";
  const root = doc.querySelector(".post-list-posts") ?? doc;
  root.querySelectorAll(".post-list-date-divider, .post-in-list").forEach((el) => {
    if (el.classList.contains("post-list-date-divider")) {
      divider = dividerDate(txt(el), year);
      return;
    }
    if (el.classList.contains("post-is-merged-hidden")) return;
    const id = el.getAttribute("data-post-id");
    if (!id) return;
    const author = txt(el.querySelector(".post-author"));
    const created = postDate(txt(el.querySelector(".post-date")), year);
    const audience = [...el.querySelectorAll(".post-participants-summary .bl-p")].map((x) => txt(x)).filter((x) => x && x !== "…");
    const comments = [...el.querySelectorAll(".post-comment[data-comment-id]")].map((c) => ({
      author: txt(c.querySelector(".comment-author")),
      date: postDate(txt(c.querySelector(".comment-date")), year),
      text: txt(c.querySelector(".comment-body")),
    }));
    const count = Number(txt(el.querySelector(".post-comments-summary")).match(/\d+/)?.[0] ?? comments.length);
    const lastComment = comments.map((c) => c.date).sort().pop() ?? "";
    const activity = [divider, lastComment, created].filter(Boolean).sort().pop() ?? created;
    const forMyClass = audience.some((a) => a.toLowerCase().replace(/\s|\./g, "").startsWith(cls));
    out.push({
      id,
      title: txt(el.querySelector(".post-title-main")),
      author,
      created,
      activity,
      updated: activity > created,
      text: (el.querySelector(".post-body.formatted-text")?.innerHTML ?? "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/[ \t]+/g, " ").trim(),
      audience,
      commentCount: count,
      comments,
      fromClassTeacher: hasName(author, teacher) || audience.some((a) => hasName(a, teacher)),
      forMyClass,
    });
  });
  return out;
}

/** /chat/g/<id>: klassi jututuba (laste vestlus). */
export function parseChatRoom(doc: Document): ChatRoom | null {
  const room = doc.querySelector(".chat-room");
  if (!room) return null;
  return {
    title: txt(room.querySelector(".chat-room-main .chat-room-title")) || txt(room.querySelector(".chat-room-title")),
    canSend: room.getAttribute("data-chat-can-send-messages") === "1",
    messages: [...room.querySelectorAll(".chat-room-messages .msg[data-id]")].map((m) => ({
      id: m.getAttribute("data-id")!,
      userId: m.getAttribute("data-u") ?? "",
      name: m.getAttribute("data-un") ?? txt(m.querySelector(".mu")),
      date: m.getAttribute("data-dt") ?? "",
      time: txt(m.querySelector(".mts")),
      text: txt(m.querySelector(".msg-msg")),
    })),
  };
}
