import { buildFromDocs, emptyData } from "../../src/data/build";
import { deriveKeys } from "../../src/data/chatCrypto";
import { setClientConfig } from "../../src/data/chatApi";
import { saveSnapshot } from "../../src/data/snapshot";
import type { ExtSettings } from "./shared";

chrome.runtime.onMessage.addListener((m, _s, send) => {
  if (m?.target !== "offscreen" || m.type !== "process") return false;
  (async () => {
    try {
      const s = m.settings as ExtSettings;
      const docs = (m.pages as string[]).map((h) => new DOMParser().parseFromString(h, "text/html"));
      const data = buildFromDocs(docs, emptyData(), { year: new Date().getFullYear(), teacher: s.teacher, className: s.className, baseUrl: `https://${s.host}` });
      setClientConfig(s.supabaseUrl, s.supabaseKey);
      await saveSnapshot(await deriveKeys(s.password), data);
      send({ ok: true, message: "ok", counts: { hinded: data.grades.length, märkused: data.remarks.length, kodutööd: data.homework.length, sündmused: data.events.length, postitused: data.posts.length, klassijuhataja: data.posts.filter((p) => p.fromClassTeacher).length } });
    } catch (e) {
      send({ ok: false, message: (e as Error).message });
    }
  })();
  return true;
});
