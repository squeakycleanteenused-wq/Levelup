import { useState } from "react";
import type { StuudiumData } from "../data/types";
import { download, toIcs } from "../data/ics";

export default function CalendarSync({ data }: { data: StuudiumData }) {
  const classes = [...new Set(data.events.filter((e) => e.scope === "class").map((e) => e.className!))];
  const [school, setSchool] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);

  const chosen = data.events.filter((e) => (e.scope === "school" ? school : picked.includes(e.className!)));
  const toggle = (c: string) => setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  return (
    <>
      <section className="card">
        <h2>Kalendrisse</h2>
        <label><input type="checkbox" checked={school} onChange={() => setSchool(!school)} /> Kooli üritused</label>
        {classes.map((c) => (
          <label key={c} style={{ display: "block" }}>
            <input type="checkbox" checked={picked.includes(c)} onChange={() => toggle(c)} /> Klass {c}
          </label>
        ))}
        <p><small>{chosen.length} sündmust valitud. Klassi üritused valid ise, nii et teise klassi asjad kalendrisse ei satu.</small></p>
        <button className="primary" disabled={!chosen.length} onClick={() => download("levelup.ics", toIcs(chosen))}>
          Ekspordi .ics
        </button>
      </section>
      <section className="card">
        <h2>Eelvaade</h2>
        {chosen.map((e) => (
          <p key={e.scope + e.id}><b>{e.start.slice(5, 10)}</b> {e.className && `[${e.className}] `}{e.title}</p>
        ))}
      </section>
    </>
  );
}
