import { sb } from "./chatApi";
import { decrypt, encrypt, type ChatKeys } from "./chatCrypto";
import type { Entry } from "./ledger";

// Salvestus: kohalik vahemälu + krüpteeritud pilv
const TABLE = "ledger_entries";
type Row = { id: string; iv: string; data: string; created_at: string };
const lsKey = (k: ChatKeys) => "ledger:" + k.room.slice(0, 10);

export function loadLocal(k: ChatKeys): { entries: Entry[]; unsynced: string[] } {
  try {
    return JSON.parse(localStorage.getItem(lsKey(k)) ?? "") as { entries: Entry[]; unsynced: string[] };
  } catch {
    return { entries: [], unsynced: [] };
  }
}
export function saveLocal(k: ChatKeys, v: { entries: Entry[]; unsynced: string[] }) {
  try {
    localStorage.setItem(lsKey(k), JSON.stringify(v));
  } catch {
    /* ignoreeri */
  }
}

async function open(k: ChatKeys, r: Row): Promise<Entry | null> {
  const p = await decrypt(k, r.iv, r.data);
  return p ? ({ ...(JSON.parse(p.text) as Entry), id: r.id }) : null;
}

export async function pullCloud(k: ChatKeys): Promise<Entry[]> {
  const { data, error } = await sb().from(TABLE).select("id,iv,data,created_at").eq("room", k.room).order("created_at").limit(2000);
  if (error) throw new Error(error.message);
  return (await Promise.all((data as Row[]).map((r) => open(k, r)))).filter((e): e is Entry => !!e);
}

export async function pushCloud(k: ChatKeys, e: Entry) {
  const { iv, data } = await encrypt(k, { name: "ledger", text: JSON.stringify(e) });
  const { error } = await sb().from(TABLE).insert({ id: e.id, room: k.room, iv, data });
  if (error && !/duplicate key/i.test(error.message)) throw new Error(error.message);
}

export function subscribeCloud(k: ChatKeys, onEntry: (e: Entry) => void) {
  const ch = sb()
    .channel("ledger-" + k.room.slice(0, 12))
    .on("postgres_changes", { event: "INSERT", schema: "public", table: TABLE, filter: `room=eq.${k.room}` }, async (ev) => {
      const e = await open(k, ev.new as Row);
      if (e) onEntry(e);
    })
    .subscribe();
  return () => void sb().removeChannel(ch);
}
