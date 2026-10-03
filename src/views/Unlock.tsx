import { useState } from "react";

/** Ilmub ainult siis, kui parool puudub. Parool jäetakse selle seadme meelde. */
export default function Unlock({ error, onUnlock }: { error: string; onUnlock: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  return (
    <form className="card login" onSubmit={(e) => { e.preventDefault(); if (pw) onUnlock(pw); }}>
      <b>🔒 Sisesta perekonna parool</b>
      <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="off" autoFocus />
      <button className="primary">Ava</button>
      {error && <small className="err">{error}</small>}
    </form>
  );
}
