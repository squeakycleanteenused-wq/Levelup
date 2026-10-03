import { useState } from "react";
import type { Post, StuudiumData } from "../data/types";
import { postsSeen } from "../data/seen";
import { daysFromToday } from "../data/dates";

export const sig = (p: Post) => `${p.activity}@${p.commentCount}`;

/** Uus/uuendatud ainult viimase 14 päeva postitustel; vanemad loetakse nähtuks, et ei tekiks müra. */
export function postState(p: Post): "uus" | "uuendatud" | "nähtud" {
  const st = postsSeen.state(p.id, sig(p));
  return st !== "nähtud" && daysFromToday(p.activity) < -14 ? "nähtud" : st;
}

function Item({ p, base }: { p: Post; base?: string }) {
  const [open, setOpen] = useState(false);
  const st = postState(p);
  return (
    <div className="att" onClick={() => setOpen(!open)} style={{ borderLeft: `4px solid ${st === "nähtud" ? "#8884" : "#d33"}`, cursor: "pointer" }}>
      {st !== "nähtud" && <span className="badge new">{st === "uus" ? "Uus" : "Uuendatud"}</span>}{" "}
      <b>{p.title}</b> <small>{p.author} · {p.created.slice(5)}{p.updated ? ` · uuendatud ${p.activity.slice(5)}` : ""}{p.commentCount ? ` · ${p.commentCount} vastust` : ""}</small>
      <div><small>{open ? p.text : p.text.slice(0, 140) + (p.text.length > 140 ? "…" : "")}</small></div>
      {open && p.comments.map((c, i) => <div key={i} className="att"><small><b>{c.author}</b> {c.date.slice(5)}: {c.text}</small></div>)}
      {open && <small>{p.audience.join(", ")}</small>}
      {base && <div><a className="ext" href={`${base}/suhtlus/p/${p.id}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>Ava Stuudiumis →</a></div>}
    </div>
  );
}

const byActivity = (a: Post, b: Post) => b.activity.localeCompare(a.activity);

/** Klassijuhataja ja oma klassi postitused esikohal; ülejäänud kooli teated all. */
export function ClassPosts({ data, limit }: { data: StuudiumData; limit?: number }) {
  const mine = data.posts.filter((p) => p.fromClassTeacher).sort(byActivity);
  const shown = limit ? mine.slice(0, limit) : mine;
  const fresh = mine.filter((p) => postState(p) !== "nähtud");
  return (
    <section className="card teacher">
      <h2>{data.classTeacher ?? "Klassijuhataja"} · {data.className ?? ""} {fresh.length ? `(${fresh.length} uut/uuendatud)` : ""}</h2>
      {!mine.length && <p><small>Postitusi pole laetud. Impordi Suhtluse leht.</small></p>}
      {shown.map((p) => <Item key={p.id} p={p} base={data.baseUrl} />)}
      {fresh.length > 0 && <button className="primary" onClick={() => { postsSeen.markAll(mine.map((p) => ({ id: p.id, sig: sig(p) }))); location.reload(); }}>Märgi nähtuks</button>}
    </section>
  );
}

export default function Posts({ data }: { data: StuudiumData }) {
  const others = data.posts.filter((p) => !p.fromClassTeacher && !p.forMyClass).sort(byActivity);
  return (
    <>
      <ClassPosts data={data} />
      <section className="card">
        <h2>Kooli teated</h2>
        {others.map((p) => <Item key={p.id} p={p} base={data.baseUrl} />)}
      </section>
    </>
  );
}
