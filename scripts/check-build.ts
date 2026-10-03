import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { buildFromDocs, emptyData } from "../src/data/build";
const docs = process.argv.slice(2).map((f) => new JSDOM(readFileSync(f, "utf8")).window.document);
const d = buildFromDocs(docs, emptyData(), { year: 2026, teacher: "Olena", className: "5b" });
console.log({ grades: d.grades.length, remarks: d.remarks.length, cells: d.cells.length, homework: d.homework.length, events: d.events.length, posts: d.posts.length, olena: d.posts.filter((p) => p.fromClassTeacher).length, summary: d.summary.length, classNotes: d.classNotes.length, room: d.room?.messages.length });
