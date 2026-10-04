import { useEffect, useState } from "react";
import type { StuudiumData } from "./data/types";
import { deriveKeys } from "./data/chatCrypto";
import { chatConfigured } from "./data/chatApi";
import { loadSnapshot } from "./data/snapshot";
import { MAPLE, applyTheme, getAnimOn, getTheme, seasonOf, setAnimOn } from "./theme";
import Falling from "./views/Falling";
import Pomodoro from "./views/Pomodoro";
import Decor from "./views/Decor";
import Status from "./views/Status";
import Homework from "./views/Homework";
import Attention from "./views/Attention";
import { ClassPosts } from "./views/Posts";
import Chat from "./views/Chat";
import Points from "./views/Points";
import type { ChatKeys } from "./data/chatCrypto";
import Unlock from "./views/Unlock";

const get = (k: string) => { try { return localStorage.getItem(k) ?? ""; } catch { return ""; } };
const put = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignoreeri */ } };
const password = () => get("familyPw") || (import.meta.env.DEV ? ((import.meta.env.VITE_FAMILY_PASSWORD as string | undefined) ?? "") : "");

// Hädaväljapääs: lisa aadressi lõppu ?reset=1, et unustada salvestatud parool ja andmed selles seadmes
if (typeof location !== "undefined" && new URLSearchParams(location.search).has("reset")) {
  try { ["familyPw", "data", "updatedAt"].forEach((k) => localStorage.removeItem(k)); } catch { /* ignoreeri */ }
  history.replaceState(null, "", location.pathname);
}

export default function App() {
  const season = seasonOf();
  const [tab, setTab] = useState<"home" | "points" | "chat">("home");
  const [keys, setKeys] = useState<ChatKeys | null>(null);
  const [data, setData] = useState<StuudiumData | null>(() => { try { return JSON.parse(get("data")) as StuudiumData; } catch { return null; } });
  const [updated, setUpdated] = useState(get("updatedAt"));
  const [pw, setPw] = useState(password());
  const [error, setError] = useState("");
  const [wrong, setWrong] = useState(false);
  const [theme, setTheme] = useState(getTheme());
  const [anim, setAnim] = useState(getAnimOn() && !matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => applyTheme(theme), [theme]);
  useEffect(() => { document.documentElement.dataset.season = season; }, [season]);

  // Andmed tulevad pilvest (neid uuendab brauserilaiendus). Laeme avamisel ja iga 5 minuti järel.
  useEffect(() => {
    if (!pw || !chatConfigured) return;
    let stop = false;
    const pull = async () => {
      try {
        const s = await loadSnapshot(await deriveKeys(pw));
        if (stop) return;
        if (!s) { setWrong(true); return setError("Selle parooliga pole andmeid. Kas parool on vale, või laiendus pole veel andmeid saatnud?"); }
        setWrong(false);
        setError("");
        setData(s.data);
        setUpdated(s.at);
        put("data", JSON.stringify(s.data));
        put("updatedAt", s.at);
      } catch (e) {
        if (!stop) setError("Ühendus pilvega ebaõnnestus: " + String(e));
      }
    };
    pull();
    const t = setInterval(pull, 5 * 60_000);
    return () => { stop = true; clearInterval(t); };
  }, [pw]);

  useEffect(() => { if (pw) deriveKeys(pw).then(setKeys); else setKeys(null); }, [pw]);

  const unlock = (p: string) => { put("familyPw", p); setError(""); setWrong(false); setPw(p); };
  const changePassword = () => { try { localStorage.removeItem("familyPw"); } catch { /* ignoreeri */ } setPw(""); setKeys(null); setError(""); setWrong(false); };
  const when = updated ? new Date(updated).toLocaleString("et-EE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className="app">
      {anim && <Falling season={season} />}
      <header>
        <svg className="maple" viewBox="0 0 24 24" width="34" height="34" aria-label="Variku vahtraleht"><path d={MAPLE} /></svg>
        <h1>Levelup</h1>
        <Pomodoro />
        <button className="chip" onClick={() => setTheme(theme === "auto" ? "light" : theme === "light" ? "dark" : "auto")} title="Teema: auto, hele, tume">{theme === "auto" ? "🌗" : theme === "light" ? "☀️" : "🌙"}</button>
        <button className="ghost" onClick={() => { setAnimOn(!anim); setAnim(!anim); }} title="Animatsioon">{anim ? "🍂" : "⏸"}</button>
      </header>

      {tab === "home" && (
        <main>
          {(!pw || (wrong && !data)) && <Unlock error={error} onUnlock={unlock} />}
          {pw && !wrong && error && !data && <p className="err pad">{error}</p>}
          {pw && !wrong && !data && !error && <p className="pad">Laen…</p>}
          {data && (
            <>
              <Status data={data} />
              <Attention data={data} />
              <ClassPosts data={data} limit={5} />
              <Homework data={data} />
              {when && <small className="pad">Uuendatud {when}</small>}
              {error && <small className="err pad"> {error}</small>}
            </>
          )}
          <Decor season={season} />
          {pw && <p className="pad"><button className="link" onClick={changePassword}>🔑 Vaheta parool</button></p>}
        </main>
      )}
      {tab === "points" && <main><Points data={data} keys={keys} /></main>}
      {tab === "chat" && <main><Chat /></main>}

      <nav>
        <button className={tab === "home" ? "on" : ""} onClick={() => setTab("home")}>Avaleht</button>
        <button className={tab === "points" ? "on" : ""} onClick={() => setTab("points")}>Punktid</button>
        <button className={tab === "chat" ? "on" : ""} onClick={() => setTab("chat")}>Vanemate chat</button>
      </nav>
    </div>
  );
}
