import Homework from "./Homework";
import type { StuudiumData } from "../data/types";

const days = ["E", "T", "K", "N", "R"];

export default function Planner({ data }: { data: StuudiumData }) {
  return (
    <>
      <section className="card">
        <h2>Tunniplaan</h2>
        {days.map((name, i) => (
          <div key={name} className="row">
            <b>{name}</b>
            <div>
              {data.schedule.filter((l) => l.day === i + 1).map((l) => (
                <p key={l.start}>{l.start}-{l.end} {l.subject} <small>{l.room}</small></p>
              ))}
            </div>
          </div>
        ))}
      </section>
      <Homework data={data} />
    </>
  );
}
