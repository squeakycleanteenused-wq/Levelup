import type { CalEvent } from "./types";

const esc = (t: string) => t.replace(/[\;,]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
const day = (iso: string) => iso.slice(0, 10).replace(/-/g, "");
const dt = (iso: string) => day(iso) + "T" + iso.slice(11, 16).replace(":", "") + "00";

function nextDay(iso: string) {
  const x = new Date(iso.slice(0, 10) + "T00:00:00Z");
  x.setUTCDate(x.getUTCDate() + 1);
  return x.toISOString().slice(0, 10).replace(/-/g, "");
}

/** UID on püsiv (Stuudiumi id põhjal), nii uuendab uuesti importimine olemasolevaid sündmusi. */
export function toIcs(events: CalEvent[], name = "Levelup"): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Levelup//ET", `X-WR-CALNAME:${esc(name)}`, "X-WR-TIMEZONE:Europe/Tallinn"];
  for (const e of events) {
    const allDay = e.allDay || e.start.length <= 10;
    lines.push("BEGIN:VEVENT", `UID:${e.scope}-${e.className ?? "kool"}-${e.id}@levelup`, `DTSTAMP:${dt(new Date().toISOString())}Z`);
    if (allDay) {
      lines.push(`DTSTART;VALUE=DATE:${day(e.start)}`, `DTEND;VALUE=DATE:${nextDay(e.end ?? e.start)}`);
    } else {
      lines.push(`DTSTART;TZID=Europe/Tallinn:${dt(e.start)}`);
      lines.push(`DTEND;TZID=Europe/Tallinn:${dt(e.end ?? e.start)}`);
    }
    lines.push(`SUMMARY:${esc(e.className ? `[${e.className}] ${e.title}` : e.title)}`);
    if (e.place) lines.push(`LOCATION:${esc(e.place)}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function download(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/calendar" }));
  Object.assign(document.createElement("a"), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}
