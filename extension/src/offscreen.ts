import { processPages } from "./process";
import type { ExtSettings } from "./shared";

chrome.runtime.onMessage.addListener((m, _s, send) => {
  if (m?.target !== "offscreen" || m.type !== "process") return false;
  processPages(m.pages as string[], m.settings as ExtSettings).then(send);
  return true;
});
