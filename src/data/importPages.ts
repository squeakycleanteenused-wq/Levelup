import type { StuudiumData } from "./types";
import { getSettings } from "./settings";
import { buildFromDocs } from "./build";

/** Loeb kasutaja salvestatud Stuudiumi lehti (HTML) ja ehitab nendest andmed. Kõik jääb seadmesse. */
export async function importPages(files: File[], base: StuudiumData): Promise<StuudiumData> {
  const st = getSettings();
  const docs = await Promise.all(files.map(async (f) => new DOMParser().parseFromString(await f.text(), "text/html")));
  return buildFromDocs(docs, base, { year: new Date().getFullYear(), teacher: st.classTeacher, className: st.className });
}
