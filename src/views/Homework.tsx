import { useState } from "react";
import type { StuudiumData } from "../data/types";
import { done } from "../data/seen";

/** Kodused tööd tähtaja järgi. Möödunud ja tegemata punaselt, täna/homme esile. */
export default function Homework({ data, limit }: { data: StuudiumData; limit?: number }) {
  const [, bump] = useState(0);
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const list = [...data.homework].sort((a, b) => Number(done.has(a.id)) - Number(done.has(b.id)) || a.due.localeCompare(b.due));
  const shown = limit ? list.slice(0, limit) : list;
  const color = (due: string, ok: boolean) => (ok ? "#888" : due < today ? "#d33" : due <= tomorrow ? "#e8a317" : "inherit");

  return (
    <section className="card">
      <h2>Kodused tööd</h2>
      {shown.map((h) => {
        const ok = done.has(h.id);
        return (
          <label key={h.id} className="att" style={{ display: "block", borderLeft: `4px solid ${color(h.due, ok)}`, opacity: ok ? 0.5 : 1 }}>
            <input type="checkbox" checked={ok} onChange={() => { done.toggle(h.id); bump((n) => n + 1); }} />{" "}
            <b style={{ color: color(h.due, ok) }}>{h.due < today && !ok ? "Hilinenud " : ""}{h.due.slice(5)}</b> {h.subject}
            <div><small>{h.text}</small></div>
          </label>
        );
      })}
    </section>
  );
}
