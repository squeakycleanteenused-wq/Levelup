import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { decrypt, encrypt, type ChatKeys, type Plain } from "./chatCrypto";

export type ChatMsg = { id: string; at: string; name: string; text: string };

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const chatConfigured = !!(url && anon);

let client: SupabaseClient | null = null;
export const sb = () => (client ??= createClient(url!, anon!, { auth: { persistSession: false } }));

type Row = { id: string; iv: string; data: string; created_at: string };
async function open(keys: ChatKeys, r: Row): Promise<ChatMsg | null> {
  const p = await decrypt(keys, r.iv, r.data);
  return p ? { id: r.id, at: r.created_at, name: p.name, text: p.text } : null;
}

export async function loadMessages(keys: ChatKeys): Promise<ChatMsg[]> {
  const { data, error } = await sb().from("chat_messages").select("id,iv,data,created_at").eq("room", keys.room).order("created_at").limit(500);
  if (error) throw new Error(error.message);
  return (await Promise.all((data as Row[]).map((r) => open(keys, r)))).filter((m): m is ChatMsg => !!m);
}

export async function sendMessage(keys: ChatKeys, msg: Plain) {
  const { iv, data } = await encrypt(keys, msg);
  const { error } = await sb().from("chat_messages").insert({ room: keys.room, iv, data });
  if (error) throw new Error(error.message);
}

/** Reaalajas uued sõnumid. Tagastab funktsiooni tellimuse lõpetamiseks. */
export function subscribe(keys: ChatKeys, onMsg: (m: ChatMsg) => void) {
  const ch = sb()
    .channel("chat-" + keys.room.slice(0, 12))
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room=eq.${keys.room}` }, async (e) => {
      const m = await open(keys, e.new as Row);
      if (m) onMsg(m);
    })
    .subscribe();
  return () => void sb().removeChannel(ch);
}
