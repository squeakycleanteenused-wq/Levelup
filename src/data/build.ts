import type { StuudiumData } from "./types";
import { parseCalendar, parseRemarks, parseClassNotes, parseChatRoom, parsePosts, parseGradeGrid, parseDashboardGrades, parseSummary, parseTodos } from "./parsers";

export const emptyData = (student = ""): StuudiumData => ({
  student, grades: [], schedule: [], homework: [], events: [], summary: [], remarks: [], posts: [], cells: [], classNotes: [], absences: [],
});

export type BuildOpts = { year: number; teacher: string; className: string; baseUrl?: string };

/** Ehitab andmed Stuudiumi lehtedest (Document'idest). Kasutavad nii äpp (import) kui brauserilaiendus. */
export function buildFromDocs(docs: Document[], base: StuudiumData, o: BuildOpts): StuudiumData {
  const links: Record<string, string> = {};
  const abs = (h: string) => (o.baseUrl && h.startsWith("/") ? o.baseUrl + h : h);
  const data: StuudiumData = { ...base, baseUrl: o.baseUrl, grades: [], homework: [], events: [], summary: [], remarks: [], posts: [], cells: [], classNotes: [], schedule: [], absences: [] };
  for (const doc of docs) {
    if (doc.querySelector(".users-summary-v1")) data.summary = parseSummary(doc);
    if (doc.querySelector("#dashboard_recent")) {
      doc.querySelectorAll('.stream-entry-context a[href*="/subjects/student/"]').forEach((a) => {
        const subj = (a.textContent ?? "").split(",")[0].trim();
        if (subj && !links[subj]) links[subj] = abs(a.getAttribute("href")!);
      });
      data.classNotes = parseClassNotes(doc, o.year);
      if (!data.remarks.length) data.remarks = parseRemarks(doc, o.year);
      if (!data.grades.length) data.grades = parseDashboardGrades(doc, o.year);
      data.homework = parseTodos(doc).map((t) => ({ ...t, text: t.isTest ? (t.text ? "Kontrolltöö: " + t.text : "Kontrolltöö") : t.text }));
    }
    if (doc.querySelector("table.student_lessons_grades")) {
      // Tabel on täpseim allikas (kõik päevad, puudumised, ! märkused): ületab ülevaate lehe
      const grid = parseGradeGrid(doc);
      data.grades = grid.grades;
      data.remarks = grid.remarks;
      data.cells = grid.cells;
      Object.entries(grid.links).forEach(([k, v]) => (links[k] = abs(v)));
    }
    if (doc.querySelector(".chat-room-messages")) data.room = parseChatRoom(doc) ?? undefined;
    if (doc.querySelector(".post-in-list")) {
      const found = parsePosts(doc, o.year, o.teacher, o.className);
      // sama postitus eri lehtedelt (nimekiri + üksik leht): ühenda, jäta alles rohkem vastuseid
      const byId = new Map(data.posts.map((p) => [p.id, p]));
      found.forEach((p) => {
        const old = byId.get(p.id);
        byId.set(p.id, old && old.comments.length > p.comments.length ? { ...p, comments: old.comments, activity: old.activity > p.activity ? old.activity : p.activity, updated: old.updated || p.updated } : p);
      });
      data.posts = [...byId.values()];
      data.classTeacher = o.teacher;
      data.className = o.className;
    }
    if (doc.querySelector(".suhtlus-calendar, .cal-day")) data.events = parseCalendar(doc);
  }
  data.links = links;
  return data;
}
