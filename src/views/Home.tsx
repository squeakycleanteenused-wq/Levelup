import type { StuudiumData } from "../data/types";
import Attention from "./Attention";
import ClassTeacher from "./ClassTeacher";
import { ClassPosts } from "./Posts";
import Homework from "./Homework";
import { avg } from "../data/stats";

export default function Home({ data }: { data: StuudiumData }) {
  const today = new Date().getDay() || 7;
  const lessons = data.schedule.filter((l) => l.day === today);
  const recent = [...data.grades].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <>
    <ClassPosts data={data} limit={4} />
    <ClassTeacher data={data} />
    <Attention data={data} limit={5} />
    <Homework data={data} limit={6} />
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
        <h2>Puudumised</h2>
        <div className="big">{data.absences.length}</div>
        <small>{data.absences.filter((a) => !a.excused).length} põhjuseta</small>
      </section>
    </div>
    </>
  );
}
