import { useEffect, useState } from "react";
import type { StuudiumData } from "./data/types";
import { demoSource } from "./data/demo";
import { isTauri, login, stuudiumSource } from "./data/stuudium";
import { importPages } from "./data/importPages";
import Home from "./views/Home";
import Grades from "./views/Grades";
import Planner from "./views/Planner";
import CalendarSync from "./views/CalendarSync";

const tabs = ["Avaleht", "Hinded", "Tunniplaan", "Kalender"] as const;
type Tab = (typeof tabs)[number];

export default function App() {
  const [tab, setTab] = useState<Tab>("Avaleht");
  const [data, setData] = useState<StuudiumData | null>(null);
  const [live, setLive] = useState(false);
  const [error, setError] = useState("");

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
      <header>
        <h1>Levelup</h1>
        <span className="badge">{live ? "Stuudium" : "Demo"}</span>
      </header>

      <label className="card">
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
        {tab === "Hinded" && <Grades data={data} />}
        {tab === "Tunniplaan" && <Planner data={data} />}
        {tab === "Kalender" && <CalendarSync data={data} />}
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
