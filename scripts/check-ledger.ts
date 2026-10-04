import { compute, newEntry, localDay } from "../src/data/ledger";
const t = localDay();
const e = (x: Parameters<typeof newEntry>[0]) => ({ ...newEntry(x), at: new Date(Date.now() + Math.random() * 1000).toISOString() });
const d1 = e({ by: "laps", kind: "done", taskId: "bed", label: "Voodi korras", points: 10 });
const d2 = e({ by: "laps", kind: "done", taskId: "school", label: "Kooli tööd tehtud", points: 20 });
const d3 = e({ by: "laps", kind: "done", taskId: "bag", label: "Kott", points: 10 });
const u3 = e({ by: "laps", kind: "undo", ref: d3.id });
let s = compute([d1, d2, d3, u3], t);
console.log("enne kinnitust: saldo", s.balance, "ootel", s.pending, "(oodatud 0 ja 30)");
const a1 = e({ by: "vanem", kind: "approve", ref: d1.id }), a2 = e({ by: "vanem", kind: "approve", ref: d2.id });
const pen = e({ by: "vanem", kind: "penalty", points: 12, reason: "valetas kodutööde kohta" });
const bonus = e({ by: "vanem", kind: "bonus", points: 100, reason: "aitas naabrit" });
s = compute([d1, d2, d3, u3, a1, a2, pen, bonus], t);
console.log("pärast: saldo", s.balance, "(oodatud 30-12+100=118) | tase", s.level, "| järgmiseni", s.toNext);
const r = e({ by: "laps", kind: "redeem", label: "Filmiõhtu", points: 150 });
s = compute([d1, d2, a1, a2, bonus, pen, r], t);
console.log("taotlusi:", s.redeemRequests.length, "| saldo enne ostu", s.balance);
const ok = e({ by: "vanem", kind: "redeem_ok", ref: r.id });
s = compute([d1, d2, a1, a2, bonus, pen, r, ok], t);
console.log("saldo pärast ostu:", s.balance, "(oodatud 118-150=-32) | taotlusi:", s.redeemRequests.length);
console.log(s.history.map((h) => `${h.delta >= 0 ? "+" : ""}${h.delta} ${h.note}`).join(" | "));

// nimekirja muutmine: viimane config kirje kehtib, vanad punktid ei muutu
const cfg = e({ by: "vanem", kind: "config", config: { tasks: [{ id: "bed", label: "Voodi", points: 15 }, { id: "dog", label: "Koer õue", points: 25 }], rewards: [{ id: "x", label: "Jäätis", cost: 50 }] } });
s = compute([d1, a1, cfg], t);
console.log("uus nimekiri:", s.config.tasks.map((x) => `${x.label} ${x.points}`).join(", "), "| saldo jäi:", s.balance, "(oodatud 10)");
