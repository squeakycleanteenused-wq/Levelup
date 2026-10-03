import { deriveKeys, decrypt, encrypt } from "../src/data/chatCrypto";
const a = await deriveKeys("salaparool");
const b = await deriveKeys("salaparool");
const c = await deriveKeys("vale");
const pkt = await encrypt(a, { name: "Evelin", text: "Üllatus laupäeval 🎁" });
console.log("sama parool -> sama ruum:", a.room === b.room, "| vale parool -> teine ruum:", a.room !== c.room);
console.log("sama parool loeb:", await decrypt(b, pkt.iv, pkt.data));
console.log("vale parool loeb:", await decrypt(c, pkt.iv, pkt.data));
console.log("server näeb:", pkt.data.slice(0, 40) + "…", "ruum:", a.room.slice(0, 16) + "…");
