/**
 * Pere punktiraamat. Ainult lisatavad kirjed (nagu pangakonto väljavõte), nii et trahv, kinnitus ja auhind
 * on alati ajaloos nähtavad koos põhjusega. Kõik krüpteeritakse perekonna parooliga.
 */
export type Kind = "done" | "undo" | "approve" | "bonus" | "penalty" | "redeem" | "redeem_ok" | "redeem_no" | "config";

export type Task = { id: string; label: string; points: number; bonus?: boolean };
export type Reward = { id: string; label: string; cost: number };
export type Config = { tasks: Task[]; rewards: Reward[] };

export type Entry = {
  id: string;
  at: string; // ISO aeg
  day: string; // YYYY-MM-DD (kohalik)
  by: "laps" | "vanem";
  kind: Kind;
  taskId?: string;
  label?: string;
  points?: number; // alati positiivne arv, märk tuleb liigist
  ref?: string; // millisele kirjele viitab
  reason?: string;
  config?: Config;
};

export const SCHOOL_TASK = "school";

export const defaultConfig: Config = {
  tasks: [
    { id: SCHOOL_TASK, label: "Kooli tööd tehtud", points: 20 },
    { id: "bed", label: "Voodi korras", points: 10 },
    { id: "bag", label: "Kott kokku homseks", points: 10 },
    { id: "laundry", label: "Must pesu korvi", points: 10 },
    { id: "trash", label: "Prügi välja viimine", points: 20, bonus: true },
    { id: "dishes", label: "Nõude pesemine", points: 15, bonus: true },
    { id: "fold", label: "Pesu kokku panemine", points: 15, bonus: true },
    { id: "wash", label: "Pesu masinasse või kuivama", points: 15, bonus: true },
    { id: "clean", label: "Koristamine", points: 20, bonus: true },
  ],
  rewards: [
    { id: "treat", label: "Lemmikmaiustus", cost: 100 },
    { id: "movie", label: "Filmiõhtu, mina valin", cost: 150 },
    { id: "money", label: "5 € taskuraha", cost: 250 },
  ],
};

export const localDay = (d = new Date()) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD kohaliku aja järgi

export type State = {
  config: Config;
  balance: number;
  earned: number; // kinnitatud teenitud miinus trahvid (tase)
  pending: number; // ootab kinnitust (punktid)
  pendingIds: string[];
  doneToday: Record<string, { entry: Entry; approved: boolean }>;
  redeemRequests: Entry[];
  history: { entry: Entry; delta: number; note: string }[];
  level: number;
  toNext: number; // mitu punkti järgmise tasemeni
};

const LEVEL_STEP = 100;

export function compute(entries: Entry[], today = localDay()): State {
  const sorted = [...entries].sort((a, b) => a.at.localeCompare(b.at));
  const byId = new Map(sorted.map((e) => [e.id, e]));
  const undone = new Set(sorted.filter((e) => e.kind === "undo" && e.ref).map((e) => e.ref!));
  const approved = new Set(sorted.filter((e) => e.kind === "approve" && e.ref).map((e) => e.ref!));
  const redeemOk = new Set(sorted.filter((e) => e.kind === "redeem_ok" && e.ref).map((e) => e.ref!));
  const redeemNo = new Set(sorted.filter((e) => e.kind === "redeem_no" && e.ref).map((e) => e.ref!));
  const config = [...sorted].reverse().find((e) => e.kind === "config")?.config ?? defaultConfig;

  let earned = 0, penalties = 0, spent = 0, pending = 0;
  const pendingIds: string[] = [];
  const doneToday: State["doneToday"] = {};
  const history: State["history"] = [];

  for (const e of sorted) {
    const p = e.points ?? 0;
    if (e.kind === "done" && !undone.has(e.id)) {
      const ok = approved.has(e.id);
      if (ok) earned += p;
      else { pending += p; pendingIds.push(e.id); }
      if (e.day === today && e.taskId) doneToday[e.taskId] = { entry: e, approved: ok };
      history.push({ entry: e, delta: ok ? p : 0, note: `${e.label}${ok ? " (kinnitatud)" : " (ootab kinnitust)"}` });
    } else if (e.kind === "bonus") {
      earned += p;
      history.push({ entry: e, delta: p, note: `Boonus${e.reason ? ": " + e.reason : ""}` });
    } else if (e.kind === "penalty") {
      penalties += p;
      history.push({ entry: e, delta: -p, note: `Trahv${e.reason ? ": " + e.reason : ""}` });
    } else if (e.kind === "redeem_ok" && e.ref) {
      const r = byId.get(e.ref);
      const cost = r?.points ?? p;
      spent += cost;
      history.push({ entry: e, delta: -cost, note: `Auhind: ${r?.label ?? e.label}` });
    }
  }
  const net = Math.max(0, earned - penalties);
  return {
    config,
    balance: earned - penalties - spent,
    earned: net,
    pending,
    pendingIds,
    doneToday,
    redeemRequests: sorted.filter((e) => e.kind === "redeem" && !redeemOk.has(e.id) && !redeemNo.has(e.id)),
    history: history.reverse(),
    level: 1 + Math.floor(net / LEVEL_STEP),
    toNext: LEVEL_STEP - (net % LEVEL_STEP),
  };
}

export const newEntry = (e: Omit<Entry, "id" | "at" | "day">): Entry => ({ ...e, id: crypto.randomUUID(), at: new Date().toISOString(), day: localDay() });

