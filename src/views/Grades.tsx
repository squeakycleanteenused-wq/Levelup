import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import DayLog from "./DayLog";
import type { StuudiumData } from "../data/types";
import { bySubject, trend } from "../data/stats";

export default function Grades({ data }: { data: StuudiumData }) {
  return (
    <>
      <DayLog data={data} />
      <section className="card">
        <h2>Keskmine ajas</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trend(data.grades)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[1, 5]} />
            <Line dataKey="avg" stroke="#6d5dfc" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>
      <section className="card">
        <h2>Ained</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={bySubject(data.grades)} layout="vertical">
            <XAxis type="number" domain={[0, 5]} />
            <YAxis type="category" dataKey="subject" width={100} />
            <Bar dataKey="avg" fill="#6d5dfc" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </section>
      <section className="card">
        <h2>Kokkuvõtvad hinded</h2>
        {data.summary.map((r) => (
          <p key={r.subject}>
            <b>{r.subject}</b>{" "}
            {r.years.map((y) => `${y.year}: ${y.periods.join(" | ")} → ${y.final ?? ""}`).join("; ")}
          </p>
        ))}
      </section>
    </>
  );
}
