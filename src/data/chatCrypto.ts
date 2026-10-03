/**
 * Vanemate chati krüpto. Üks ühine parool -> PBKDF2 -> kaks sõltumatut tulemust:
 *  - ruumi id (serverile nähtav, ei võimalda parooli taastada)
 *  - AES-GCM võti (ei lahku seadmest)
 * Server näeb ainult ruumi id'd, iv'd ja krüptitud andmeid.
 */
const enc = new TextEncoder();
const dec = new TextDecoder();
const SALT = "levelup-vanemad-v1";
const ITER = 250_000;

const b64 = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b instanceof Uint8Array ? b : new Uint8Array(b))));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

export type ChatKeys = { room: string; key: CryptoKey };

export async function deriveKeys(password: string): Promise<ChatKeys> {
  const base = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits", "deriveKey"]);
  const roomBits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(SALT + ":room"), iterations: ITER, hash: "SHA-256" }, base, 256);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode(SALT + ":key"), iterations: ITER, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
  return { room: hex(roomBits), key };
}

export type Plain = { name: string; text: string };

export async function encrypt(k: ChatKeys, msg: Plain) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k.key, enc.encode(JSON.stringify(msg)));
  return { iv: b64(iv), data: b64(data) };
}

export async function decrypt(k: ChatKeys, iv: string, data: string): Promise<Plain | null> {
  try {
    const out = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, k.key, unb64(data));
    return JSON.parse(dec.decode(out)) as Plain;
  } catch {
    return null; // vale parool või rikutud sõnum
  }
}
