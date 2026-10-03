import type { DataSource, StuudiumData } from "./types";

const d = (offset: number) => {
  const x = new Date();
  x.setDate(x.getDate() + offset);
  return x.toISOString().slice(0, 10);
};

const subjects = ["Matemaatika", "Eesti keel", "Inglise keel", "Bioloogia", "Ajalugu", "Füüsika"];
const seed = [4, 5, 3, 4, 5, 4, 4, 3, 5, 5, 4, 5, 3, 4, 4, 5, 4, 5, 5, 4];

const demo: StuudiumData = {
  student: "Demo õpilane",
  grades: seed.map((value, i) => ({
    subject: subjects[i % subjects.length],
    value,
    date: d(-100 + i * 5),
    kind: i % 4 === 0 ? "Kontrolltöö" : "Tunnihinne",
  })),
  schedule: [
    [1, "08:15", "09:00", "Matemaatika", "204"],
    [1, "09:10", "09:55", "Eesti keel", "112"],
    [2, "08:15", "09:00", "Inglise keel", "301"],
    [2, "10:15", "11:00", "Bioloogia", "Lab"],
    [3, "09:10", "09:55", "Ajalugu", "115"],
    [4, "08:15", "09:00", "Füüsika", "210"],
    [5, "09:10", "09:55", "Matemaatika", "204"],
  ].map(([day, start, end, subject, room]) => ({
    day: day as number,
    start: start as string,
    end: end as string,
    subject: subject as string,
    room: room as string,
  })),
  homework: [
    { subject: "Matemaatika", text: "Ül. 45-48, lk 112", due: d(1) },
    { subject: "Eesti keel", text: "Kirjand 'Minu suvi'", due: d(3) },
    { subject: "Bioloogia", text: "Õppida peatükk 5", due: d(5) },
  ],
  absences: [
    { date: d(-12), subject: "Matemaatika", excused: true },
    { date: d(-4), subject: "Ajalugu", excused: false },
  ],
};

export const demoSource: DataSource = { load: async () => demo };
