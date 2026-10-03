import { useState } from "react";
import type { StuudiumData } from "../data/types";
import { deriveKeys } from "../data/chatCrypto";
import { chatConfigured } from "../data/chatApi";
import { loadSnapshot, saveSnapshot } from "../data/snapshot";

/** Pilvesünkroon: impordi ühes seadmes, näe kõigis. Andmed krüpteeritakse perekonna parooliga. */
export default function Sync({ data, onLoad }: { data: StuudiumData; onLoad: (d: StuudiumData) => void }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  if (!chatConfigured) return null;

  async function run(kind: "save" | "load", e: React.MouseEvent<HTMLButtonElement>) {
    const pw = (e.currentTarget.form?.elements.namedItem("pw") as HTMLInputElement).value;
    if (!pw) return setMsg("Sisesta perekonna parool.");
    setBusy(true);
    setMsg("");
    try {
      const k = await deriveKeys(pw);
      if (kind === "save") {
        await saveSnapshot(k, data);
        setMsg("Salvestatud pilve.");
      } else {
        const s = await loadSnapshot(k);
        if (!s) setMsg("Selle parooliga pole midagi salvestatud.");
        else { onLoad(s.data); setMsg("Laetud (" + new Date(s.at).toLocaleString("et-EE") + ")."); }
      }
    } catch (x) {
      setMsg(String(x));
    }
    setBusy(false);
  }

  return (
    <form className="card login" onSubmit={(e) => e.preventDefault()}>
      <b>☁️ Sünkrooni seadmete vahel</b>
      <small>Andmed krüpteeritakse sinu seadmes. Kasuta sama parooli igas seadmes.</small>
      <input name="pw" type="password" placeholder="Perekonna parool" autoComplete="off" />
      <div>
        <button className="primary" disabled={busy} onClick={(e) => run("save", e)}>Salvesta pilve</button>{" "}
        <button className="chip" disabled={busy} onClick={(e) => run("load", e)}>Laadi pilvest</button>
      </div>
      {msg && <small>{msg}</small>}
    </form>
  );
}
