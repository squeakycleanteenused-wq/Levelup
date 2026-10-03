import type { StuudiumData } from "./types";
import { parseCalendar, parseRemarks, parseDashboardGrades, parseSummary, parseTodos } from "./parsers";

/** Loeb kasutaja salvestatud Stuudiumi lehti (HTML) ja ehitab nendest andmed. Kõik jääb seadmesse. */
export async function importPages(files: File[], base: StuudiumData): Promise<StuudiumData> {
  const data: StuudiumData = { ...base, grades: [], homework: [], events: [], summary: [], remarks: [], schedule: [], absences: [] };
  const year = new Date().getFullYear();
  for (const f of files) {
    const html = await f.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (doc.querySelector(".users-summary-v1")) data.summary = parseSummary(doc);
    if (doc.querySelector("#dashboard_recent")) {
      data.remarks = parseRemarks(doc, year);
      data.grades = parseDashboardGrades(doc, year);
      data.homework = parseTodos(doc).map((t) => ({ ...t, text: (t.isTest ? "Kontrolltöö: " : "") + t.text }));
    }
    if (doc.querySelector(".suhtlus-calendar, .cal-day")) data.events = parseCalendar(doc);
  }
  return data;
}
