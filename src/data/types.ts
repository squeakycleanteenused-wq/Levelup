export type Grade = {
  subject: string;
  value: number | null; // 1-5; null = mittearvuline (A, MA, ...)
  label: string; // kuvatav hinne: "4", "A"
  date: string; // ISO
  kind: string; // nt "Kontrolltöö"
  note?: string; // õpetaja tagasiside (jutumull)
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

/** Tabeli lahter: ainetunni teema ja kodutöö ühel päeval. */
export type LessonCell = { subject: string; date: string; topics: string[]; homework: { due: string; text: string }[] };

/** Hinde-/tunnikirje märge: puudumine, hilinemine, tegemata töö, õpetaja märkus. */
export type Remark = {
  subject: string;
  date: string;
  kind: "puudumine" | "hilinemine" | "tegemata töö" | "märkus" | "tagasiside" | "vabastatud" | "muu";
  text: string; // õpetaja märkus (!) või tagasiside (jutumull) või märke tekst
  teacher?: string;
  excused?: boolean;
  hasGrade: boolean; // kui hinne on olemas, on kommentaar tõenäoliselt hinde selgitus, mitte märkus
};

/** Suhtluse postitus (klassijuhataja, kooli töötajad). */
export type PostComment = { author: string; date: string; text: string };
export type Post = {
  id: string;
  title: string;
  author: string;
  created: string; // ISO kuupäev, millal postitus tehti
  activity: string; // ISO kuupäev, millal viimati midagi juhtus (muudatus või vastus)
  updated: boolean; // activity > created: postitust on uuendatud
  text: string;
  audience: string[]; // nt ["5b vanemad ja õpetaja"] või ["Kogu kool"]
  commentCount: number;
  comments: PostComment[]; // täis ainult siis, kui postituse enda leht on imporditud
  fromClassTeacher: boolean;
  forMyClass: boolean;
};

/** Klassijuhataja tunni ("Klassijuhatamine") märkmed ja kodutöö dashboardilt. */
export type ClassNote = { id: string; date: string; text: string; homework?: string; homeworkDue?: string };

/** Klassi jututuba (Stuudiumi /chat/g/<id>). Lapsevanemana saab lugeda, kirjutada mitte. */
export type RoomMsg = { id: string; userId: string; name: string; date: string; time: string; text: string };
export type ChatRoom = { title: string; canSend: boolean; messages: RoomMsg[] };

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
  cells: LessonCell[];
  room?: ChatRoom;
  baseUrl?: string; // nt https://variku.ope.ee
  links?: Record<string, string>; // aine nimi -> Stuudiumi aine leht (hinded, kommentaarid, tunnid)
  classNotes: ClassNote[];
  classTeacher?: string;
  className?: string;
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
