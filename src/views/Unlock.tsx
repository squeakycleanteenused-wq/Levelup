import { useState } from "react";

const MIN = 8;
export type TryResult = "found" | "empty" | "error";
type Mode = "choose" | "have" | "new";

const seenBefore = () => { try { return localStorage.getItem("seenFamily") === "1"; } catch { return false; } };

/**
 * Sisselogimine ilma kontota: parool ongi pere võti.
 * Kaks nähtavat teed: "Mul on parool" ja "Olen uus". Uue pere loomisel kontrollime, et parool pole juba kasutusel.
 */
export default function Unlock({ error, onTry, onExists, onCreate }: {
  error: string;
  onTry: (pw: string) => Promise<TryResult>;
  onExists: (pw: string) => Promise<TryResult>;
  onCreate: (pw: string) => void;
}) {
  const [mode, setMode] = useState<Mode>(seenBefore() ? "have" : "choose");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [notFound, setNotFound] = useState(false);
  const p = pw.trim();
  const tooShort = p.length < MIN;
  const mismatch = p !== pw2.trim();

  const go = (m: Mode) => { setMode(m); setNote(""); setNotFound(false); setPw2(""); };

  async function submitHave(e: React.FormEvent) {
    e.preventDefault();
    if (tooShort || busy) return;
    setBusy(true); setNote(""); setNotFound(false);
    const r = await onTry(p);
    setBusy(false);
    if (r === "empty") setNotFound(true);
    if (r === "error") setNote("Ühendus ei õnnestunud. Kontrolli internetti ja proovi uuesti.");
  }

  async function submitNew(e: React.FormEvent) {
    e.preventDefault();
    if (tooShort || mismatch || busy) return;
    setBusy(true); setNote("");
    const r = await onExists(p);
    setBusy(false);
    if (r === "found") return setNote("See parool on juba kasutusel. Vali mõni teine, et sinu pere andmed jääksid sinu omaks. Kui see on sinu pere parool, mine tagasi ja vali “Mul on parool”.");
    if (r === "error") return setNote("Ühendus ei õnnestunud. Kontrolli internetti ja proovi uuesti.");
    onCreate(p);
  }

  const pwField = (ph: string) => (
    <input type={show ? "text" : "password"} value={pw} onChange={(e) => { setPw(e.target.value); setNotFound(false); setNote(""); }} placeholder={ph} autoComplete="off" autoFocus />
  );
  const showBox = <label className="small"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Näita parooli</label>;

  if (mode === "choose")
    return (
      <section className="card welcome">
        <h2>Tere tulemast! 🍁</h2>
        <p>Kontot ega e-posti pole vaja. Sinu pere <b>parool</b> ongi võti, millega info avatakse igas sinu seadmes.</p>
        <div className="choose">
          <button className="primary big" onClick={() => go("have")}>Mul on parool</button>
          <button className="big alt" onClick={() => go("new")}>Olen uus, loon pere</button>
        </div>
      </section>
    );

  if (mode === "have")
    return (
      <section className="card welcome">
        <h2>Sisesta perekonna parool</h2>
        <form className="login" onSubmit={submitHave}>
          {pwField("Perekonna parool")}
          {showBox}
          <button className="primary" disabled={tooShort || busy}>{busy ? "Kontrollin…" : "Ava"}</button>
          {p.length > 0 && tooShort && <small>Parool on vähemalt {MIN} märki (veel {MIN - p.length})</small>}
          {notFound && (
            <div className="notice">
              <b>Selle parooliga pole andmeid.</b>
              <div><small>Kontrolli, kas kirjutasid parooli õigesti ja proovi uuesti. Kui oled uus, loo pere.</small></div>
              <button type="button" className="chip" onClick={() => go("new")}>Olen uus, loon selle parooliga pere</button>
            </div>
          )}
          {note && <small className="err">{note}</small>}
          {error && !notFound && <small className="err">{error}</small>}
        </form>
        <p><button className="link" onClick={() => go("new")}>Olen uus</button></p>
      </section>
    );

  return (
    <section className="card welcome">
      <h2>Loo oma pere</h2>
      <p>Mõtle välja <b>perekonna parool</b>. Konto ega e-posti pole vaja.</p>
      <ul className="tips">
        <li>vähemalt {MIN} märki, pikk ja ainulaadne (nt kolm sõna kokku)</li>
        <li><b>mitte</b> Stuudiumi parool</li>
        <li>kirjuta see üles, unustamisel ei saa andmeid taastada</li>
      </ul>
      <form className="login" onSubmit={submitNew}>
        {pwField("Uus perekonna parool")}
        <input type={show ? "text" : "password"} value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Sisesta sama parool uuesti" autoComplete="off" />
        {showBox}
        <button className="primary" disabled={tooShort || mismatch || busy}>{busy ? "Kontrollin…" : "Loo pere ja jätka"}</button>
        {p.length > 0 && tooShort && <small>Parool on vähemalt {MIN} märki (veel {MIN - p.length})</small>}
        {!tooShort && pw2.length > 0 && mismatch && <small className="err">Paroolid ei ole ühesugused</small>}
        {note && <small className="err">{note}</small>}
      </form>
      <p><button className="link" onClick={() => go("have")}>← Mul on juba parool</button></p>
    </section>
  );
}
