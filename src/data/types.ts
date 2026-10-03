export type Grade = {
  subject: string;
  value: number | null; // 1-5; null = mittearvuline (A, MA, ...)
  label: string; // kuvatav hinne: "4", "A"
  date: string; // ISO
  kind: string; // nt "Kontrolltöö"
  weight?: number;
};

export type Lesson = {
  day: number; // 1 = esmaspäev
  start: string; // "08:15"
  end: string;
  subject: string;
  room?: string;
};

export type Homework = {
  subject: string;
  text: string;
  due: string; // ISO
  done?: boolean;
};

export type YearSummary = { year: string; periods: string[]; final?: string };
export type SummaryRow = { subject: string; years: YearSummary[] };

export type Absence = { date: string; subject: string; excused: boolean };

export type CalEvent = {
  id: string; // püsiv Stuudiumi id, et uuesti importimine uuendaks, mitte dubleeriks
  title: string;
  start: string; // ISO kuupäev või kuupäev+kellaaeg
  end?: string;
  allDay?: boolean;
  place?: string;
  scope: "school" | "class";
  className?: string; // nt "7.A", kui scope = "class"
};

export type StuudiumData = {
  events: CalEvent[];
  summary: SummaryRow[];
  student: string;
  grades: Grade[];
  schedule: Lesson[];
  homework: Homework[];
  absences: Absence[];
};

/** Andmeallikas: demo või päris Stuudium. Vaated ei tea vahet. */
export interface DataSource {
  load(): Promise<StuudiumData>;
}
