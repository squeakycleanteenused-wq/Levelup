import type { StuudiumData } from "../data/types";

/** Klassi jututuba (laste vestlus) kergesti loetavana. Vanemana ainult lugemiseks. */
export default function Room({ data }: { data: StuudiumData }) {
  const room = data.room;
  if (!room)
    return (
      <section className="card">
        <h2>Klassi jututuba</h2>
        <p><small>Impordi leht <code>/chat/g/…</code> (Stuudium → Klass → Jututuba).</small></p>
      </section>
    );
  const byDate = new Map<string, typeof room.messages>();
  room.messages.forEach((m) => byDate.set(m.date, [...(byDate.get(m.date) ?? []), m]));
  return (
    <section className="card chat">
      <h2>{room.title} · jututuba {room.canSend ? "" : "(ainult lugemiseks)"}</h2>
      <div className="msgs">
        {[...byDate].map(([d, list]) => (
          <div key={d}>
            <div className="divider">{d.slice(8)}.{d.slice(5, 7)}</div>
            {list.map((m, i) => (
              <div key={m.id} className="msg" style={{ marginTop: list[i - 1]?.userId === m.userId ? 2 : 8 }}>
                {list[i - 1]?.userId !== m.userId && <small><b>{m.name}</b> {m.time}</small>}
                <div>{m.text}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
