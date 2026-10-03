import type { StuudiumData } from "../data/types";
import { seen } from "../data/seen";

/** Klassijuhataja info esikohal: postitused, klassijuhatamise tunnid, klassi sündmused. */
export default function ClassTeacher({ data }: { data: StuudiumData }) {
  const posts = data.posts.filter((p) => p.fromClassTeacher).sort((a, b) => b.date.localeCompare(a.date));
  const notes = [...data.classNotes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const events = data.events.filter((e) => e.scope === "class").sort((a, b) => a.start.localeCompare(b.start));
  const ids = [...posts.map((p) => p.id), ...notes.map((n) => n.id)];
  const New = ({ id }: { id: string }) => (seen.has(id) ? null : <span className="badge new">Uus</span>);

  return (
    <section className="card teacher">
      <h2>Klassijuhataja {data.classTeacher ? `(${data.classTeacher})` : ""}</h2>
      {!posts.length && <p><small>Klassijuhataja postitusi pole veel laetud. Impordi Suhtluse leht.</small></p>}
      {posts.map((p) => (
        <p key={p.id}><New id={p.id} /> <b>{p.title}</b> <small>{p.date.slice(5)}</small><br /><small>{p.text}</small></p>
      ))}
      {notes.map((n) => (
        <p key={n.id}>
          <New id={n.id} /> <small>{n.date.slice(5)}</small> {n.text}
          {n.homework && <><br /><b>Kodutöö {n.homeworkDue?.slice(5)}:</b> {n.homework}</>}
        </p>
      ))}
      {events.map((e) => <p key={e.id}><b>{e.start.slice(5, 10)}</b> {e.title}</p>)}
      {ids.some((i) => !seen.has(i)) && <button className="primary" onClick={() => { seen.markAll(ids); location.reload(); }}>Märgi nähtuks</button>}
    </section>
  );
}
