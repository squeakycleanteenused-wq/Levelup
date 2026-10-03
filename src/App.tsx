import { useEffect, useState } from "react";
import type { StuudiumData } from "./data/types";
import { demoSource } from "./data/demo";
import { isTauri, login, stuudiumSource } from "./data/stuudium";
import { importPages } from "./data/importPages";
import Decor from "./views/Decor";
import Pomodoro from "./views/Pomodoro";
import Falling from "./views/Falling";
import { MAPLE, applyTheme, getAnimOn, getTheme, seasonOf, setAnimOn } from "./theme";
import Chat from "./views/Chat";
import Posts from "./views/Posts";
import Attention from "./views/Attention";
import Home from "./views/Home";
import Grades from "./views/Grades";
import Planner from "./views/Planner";
import CalendarSync from "./views/CalendarSync";

const tabs = ["Avaleht", "Postitused", "Tähelepanu", "Hinded", "Tunniplaan", "Kalender", "Chat"] as const;
type Tab = (typeof tabs)[number];

export default function App() {
  const [tab, setTab] = useState<Tab>("Avaleht");
  const [data, setData] = useState<StuudiumData | null>(null);
  const [live, setLive] = useState(false);
  const [error, setError] = useState("");
  const season = seasonOf();
  const [anim, setAnim] = useState(getAnimOn() && !matchMedia("(prefers-reduced-motion: reduce)").matches);

  const [theme, setTheme] = useState(getTheme());
  useEffect(() => applyTheme(theme), [theme]);

  useEffect(() => {
    document.documentElement.dataset.season = season;
  }, [season]);

  useEffect(() => {
    demoSource.load().then(setData);
  }, []);

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])];
    if (files.length && data) setData(await importPages(files, data));
    setLive(true);
  }

  async function connect(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      setError("");
      await login(String(f.get("u")), String(f.get("p")));
      setData(await stuudiumSource.load());
      setLive(true);
    } catch (err) {
      setError(String(err));
    }
  }

  if (!data) return <p className="pad">Laen…</p>;

  return (
    <div className="app">
      {anim && <Falling season={season} />}
      <header>
        <svg className="maple" viewBox="0 0 24 24" width="34" height="34" aria-label="Variku vahtraleht"><path d={MAPLE} /></svg>
        <h1>Levelup</h1>
        <span className="badge">{live ? "Stuudium" : "Demo"}</span>
        <Pomodoro />
        <button className="chip" onClick={() => setTheme(theme === "auto" ? "light" : theme === "light" ? "dark" : "auto")} title="Teema: auto, hele, tume">{theme === "auto" ? "🌗" : theme === "light" ? "☀️" : "🌙"}</button>
        <button className="ghost" onClick={() => { setAnimOn(!anim); setAnim(!anim); }} title="Animatsioon">{anim ? "🍂" : "⏸"}</button>
      </header>

      <label className="card" style={{ display: "block" }}>
        <b>Impordi Stuudiumi lehed (HTML)</b>
        <input type="file" accept=".html,.htm" multiple onChange={onImport} />
        <small>Ülevaade, Kokkuvõtvad hinded ja Kalender. Andmed jäävad sinu seadmesse.</small>
      </label>

      {!live && isTauri() && (
        <form className="card login" onSubmit={connect}>
          <b>Ühenda Stuudiumiga</b>
          <input name="u" placeholder="Kasutajanimi" autoComplete="username" required />
          <input name="p" type="password" placeholder="Parool" autoComplete="current-password" required />
          <button>Logi sisse</button>
          {error && <small className="err">{error}</small>}
        </form>
      )}

      <main>
        {tab === "Avaleht" && <Home data={data} />}
        {tab === "Postitused" && <Posts data={data} />}
        {tab === "Tähelepanu" && <Attention data={data} />}
        {tab === "Hinded" && <Grades data={data} />}
        {tab === "Tunniplaan" && <Planner data={data} />}
        {tab === "Chat" && <Chat />}
        {tab === "Kalender" && <CalendarSync data={data} />}
        <Decor season={season} />
      </main>

      <nav>
        {tabs.map((t) => (
          <button key={t} className={t === tab ? "on" : ""} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>
    </div>
  );
}
