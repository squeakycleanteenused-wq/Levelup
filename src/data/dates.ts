const DAY = 864e5;
export const todayIso = () => new Date().toISOString().slice(0, 10);
const days = (iso: string) => Math.round((Date.parse(iso + "T12:00:00Z") - Date.parse(todayIso() + "T12:00:00Z")) / DAY);
const weekday = (iso: string) => new Date(iso + "T12:00").toLocaleDateString("et-EE", { weekday: "long" });

/** Inimlik suhteline kuupäev: "täna", "homme", "esmaspäeval (2 päeva pärast)", "3 päeva tagasi". */
export function rel(iso: string): string {
  const d = days(iso);
  if (d === 0) return "täna";
  if (d === 1) return "homme";
  if (d === -1) return "eile";
  if (d > 1 && d <= 6) return `${weekday(iso)}al (${d} päeva pärast)`.replace("aal", "al");
  if (d > 6) return `${iso.slice(8)}.${iso.slice(5, 7)} (${d} päeva pärast)`;
  return `${-d} päeva tagasi`;
}
export const daysFromToday = days;
export const dm = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
