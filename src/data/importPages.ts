import type { StuudiumData } from "./types";
import { getSettings } from "./settings";
import { parseCalendar, parseRemarks, parseClassNotes, parseChatRoom, parsePosts, parseGradeGrid, parseDashboardGrades, parseSummary, parseTodos } from "./parsers";

/** Loeb kasutaja salvestatud Stuudiumi lehti (HTML) ja ehitab nendest andmed. Kõik jääb seadmesse. */
export async function importPages(files: File[], base: StuudiumData): Promise<StuudiumData> {
  const data: StuudiumData = { ...base, grades: [], homework: [], events: [], summary: [], remarks: [], posts: [], cells: [], classNotes: [], schedule: [], absences: [] };
  const year = new Date().getFullYear();
  for (const f of files) {
    const html = await f.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (doc.querySelector(".users-summary-v1")) data.summary = parseSummary(doc);
    if (doc.querySelector("#dashboard_recent")) {
      data.classNotes = parseClassNotes(doc, year);
      if (!data.remarks.length) data.remarks = parseRemarks(doc, year);
      if (!data.grades.length) data.grades = parseDashboardGrades(doc, year);
      data.homework = parseTodos(doc).map((t) => ({ ...t, text: (t.isTest ? "Kontrolltöö: " : "") + t.text }));
    }
    if (doc.querySelector("table.student_lessons_grades")) {
      // Tabel on täpseim allikas (kõik päevad, puudumised, ! märkused): ületab ülevaate lehe
      const grid = parseGradeGrid(doc);
      data.grades = grid.grades;
      data.remarks = grid.remarks;
      data.cells = grid.cells;
    }
    if (doc.querySelector(".chat-room-messages")) data.room = parseChatRoom(doc) ?? undefined;
    if (doc.querySelector(".post-in-list")) {
      const st = getSettings();
      const found = parsePosts(doc, year, st.classTeacher, st.className);
      // sama postitus eri lehtedelt (nimekiri + üksik leht): ühenda, jäta alles rohkem vastuseid
      const byId = new Map(data.posts.map((p) => [p.id, p]));
      found.forEach((p) => {
        const old = byId.get(p.id);
        byId.set(p.id, old && old.comments.length > p.comments.length ? { ...p, comments: old.comments, activity: old.activity > p.activity ? old.activity : p.activity, updated: old.updated || p.updated } : p);
      });
      data.posts = [...byId.values()];
      data.classTeacher = st.classTeacher;
      data.className = st.className;
    }
    if (doc.querySelector(".suhtlus-calendar, .cal-day")) data.events = parseCalendar(doc);
  }
  return data;
}
