import { buildFromDocs, emptyData } from "../../src/data/build";
import { deriveKeys } from "../../src/data/chatCrypto";
import { setClientConfig } from "../../src/data/chatApi";
import { saveSnapshot } from "../../src/data/snapshot";
import type { ExtSettings } from "./shared";

export type ProcessResult = { ok: boolean; message: string; counts?: Record<string, number> };

/** Parsib lehed, krüpteerib ja saadab pilve. Vajab DOM-i (DOMParser): Chromiumis offscreen-dokument, Firefoxis taustaleht. */
export async function processPages(pages: string[], s: ExtSettings): Promise<ProcessResult> {
  try {
    const docs = pages.map((h) => new DOMParser().parseFromString(h, "text/html"));
    const data = buildFromDocs(docs, emptyData(), { year: new Date().getFullYear(), teacher: s.teacher, className: s.className, baseUrl: `https://${s.host}` });
    setClientConfig(s.supabaseUrl, s.supabaseKey);
    await saveSnapshot(await deriveKeys(s.password), data);
    return { ok: true, message: "ok", counts: { hinded: data.grades.length, märkused: data.remarks.length, kodutööd: data.homework.length, sündmused: data.events.length, postitused: data.posts.length, klassijuhataja: data.posts.filter((p) => p.fromClassTeacher).length } };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
