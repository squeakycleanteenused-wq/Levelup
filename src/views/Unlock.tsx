import { useState } from "react";

const MIN = 8;
export type TryResult = "found" | "empty" | "error";

/**
 * Üks sisselogimiskast: sisesta parool. Kui sellise perekonnaga on andmeid, saad kohe sisse.
 * Kui pole, pakub äpp uue pere loomist (parool uuesti). Kontot ei ole, parool ongi pere võti.
 */
export default function Unlock({ error, onTry, onCreate }: { error: string; onTry: (pw: string) => Promise<TryResult>; onCreate: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<"enter" | "create">("enter");
  const [note, setNote] = useState("");
  const p = pw.trim();
  const tooShort = p.length < MIN;
  const mismatch = p !== pw2.trim();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (tooShort || busy) return;
    if (stage === "create") {
      if (!mismatch) onCreate(p);
      return;
    }
    setBusy(true);
    setNote("");
    const r = await onTry(p);
    setBusy(false);
    if (r === "empty") setStage("create");
    if (r === "error") setNote("Ühendus ei õnnestunud. Kontrolli internetti ja proovi uuesti.");
  }

  return (
    <section className="card welcome">
      <h2>Tere tulemast! 🍁</h2>
      {stage === "enter" ? (
        <p>Sisesta oma <b>perekonna parool</b>. Kui oled uus, loo see siin: <b>kontot ega e-posti pole vaja</b>, parool ongi sinu pere võti. Sama parool avab info igas sinu seadmes.</p>
      ) : (
        <>
          <p><b>Selle parooliga pole veel andmeid.</b></p>
          <ul className="tips">
            <li>Kui sa <b>oled uus</b>, sisesta sama parool allpool uuesti ja loo pere.</li>
            <li>Kui sul <b>on juba parool</b>, kirjutasid selle tõenäoliselt valesti. Muuda seda ülal ja proovi uuesti.</li>
          </ul>
        </>
      )}

      <form className="login" onSubmit={submit}>
        <input type={show ? "text" : "password"} value={pw} onChange={(e) => { setPw(e.target.value); if (stage === "create") { setStage("enter"); setPw2(""); } }} placeholder="Perekonna parool" autoComplete="off" autoFocus />
        {stage === "create" && <input type={show ? "text" : "password"} value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Sisesta sama parool uuesti (uus pere)" autoComplete="off" />}
        <label className="small"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Näita parooli</label>
        <button className="primary" disabled={tooShort || busy || (stage === "create" && mismatch)}>
          {busy ? "Kontrollin…" : stage === "create" ? "Loo uus pere ja jätka" : "Jätka"}
        </button>
        {p.length > 0 && tooShort && <small>Parool on vähemalt {MIN} märki (veel {MIN - p.length})</small>}
        {stage === "create" && !tooShort && pw2.length > 0 && mismatch && <small className="err">Paroolid ei ole ühesugused</small>}
        {note && <small className="err">{note}</small>}
        {error && stage === "enter" && <small className="err">{error}</small>}
        {stage === "enter" && <small className="muted">Pole Stuudiumi parool. Uues peres pole seda veel olemas ja äpp pakub selle loomist.</small>}
      </form>
    </section>
  );
}
