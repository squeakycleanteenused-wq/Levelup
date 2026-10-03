// Kasutus (oma arvutis): npx tsx scripts/test-chat.ts
// Kontrollib: ühendus Supabase'iga, õigused, krüpteeritud sõnumi saatmine ja lugemine.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { decrypt, deriveKeys, encrypt } from "../src/data/chatCrypto";

const env = Object.fromEntries(readFileSync(".env", "utf8").split("\n").filter(Boolean).map((l) => l.split(/=(.*)/s).slice(0, 2)));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } });

const keys = await deriveKeys("levelup-test-" + Date.now());
const pkt = await encrypt(keys, { name: "Test", text: "Tere, see on test" });
const ins = await sb.from("chat_messages").insert({ room: keys.room, ...pkt });
console.log("1. Saatmine:", ins.error ? "VIGA: " + ins.error.message : "OK");
const sel = await sb.from("chat_messages").select("iv,data").eq("room", keys.room);
console.log("2. Lugemine:", sel.error ? "VIGA: " + sel.error.message : `OK (${sel.data?.length} rida)`);
if (sel.data?.[0]) console.log("3. Lahtikrüpteeritud:", await decrypt(keys, sel.data[0].iv, sel.data[0].data));
