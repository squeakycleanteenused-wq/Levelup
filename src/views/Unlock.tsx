import { useState } from "react";

const MIN = 8;

/** Esimene kuva: "Mul on parool" (sisselogimine) või "Olen uus" (loo pere parool). Kontot ei ole, parool ongi pere võti. */
export default function Unlock({ error, onUnlock }: { error: string; onUnlock: (pw: string, isNew: boolean) => void }) {
  const [mode, setMode] = useState<"have" | "new">("new");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const p = pw.trim();
  const tooShort = p.length < MIN;
  const mismatch = mode === "new" && p !== pw2.trim();

  return (
    <section className="card welcome">
      <h2>Tere tulemast! 🍁</h2>
      <div className="seg">
        <button type="button" className={mode === "new" ? "chip on" : "chip"} onClick={() => setMode("new")}>Olen uus</button>
        <button type="button" className={mode === "have" ? "chip on" : "chip"} onClick={() => setMode("have")}>Mul on parool</button>
      </div>

      {mode === "new" ? (
        <>
          <p><b>Kontot ei ole vaja.</b> Sinu pere kasutab oma <b>perekonna parooli</b> ja see ongi kõik. Mõtle see nüüd välja:</p>
          <ul className="tips">
            <li>vähemalt {MIN} märki, pikk ja ainulaadne (nt kolm sõna kokku)</li>
            <li><b>mitte</b> Stuudiumi parool</li>
            <li>kirjuta see kuhugi üles, unustamisel ei saa andmeid taastada</li>
          </ul>
        </>
      ) : (
        <p>Sisesta parool, mille oma peres varem lõid. Sama parool avab kõigis sinu seadmetes sama info.</p>
      )}

      <form className="login" onSubmit={(e) => { e.preventDefault(); if (!tooShort && !mismatch) onUnlock(p, mode === "new"); }}>
        <input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder={mode === "new" ? "Uus perekonna parool" : "Perekonna parool"} autoComplete="off" autoFocus />
        {mode === "new" && <input type={show ? "text" : "password"} value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Sisesta sama parool uuesti" autoComplete="off" />}
        <label className="small"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Näita parooli</label>
        <button className="primary" disabled={tooShort || mismatch}>{mode === "new" ? "Loo parool ja jätka" : "Ava"}</button>
        {p.length > 0 && tooShort && <small>Veel {MIN - p.length} märki</small>}
        {mode === "new" && !tooShort && pw2.length > 0 && mismatch && <small className="err">Paroolid ei ole ühesugused</small>}
        {error && <small className="err">{error}</small>}
      </form>
    </section>
  );
}
