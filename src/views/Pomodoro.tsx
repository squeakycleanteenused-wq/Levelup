import { useEffect, useState } from "react";

type Phase = "idle" | "work" | "alert" | "break" | "back";
type State = { phase: Phase; endsAt: number };
const WORK = 25 * 60_000;
const BREAK = 5 * 60_000;
const KEY = "pomodoro";

const load = (): State => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "") as State;
  } catch {
    return { phase: "idle", endsAt: 0 };
  }
};
const save = (s: State) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignoreeri */
  }
};

const mmss = (ms: number) => {
  const t = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

function Cat({ mood }: { mood: "happy" | "sleepy" }) {
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" aria-hidden>
      <path className="tail" d="M10 88 C-6 70 6 48 22 58" stroke="#e08a2c" strokeWidth="9" fill="none" strokeLinecap="round" />
      <ellipse cx="55" cy="84" rx="32" ry="22" fill="#f0a040" />
      <polygon points="28,38 34,12 50,30" fill="#f0a040" />
      <polygon points="82,38 76,12 60,30" fill="#f0a040" />
      <polygon points="33,32 35,20 44,29" fill="#f6b3b3" />
      <polygon points="77,32 75,20 66,29" fill="#f6b3b3" />
      <circle cx="55" cy="50" r="29" fill="#f0a040" />
      <path d="M45 24 v8 M55 22 v10 M65 24 v8" stroke="#c46f1a" strokeWidth="3" strokeLinecap="round" />
      {mood === "happy" ? (
        <>
          <ellipse className="eye" cx="43" cy="50" rx="4" ry="5.5" fill="#2b1d12" />
          <ellipse className="eye" cx="67" cy="50" rx="4" ry="5.5" fill="#2b1d12" />
        </>
      ) : (
        <>
          <path d="M38 51 q5 4 10 0 M62 51 q5 4 10 0" stroke="#2b1d12" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
      <polygon points="55,58 51,63 59,63" fill="#d9606b" />
      <path d="M55 63 q-5 7 -10 3 M55 63 q5 7 10 3" stroke="#2b1d12" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M32 58 h-14 M32 63 l-13 4 M78 58 h14 M78 63 l13 4" stroke="#2b1d12" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="38" cy="102" rx="9" ry="5" fill="#f6c27a" />
      <ellipse cx="72" cy="102" rx="9" ry="5" fill="#f6c27a" />
    </svg>
  );
}

/** Pomodoro: 25 min töö, siis kass tuletab pausi meelde (5 min). Aeg põhineb kellaajal, nii et uuendamine ei lähe kaotsi. */
export default function Pomodoro() {
  const [st, setSt] = useState<State>(load);
  const [now, setNow] = useState(Date.now());

  const go = (phase: Phase, ms = 0) => {
    const next = { phase, endsAt: ms ? Date.now() + ms : 0 };
    save(next);
    setSt(next);
  };

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
      if (st.phase === "work" && Date.now() >= st.endsAt) go("alert");
      if (st.phase === "break" && Date.now() >= st.endsAt) go("back");
    }, 500);
    return () => clearInterval(id);
  });

  const left = st.endsAt - now;
  return (
    <>
      {st.phase === "idle" && <button className="chip" onClick={() => go("work", WORK)} title="Alusta 25 min töösessiooni">🍅 Alusta</button>}
      {st.phase === "work" && <button className="chip" onClick={() => go("idle")} title="Peata">🍅 {mmss(left)}</button>}
      {st.phase === "break" && <button className="chip" onClick={() => go("idle")}>☕ {mmss(left)}</button>}

      {(st.phase === "alert" || st.phase === "back") && (
        <div className="cat" role="alert">
          <div className="bubble">
            {st.phase === "alert" ? (
              <>
                <b>Mjäu! Aeg teha pausi.</b>
                <div><small>Tõuse püsti, joo vett, vaata aknast välja. 5 minutit.</small></div>
                <button onClick={() => go("break", BREAK)}>Alustan pausi</button>
                <button className="alt" onClick={() => go("work", 5 * 60_000)}>Veel 5 min</button>
              </>
            ) : (
              <>
                <b>Paus läbi!</b>
                <div><small>Valmis järgmiseks 25 minutiks?</small></div>
                <button onClick={() => go("work", WORK)}>Jah</button>
                <button className="alt" onClick={() => go("idle")}>Lõpetan</button>
              </>
            )}
          </div>
          <Cat mood={st.phase === "alert" ? "happy" : "sleepy"} />
        </div>
      )}
    </>
  );
}
