import { readFileSync, writeFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { buildFromDocs, emptyData } from "../src/data/build";
const [out, ...files] = process.argv.slice(2);
const docs = files.map((f) => new JSDOM(readFileSync(f, "utf8")).window.document);
const d = buildFromDocs(docs, emptyData(), { year: 2026, teacher: "Olena", className: "5b" });
writeFileSync(out, JSON.stringify({ ...d, room: undefined }));
