import type { StuudiumData } from "./types";
import { sb } from "./chatApi";
import type { ChatKeys } from "./chatCrypto";

const b64 = (b: Uint8Array) => btoa(String.fromCharCode(...b));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const chunked = (b: Uint8Array) => { let s = ""; for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode(...b.subarray(i, i + 8192)); return btoa(s); };

/** Salvestab Stuudiumi andmed krüpteeritult pilve (üks rida pere kohta). */
export async function saveSnapshot(keys: ChatKeys, data: StuudiumData) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = new TextEncoder().encode(JSON.stringify({ ...data, room: undefined })); // laste jututuba jääb seadmesse
  const enc = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, keys.key, plain));
  const { error } = await sb().from("snapshots").upsert({ room: keys.room, iv: b64(iv), data: chunked(enc), updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

export async function loadSnapshot(keys: ChatKeys): Promise<{ data: StuudiumData; at: string } | null> {
  const { data: row, error } = await sb().from("snapshots").select("iv,data,updated_at").eq("room", keys.room).maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) return null;
  try {
    const out = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(row.iv) }, keys.key, unb64(row.data));
    return { data: JSON.parse(new TextDecoder().decode(out)) as StuudiumData, at: row.updated_at };
  } catch {
    return null;
  }
}
