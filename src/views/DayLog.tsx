import type { StuudiumData } from "../data/types";

const icon = { puudumine: "P", hilinemine: "H", "tegemata töö": "K", märkus: "!", vabastatud: "V", tagasiside: "💬", muu: "•" } as const;
const tone = (k: string, excused?: boolean) => (k === "märkus" || k === "tegemata töö" || (k === "puudumine" && !excused) ? "#d33" : k === "hilinemine" ? "#e8a317" : "#888");

/** Päevade kaupa: selge asendus Stuudiumi laiale ainete x päevade tabelile. */
export default function DayLog({ data }: { data: StuudiumData }) {
  const dates = [...new Set([...data.cells.map((c) => c.date), ...data.remarks.map((r) => r.date), ...data.grades.map((g) => g.date)])].sort().reverse();
  return (
    <section className="card">
      <h2>Päevade kaupa</h2>
      {dates.slice(0, 30).map((d) => {
        const grades = data.grades.filter((g) => g.date === d);
        const marks = data.remarks.filter((r) => r.date === d && !(r.kind === "puudumine" && r.excused));
        const hw = data.cells.filter((c) => c.date === d && c.homework.length);
        if (!grades.length && !marks.length && !hw.length) return null;
        return (
          <div key={d} className="att">
            <b>{d.slice(5)}</b>
            {grades.map((g, i) => <div key={i}>{g.subject}: <b>{g.label}</b> <small>{g.kind}</small></div>)}
            {marks.map((r, i) => (
              <div key={i} style={{ color: tone(r.kind, r.excused) }}>
                <b>{icon[r.kind]}</b> {r.subject}: {r.text}
              </div>
            ))}
            {hw.map((c, i) => <div key={i}><small>Kodutöö · {c.subject}: {c.homework.join(" ")}</small></div>)}
          </div>
        );
      })}
    </section>
  );
}
