import type { StuudiumData } from "../data/types";
import { conduct } from "../data/attention";
import { daysFromToday, rel } from "../data/dates";

const colors = { 3: "#d33", 2: "#e8a317", 1: "#888" } as const;

/** Õpilase tegevus: värske eraldi, vana kokku volditud, et mõte ei läheks müras kaduma. */
export default function Attention({ data }: { data: StuudiumData }) {
  const all = conduct(data);
  const fresh = all.filter((i) => daysFromToday(i.date) >= -14);
  const older = all.filter((i) => daysFromToday(i.date) < -14);
  const row = (i: (typeof all)[number], n: number) => (
    <div key={n} className="att" style={{ borderLeft: `4px solid ${colors[i.severity]}` }}>
      <b style={{ color: colors[i.severity] }}>{i.kind}</b> · {i.title} <small>{rel(i.date)}</small>
      {i.detail && <div><small>{i.detail}</small></div>}
    </div>
  );
  return (
    <section className="card attention">
      <h2>Õpilase tegevus</h2>
      {!fresh.length && <p>Viimase kahe nädala jooksul pole midagi. 🎉</p>}
      {fresh.map(row)}
      {older.length > 0 && (
        <details>
          <summary><small>Varasemad ({older.length})</small></summary>
          {older.map(row)}
        </details>
      )}
    </section>
  );
}
