import { useEffect, useRef, useState } from "react";
import { deriveKeys, type ChatKeys } from "../data/chatCrypto";
import { chatConfigured, loadMessages, sendMessage, subscribe, type ChatMsg } from "../data/chatApi";

const get = (k: string) => { try { return localStorage.getItem(k) ?? ""; } catch { return ""; } };
const put = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignoreeri */ } };

/** Parooliga lukustatud vanemate chat. Sõnumid krüpteeritakse seadmes, server ei näe sisu ega parooli. */
export default function Chat() {
  const [keys, setKeys] = useState<ChatKeys | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [name, setName] = useState(get("chatName"));
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  if (!chatConfigured)
    return (
      <section className="card">
        <h2>Vanemate chat</h2>
        <p>Chat vajab Supabase'i. Lisa failis <code>.env</code> read <code>VITE_SUPABASE_URL</code> ja <code>VITE_SUPABASE_ANON_KEY</code> ning käivita fail <code>supabase/migrations/001_chat.sql</code> oma Supabase'i SQL-redaktoris.</p>
      </section>
    );

  async function unlock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const pw = String(f.get("pw"));
    setBusy(true);
    setErr("");
    try {
      const k = await deriveKeys(pw);
      const old = await loadMessages(k);
      // Vale parool annab tühja ruumi: me ei saa vahet, aga tühi vestlus on selge märk
      setMsgs(old);
      setKeys(k);
      put("chatName", name);
    } catch (x) {
      setErr(String(x));
    }
    setBusy(false);
  }

  useEffect(() => {
    if (!keys) return;
    return subscribe(keys, (m) => setMsgs((cur) => (cur.some((c) => c.id === m.id) ? cur : [...cur, m])));
  }, [keys]);

  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!keys || !text.trim()) return;
    const t = text.trim();
    setText("");
    try {
      await sendMessage(keys, { name: name || "Vanem", text: t });
    } catch (x) {
      setErr(String(x));
      setText(t);
    }
  }

  if (!keys)
    return (
      <form className="card login" onSubmit={unlock}>
        <b>🔒 Vanemate chat</b>
        <small>Sisene ühise parooliga. Parool ja sõnumite sisu ei lahku sinu seadmest lahtisel kujul.</small>
        <input placeholder="Sinu nimi (nt Evelin)" value={name} onChange={(e) => setName(e.target.value)} required />
        <input name="pw" type="password" placeholder="Ühine parool" autoComplete="off" required />
        <button disabled={busy}>{busy ? "Avan…" : "Ava"}</button>
        {err && <small className="err">{err}</small>}
      </form>
    );

  return (
    <section className="card chat">
      <h2>🔒 Vanemate chat <button className="chip" onClick={() => { setKeys(null); setMsgs([]); }}>Lukusta</button></h2>
      <div className="msgs">
        {!msgs.length && <small>Siin pole veel sõnumeid. Kui sa ootasid vestlust, kontrolli parooli (vale parool avab tühja ruumi).</small>}
        {msgs.map((m) => (
          <div key={m.id} className={"msg" + (m.name === name ? " mine" : "")}>
            <small><b>{m.name}</b> {new Date(m.at).toLocaleString("et-EE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</small>
            <div>{m.text}</div>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="sendrow">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Kirjuta sõnum…" maxLength={2000} />
        <button className="primary">Saada</button>
      </form>
      {err && <small className="err">{err}</small>}
    </section>
  );
}
