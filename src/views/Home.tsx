import type { StuudiumData } from "../data/types";
import { avg } from "../data/stats";

export default function Home({ data }: { data: StuudiumData }) {
  const today = new Date().getDay() || 7;
  const lessons = data.schedule.filter((l) => l.day === today);
  const recent = [...data.grades].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const next = [...data.homework].sort((a, b) => a.due.localeCompare(b.due)).slice(0, 3);

  return (
    <div className="grid">
      <section className="card">
        <h2>Keskmine hinne</h2>
        <div className="big">{avg(data.grades).toFixed(2)}</div>
      </section>
      <section className="card">
        <h2>Täna</h2>
        {lessons.length ? lessons.map((l) => <p key={l.start}>{l.start} {l.subject} <small>{l.room}</small></p>) : <p>Tunde pole</p>}
      </section>
      <section className="card">
        <h2>Uued hinded</h2>
        {recent.map((g, i) => <p key={i}>{g.subject}: <b>{g.value}</b></p>)}
      </section>
      <section className="card">
        <h2>Kodused tööd</h2>
        {next.map((h, i) => <p key={i}>{h.due.slice(5)} {h.subject}: {h.text}</p>)}
      </section>
      <section className="card">
        <h2>Puudumised</h2>
        <div className="big">{data.absences.length}</div>
        <small>{data.absences.filter((a) => !a.excused).length} põhjuseta</small>
      </section>
    </div>
  );
}
