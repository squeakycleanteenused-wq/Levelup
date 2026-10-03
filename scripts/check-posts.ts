import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { parsePosts } from "../src/data/parsers";
for (const f of process.argv.slice(2)) {
  const posts = parsePosts(new JSDOM(readFileSync(f, "utf8")).window.document, 2026, "Olena Shanina", "5b");
  console.log("==", f.slice(-40), posts.length);
  posts.forEach((p) => console.log(`${p.id} ${p.fromClassTeacher ? "T" : "-"}${p.forMyClass ? "K" : "-"}${p.updated ? "U" : "-"} ${p.created}->${p.activity} ${p.author} | ${p.title.slice(0, 35)} | ${p.audience.join("+")} | c${p.commentCount}/${p.comments.length}`));
}
