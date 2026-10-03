// Kasutus: npx tsx scripts/check-parsers.ts <summary.html> <dashboard.html> <calendar.html>
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { parseCalendar, parseDashboardGrades, parseSummary, parseTodos } from "../src/data/parsers";

const doc = (p: string) => new JSDOM(readFileSync(p, "utf8")).window.document;
const [summary, dash, cal] = process.argv.slice(2);
console.log("SUMMARY", JSON.stringify(parseSummary(doc(summary)), null, 1).slice(0, 700));
console.log("GRADES", parseDashboardGrades(doc(dash), 2026));
console.log("TODOS", parseTodos(doc(dash)).slice(0, 4), "total", parseTodos(doc(dash)).length);
console.log("CAL", parseCalendar(doc(cal)));

import { parseRemarks } from "../src/data/parsers";
import { attention } from "../src/data/attention";
const remarks = parseRemarks(doc(dash), 2026);
const data: any = { grades: parseDashboardGrades(doc(dash), 2026), remarks, homework: parseTodos(doc(dash)).map((t) => ({ ...t, text: (t.isTest ? "Kontrolltöö: " : "") + t.text })) };
console.log("REMARKS", remarks.length, remarks.map((r) => `${r.kind}|${r.subject}|${r.excused}|${r.hasGrade}|${r.text.slice(0, 40)}`));
console.log("ATTENTION", attention(data, "2026-10-03").map((i) => `${i.severity} ${i.kind} ${i.title} ${i.date} :: ${i.detail.slice(0, 50)}`));

import { parseClassNotes } from "../src/data/parsers";
console.log("CLASSNOTES", parseClassNotes(doc(dash), 2026).map((n) => `${n.date} ${n.text.slice(0, 50)} | ${n.homework?.slice(0, 30)} ${n.homeworkDue}`));
