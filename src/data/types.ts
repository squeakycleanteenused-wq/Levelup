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
  id: string;
  subject: string;
  text: string;
  due: string; // ISO
  done?: boolean;
};

export type YearSummary = { year: string; periods: string[]; final?: string };
export type SummaryRow = { subject: string; years: YearSummary[] };

/** Hinde-/tunnikirje märge: puudumine, hilinemine, tegemata töö, õpetaja märkus. */
export type Remark = {
  subject: string;
  date: string;
  kind: "puudumine" | "hilinemine" | "tegemata töö" | "märkus" | "muu";
  text: string; // õpetaja kommentaar või märke tekst
  teacher?: string;
  excused?: boolean;
  hasGrade: boolean; // kui hinne on olemas, on kommentaar tõenäoliselt hinde selgitus, mitte märkus
};

/** Suhtluse postitus (klassijuhataja, kooli töötajad). */
export type Post = { id: string; title: string; author: string; date: string; text: string; fromClassTeacher: boolean };

/** Klassijuhataja tunni ("Klassijuhatamine") märkmed ja kodutöö dashboardilt. */
export type ClassNote = { id: string; date: string; text: string; homework?: string; homeworkDue?: string };

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
  remarks: Remark[];
  posts: Post[];
  classNotes: ClassNote[];
  classTeacher?: string;
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
