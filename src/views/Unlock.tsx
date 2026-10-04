import { useState } from "react";

/** Ilmub ainult siis, kui parool puudub. Parool jäetakse selle seadme meelde. */
export default function Unlock({ error, onUnlock }: { error: string; onUnlock: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  return (
    <form className="card login" onSubmit={(e) => { e.preventDefault(); if (pw.length >= 8) onUnlock(pw); }}>
      <b>🔒 Sisesta perekonna parool</b>
      <small>See on parool, mille mõtlesid välja äpi ja laienduse jaoks (mitte Stuudiumi parool). Igal perel on oma. Kes sama parooli teab, näeb sama andmeid, seega vali pikk ja ainulaadne (vähemalt 8 märki).</small>
      <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="off" autoFocus />
      <button className="primary" disabled={pw.length < 8}>Ava</button>
      {pw.length > 0 && pw.length < 8 && <small>Veel {8 - pw.length} märki</small>}
      {error && <small className="err">{error}</small>}
    </form>
  );
}
