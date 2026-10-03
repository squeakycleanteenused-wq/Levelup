import type { StuudiumData } from "../data/types";
import { attention } from "../data/attention";

const colors = { 3: "#d33", 2: "#e8a317", 1: "#888" } as const;

export default function Attention({ data, limit }: { data: StuudiumData; limit?: number }) {
  const all = attention(data);
  const items = limit ? all.slice(0, limit) : all;
  return (
    <section className="card attention">
      <h2>Tähelepanu {all.length ? `(${all.length})` : ""}</h2>
      {!items.length && <p>Midagi muret tekitavat pole.</p>}
      {items.map((i, n) => (
        <div key={n} className="att" style={{ borderLeft: `4px solid ${colors[i.severity]}` }}>
          <b style={{ color: colors[i.severity] }}>{i.kind}</b> · {i.title} <small>{i.date.slice(5)}</small>
          <div><small>{i.detail}</small></div>
        </div>
      ))}
    </section>
  );
}
