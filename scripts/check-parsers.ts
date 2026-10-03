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
