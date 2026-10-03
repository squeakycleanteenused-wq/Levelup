import type { StuudiumData } from "../data/types";
import { conduct } from "../data/attention";
import { daysFromToday, rel, todayIso } from "../data/dates";
import { done } from "../data/seen";
import { postState } from "./Posts";

/** Hetkeseis ühe pilguga: kas midagi on kiiret, millal on kontrolltööd. Rahulik toon, ei karju. */
export default function Status({ data }: { data: StuudiumData }) {
  const today = todayIso();
  const urgent = conduct(data).filter((i) => i.severity === 3 && daysFromToday(i.date) >= -14);
  const overdue = data.homework.filter((h) => h.due < today && !done.has(h.id));
  const tests = data.homework.filter((h) => h.text.startsWith("Kontrolltöö") && daysFromToday(h.due) >= 0 && daysFromToday(h.due) <= 14).sort((a, b) => a.due.localeCompare(b.due));
  const newPosts = data.posts.filter((p) => p.fromClassTeacher && postState(p) !== "nähtud");
  const calm = !urgent.length && !overdue.length && !newPosts.length;

  return (
    <section className="card status" style={{ borderLeft: `6px solid ${calm ? "#4d8b31" : "#d33"}` }}>
      <h2>Hetkeseis</h2>
      <p className="lead">
        {calm ? "🌿 Kõik rahulik, midagi kiiret pole." : `⚠️ ${urgent.length + overdue.length + newPosts.length} asja vajab tähelepanu`}
      </p>
      {!calm && (
        <ul>
          {urgent.length > 0 && <li>{urgent.length} märkust või madalat hinnet viimase kahe nädala jooksul</li>}
          {newPosts.length > 0 && <li>Olena: {newPosts.filter((p) => !p.updated).length ? `${newPosts.filter((p) => !p.updated).length} uut` : ""}{newPosts.some((p) => p.updated) && newPosts.some((p) => !p.updated) ? " ja " : ""}{newPosts.some((p) => p.updated) ? `${newPosts.filter((p) => p.updated).length} uuendatud` : ""} postitust</li>}
          {overdue.length > 0 && <li>{overdue.length} kodutööd on tähtaja ületanud ja pole tehtuks märgitud</li>}
        </ul>
      )}
      {tests.length > 0 && (
        <>
          <b>Kontrolltööd</b>
          <ul>
            {tests.map((t) => (
              <li key={t.id}>
                <b>{t.subject}</b> {rel(t.due)}
                {t.text.replace(/^Kontrolltöö:? ?/, "") && <small> · {t.text.replace(/^Kontrolltöö:? ?/, "")}</small>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
