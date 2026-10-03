import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { buildFromDocs, emptyData } from "../src/data/build";
const docs = process.argv.slice(2).map((f) => new JSDOM(readFileSync(f, "utf8")).window.document);
const d = buildFromDocs(docs, emptyData(), { year: 2026, teacher: "Olena", className: "5b", baseUrl: "https://variku.ope.ee" });
console.log({ grades: d.grades.length, remarks: d.remarks.length, cells: d.cells.length, homework: d.homework.length, events: d.events.length, posts: d.posts.length, olena: d.posts.filter((p) => p.fromClassTeacher).length, summary: d.summary.length, classNotes: d.classNotes.length, room: d.room?.messages.length });

import { conduct } from "../src/data/attention";
console.log("links:", Object.keys(d.links ?? {}).length);
conduct(d).slice(0, 4).forEach((i) => console.log(i.kind, "|", i.title, "|", i.url));
