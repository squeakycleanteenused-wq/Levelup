import type { StuudiumData } from "../data/types";
import { avg, bySubject } from "../data/stats";

const tone = (v: number) => (v >= 4.5 ? "#2f6f23" : v >= 3.5 ? "var(--accent)" : "#d33");
const fmt = (v: number) => v.toFixed(1).replace(".", ",");

/** Keskmine hinne suurelt, aine kaupa nõrgemad esimesena. Mittearvulised hinded (A, MA) ei lähe arvesse. */
export default function Average({ data }: { data: StuudiumData }) {
  const numeric = data.grades.filter((g) => g.value !== null);
  if (!numeric.length) return null;
  const total = avg(data.grades);
  const subjects = bySubject(data.grades).filter((s) => s.avg > 0).sort((a, b) => a.avg - b.avg);

  return (
    <section className="card average">
      <div className="avg-top">
        <div className="avg-num" style={{ color: tone(total) }} aria-label={`Keskmine hinne ${fmt(total)}`}>{fmt(total)}</div>
        <div>
          <h2 style={{ margin: 0 }}>Keskmine hinne</h2>
          <small>{numeric.length} {numeric.length === 1 ? "hinne" : "hinnet"} selles trimestris</small>
        </div>
      </div>
      {subjects.length > 0 && (
        <div className="avg-subjects">
          {subjects.map((s) => (
            <span key={s.subject} className="avg-chip" title={`${s.count} hinnet`}>
              {s.subject} <b style={{ color: tone(s.avg) }}>{fmt(s.avg)}</b>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
