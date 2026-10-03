/** Vanema režiim: PIN-kood selles seadmes. Lapse seadmes on vanema nupud lukus. (Kodune kaitse, mitte pangaturvalisus.) */
const SALT = "levelup-vanem-v1";
const hash = async (pin: string) => {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(SALT + pin));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
};
const get = (k: string, s: Storage = localStorage) => { try { return s.getItem(k) ?? ""; } catch { return ""; } };
const put = (k: string, v: string, s: Storage = localStorage) => { try { s.setItem(k, v); } catch { /* ignoreeri */ } };

export const hasPin = () => !!get("parentPin");
export const isParent = () => get("parentOn", sessionStorage) === "1";
export const lockParent = () => put("parentOn", "0", sessionStorage);
export async function unlockParent(pin: string): Promise<boolean> {
  const h = await hash(pin);
  if (!hasPin()) put("parentPin", h); // esimene kord seab PIN-i
  const ok = get("parentPin") === h;
  if (ok) put("parentOn", "1", sessionStorage);
  return ok;
}
