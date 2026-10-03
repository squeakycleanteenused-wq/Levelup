import { useState } from "react";
import type { Homework as HW, StuudiumData } from "../data/types";
import { done } from "../data/seen";
import { daysFromToday, rel, todayIso } from "../data/dates";

function Item({ h, onToggle }: { h: HW; onToggle: () => void }) {
  const [open, setOpen] = useState(false);
  const ok = done.has(h.id);
  const long = h.text.length > 110;
  return (
    <div className="hw" style={{ opacity: ok ? 0.45 : 1 }}>
      <input type="checkbox" checked={ok} onChange={onToggle} aria-label="Tehtud" />
      <div onClick={() => long && setOpen(!open)} style={{ cursor: long ? "pointer" : "default" }}>
        <b>{h.subject}</b>
        <div><small>{open || !long ? h.text : h.text.slice(0, 110) + "… (näita rohkem)"}</small></div>
      </div>
    </div>
  );
}

/** Kodused tööd päevade kaupa: hilinenud esimesena, siis täna, homme, ülejäänud. */
export default function Homework({ data }: { data: StuudiumData }) {
  const [, bump] = useState(0);
  const today = todayIso();
  const open = [...data.homework].filter((h) => !(done.has(h.id) && h.due < today));
  const groups = new Map<string, HW[]>();
  open.sort((a, b) => a.due.localeCompare(b.due)).forEach((h) => groups.set(h.due, [...(groups.get(h.due) ?? []), h]));
  const toggle = (id: string) => { done.toggle(id); bump((n) => n + 1); };

  return (
    <section className="card">
      <h2>Kodused tööd</h2>
      {!groups.size && <p>Kodutöid pole. 🎉</p>}
      {[...groups].map(([due, list]) => {
        const late = daysFromToday(due) < 0;
        const allDone = list.every((h) => done.has(h.id));
        return (
          <div key={due} style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 700, color: late && !allDone ? "#d33" : daysFromToday(due) <= 1 ? "#c2410c" : "inherit" }}>
              {late ? "Hilinenud · " : ""}{new Date(due + "T12:00").toLocaleDateString("et-EE", { weekday: "long", day: "numeric", month: "numeric" })}
              <small style={{ fontWeight: 400 }}> · {rel(due)}</small>
            </div>
            {list.map((h) => <Item key={h.id} h={h} onToggle={() => toggle(h.id)} />)}
          </div>
        );
      })}
    </section>
  );
}
