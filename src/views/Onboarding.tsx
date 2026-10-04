import { useState } from "react";
import { EXTENSION_ZIP, GUIDE_URL } from "../data/links";

/** Uue pere järgmised sammud pärast parooli loomist. Äpp kontrollib ise, kas andmed on pilves. */
export default function Onboarding({ pw, checking, message, onCheck }: { pw: string; checking: boolean; message: string; onCheck: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(pw); setCopied(true); } catch { setCopied(false); }
  };
  return (
    <section className="card welcome">
      <h2>Parool on loodud ✅</h2>
      <p>Nüüd on vaja tuua Stuudiumi info siia. See tehakse <b>arvutis</b> (Chrome, Opera, Edge või Brave) ja võtab umbes 5 minutit. Telefonis ilmub info pärast ise.</p>

      <ol className="steps">
        <li>
          <b>Kirjuta parool üles.</b>
          <div><button className="chip" onClick={copy}>{copied ? "Kopeeritud ✓" : "Kopeeri parool"}</button> <small>Vaja läheb Sammus 3.</small></div>
        </li>
        <li>
          <b>Paigalda laiendus</b> (üks kord).
          <div><a className="ext" href={EXTENSION_ZIP} target="_blank" rel="noreferrer">Lae laiendus alla →</a> · <a className="ext" href={GUIDE_URL} target="_blank" rel="noreferrer">Juhend →</a></div>
        </li>
        <li>
          <b>Täida laienduse seaded:</b> pane sinna sama parool, kooli aadress ja klassijuhataja eesnimi.
        </li>
        <li>
          <b>Logi Stuudiumisse</b> nagu tavaliselt ja vajuta laiendusel <b>Uuenda kohe</b>.
        </li>
      </ol>

      <button className="primary" onClick={onCheck} disabled={checking}>{checking ? "Kontrollin…" : "Kontrolli, kas andmed jõudsid kohale"}</button>
      {message && <p><small>{message}</small></p>}
    </section>
  );
}
