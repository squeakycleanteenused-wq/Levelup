import { useCallback, useEffect, useMemo, useState } from "react";
import type { StuudiumData } from "../data/types";
import type { ChatKeys } from "../data/chatCrypto";
import { chatConfigured } from "../data/chatApi";
import { SCHOOL_TASK, compute, localDay, newEntry, type Entry } from "../data/ledger";
import { loadLocal, pullCloud, pushCloud, saveLocal, subscribeCloud } from "../data/ledgerStore";
import { hasPin, isParent, lockParent, unlockParent } from "../data/parent";

const dm = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;

/** Järgmine koolipäev (E-R), arvestades täna kaasa, kui täna on tööpäev ja kell pole veel hilja. */
function nextSchoolDay(from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + 1); // kodutöö tehakse tavaliselt õhtul järgmiseks päevaks
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return localDay(d);
}

/** Punktimäng: laps märgib asjad tehtuks, vanem kinnitab, trahv ja auhinnad. Kõik ühes pere punktiraamatus. */
export default function Points({ data, keys }: { data: StuudiumData | null; keys: ChatKeys | null }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [unsynced, setUnsynced] = useState<string[]>([]);
  const [parent, setParent] = useState(isParent());
  const [pinOpen, setPinOpen] = useState(false);
  const [msg, setMsg] = useState("");

  const merge = useCallback((incoming: Entry[]) => {
    setEntries((cur) => {
      const map = new Map(cur.map((e) => [e.id, e]));
      incoming.forEach((e) => map.set(e.id, e));
      return [...map.values()];
    });
  }, []);

  // lae kohalik vahemälu, siis pilv; saada ära, mis jäi saatmata
  useEffect(() => {
    if (!keys) return;
    const local = loadLocal(keys);
    setEntries(local.entries);
    setUnsynced(local.unsynced);
    if (!chatConfigured) return;
    let stop = false;
    const sync = async () => {
      try {
        merge(await pullCloud(keys));
        for (const id of loadLocal(keys).unsynced) {
          const e = loadLocal(keys).entries.find((x) => x.id === id);
          if (e) await pushCloud(keys, e);
          const cur = loadLocal(keys);
          saveLocal(keys, { entries: cur.entries, unsynced: cur.unsynced.filter((x) => x !== id) });
          if (!stop) setUnsynced((u) => u.filter((x) => x !== id));
        }
        if (!stop) setMsg("");
      } catch {
        if (!stop) setMsg("Pilv ei vasta, punktid on salvestatud selles seadmes ja saadetakse hiljem.");
      }
    };
    sync();
    const t = setInterval(sync, 30_000);
    const off = subscribeCloud(keys, (e) => merge([e]));
    return () => { stop = true; clearInterval(t); off(); };
  }, [keys, merge]);

  useEffect(() => { if (keys && entries.length) saveLocal(keys, { entries, unsynced }); }, [keys, entries, unsynced]);

  const add = (e: Omit<Entry, "id" | "at" | "day">) => {
    if (!keys) return;
    const full = newEntry(e);
    setEntries((cur) => [...cur, full]);
    setUnsynced((u) => [...u, full.id]);
    if (chatConfigured) pushCloud(keys, full).then(() => setUnsynced((u) => u.filter((x) => x !== full.id))).catch(() => {});
  };

  const st = useMemo(() => compute(entries), [entries]);
  const nextDay = nextSchoolDay();
  const homeworkDue = (data?.homework ?? []).filter((h) => h.due <= nextDay && !h.text.startsWith("Kontrolltöö"));

  if (!keys) return <section className="card"><p>Sisesta avalehel perekonna parool, siis avanevad punktid.</p></section>;

  const tick = (taskId: string, label: string, points: number) => {
    const d = st.doneToday[taskId];
    if (!d) add({ by: "laps", kind: "done", taskId, label, points });
    else if (!d.approved) add({ by: "laps", kind: "undo", ref: d.entry.id });
  };

  return (
    <>
      <section className="card score">
        <div className="big">{st.balance}</div>
        <div><b>punkti</b> · tase {st.level} <small>(järgmiseni {st.toNext})</small></div>
        <div className="bar"><div style={{ width: `${100 - st.toNext}%` }} /></div>
        {st.pending > 0 && <small>⏳ {st.pending} punkti ootab vanema kinnitust</small>}
        {st.balance < 0 && <small className="err"> Saldo on miinuses, tee asju, et see tagasi teenida.</small>}
        {msg && <div><small className="err">{msg}</small></div>}
      </section>

      <section className="card">
        <h2>Minu päev</h2>
        {st.config.tasks.filter((t) => !t.bonus).map((t) => {
          const d = st.doneToday[t.id];
          const school = t.id === SCHOOL_TASK;
          return (
            <label key={t.id} className="task" style={{ opacity: school && !homeworkDue.length ? 0.5 : 1 }}>
              <input type="checkbox" checked={!!d} disabled={!!d?.approved || (school && !homeworkDue.length)} onChange={() => tick(t.id, t.label, t.points)} />
              <span>
                <b>{t.label}</b> <span className="pts">+{t.points}</span> {d && <small>{d.approved ? "✓ kinnitatud" : "⏳ ootab"}</small>}
                {school && (homeworkDue.length
                  ? <div><small>{homeworkDue.length} kodutööd, tähtaeg {dm(nextDay)} või varem: {[...new Set(homeworkDue.map((h) => h.subject))].join(", ")}</small></div>
                  : <div><small>Kodutöid pole 🎉</small></div>)}
              </span>
            </label>
          );
        })}
        <h2 style={{ marginTop: 14 }}>Boonusülesanded</h2>
        {st.config.tasks.filter((t) => t.bonus).map((t) => {
          const d = st.doneToday[t.id];
          return (
            <label key={t.id} className="task">
              <input type="checkbox" checked={!!d} disabled={!!d?.approved} onChange={() => tick(t.id, t.label, t.points)} />
              <span><b>{t.label}</b> <span className="pts">+{t.points}</span> {d && <small>{d.approved ? "✓ kinnitatud" : "⏳ ootab"}</small>}</span>
            </label>
          );
        })}
      </section>

      <section className="card">
        <h2>Auhinnad</h2>
        {st.config.rewards.map((r) => (
          <div key={r.id} className="task">
            <span style={{ flex: 1 }}><b>{r.label}</b> <span className="pts">{r.cost}</span></span>
            <button className="chip" disabled={st.balance < r.cost || st.redeemRequests.some((x) => x.taskId === r.id)} onClick={() => add({ by: "laps", kind: "redeem", taskId: r.id, label: r.label, points: r.cost })}>
              {st.redeemRequests.some((x) => x.taskId === r.id) ? "Ootel" : "Soovin"}
            </button>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Vanem</h2>
        {!parent ? (
          pinOpen ? (
            <form onSubmit={async (e) => { e.preventDefault(); const pin = String(new FormData(e.currentTarget).get("pin")); if (await unlockParent(pin)) setParent(true); else setMsg("Vale PIN."); }}>
              <small>{hasPin() ? "Sisesta vanema PIN" : "Mõtle vanema PIN (4 numbrit või rohkem). Laps seda ei tea."}</small>
              <input name="pin" type="password" inputMode="numeric" autoComplete="off" autoFocus style={{ width: "100%", margin: "6px 0" }} />
              <button className="primary">Ava</button>
            </form>
          ) : <button className="chip" onClick={() => setPinOpen(true)}>🔑 Vanema režiim</button>
        ) : (
          <ParentPanel st={st} add={add} onLock={() => { lockParent(); setParent(false); setPinOpen(false); }} />
        )}
      </section>

      <section className="card">
        <h2>Ajalugu</h2>
        {!st.history.length && <p><small>Siin on näha iga punkt ja iga trahv koos põhjusega.</small></p>}
        {st.history.slice(0, 40).map(({ entry, delta, note }) => (
          <div key={entry.id} className="att" style={{ borderLeft: `4px solid ${delta < 0 ? "#d33" : delta > 0 ? "#4d8b31" : "#8885"}` }}>
            <b style={{ color: delta < 0 ? "#d33" : "inherit" }}>{delta > 0 ? "+" : ""}{delta || "·"}</b> {note} <small>{dm(entry.day)}</small>
          </div>
        ))}
      </section>
    </>
  );
}

function ParentPanel({ st, add, onLock }: { st: ReturnType<typeof compute>; add: (e: Omit<Entry, "id" | "at" | "day">) => void; onLock: () => void }) {
  const [pts, setPts] = useState("");
  const [reason, setReason] = useState("");
  const n = Number(pts);
  const valid = Number.isFinite(n) && n > 0 && reason.trim().length > 0;
  return (
    <div>
      {st.pendingIds.length > 0 && (
        <button className="primary" onClick={() => st.pendingIds.forEach((id) => add({ by: "vanem", kind: "approve", ref: id }))}>
          Kinnita kõik ({st.pendingIds.length}, {st.pending} punkti)
        </button>
      )}
      {st.redeemRequests.map((r) => (
        <div key={r.id} className="att">
          <b>{r.label}</b> <small>{r.points} punkti</small>{" "}
          <button className="chip" onClick={() => add({ by: "vanem", kind: "redeem_ok", ref: r.id, label: r.label })}>Anna</button>{" "}
          <button className="chip" onClick={() => add({ by: "vanem", kind: "redeem_no", ref: r.id })}>Keeldu</button>
        </div>
      ))}
      <div style={{ marginTop: 10 }}>
        <small>Trahv või boonus (põhjus on lapsele nähtav)</small>
        <input placeholder="Punkte" inputMode="numeric" value={pts} onChange={(e) => setPts(e.target.value)} style={{ width: "100%", margin: "4px 0" }} />
        <input placeholder="Põhjus (nt valetas kodutöö kohta)" value={reason} onChange={(e) => setReason(e.target.value)} style={{ width: "100%", margin: "4px 0" }} />
        <button className="chip" disabled={!valid} onClick={() => { add({ by: "vanem", kind: "penalty", points: n, reason: reason.trim() }); setPts(""); setReason(""); }}>− Trahv</button>{" "}
        <button className="chip" disabled={!valid} onClick={() => { add({ by: "vanem", kind: "bonus", points: n, reason: reason.trim() }); setPts(""); setReason(""); }}>+ Boonus</button>
      </div>
      <div style={{ marginTop: 10 }}><button className="chip" onClick={onLock}>🔒 Lukusta</button></div>
    </div>
  );
}
