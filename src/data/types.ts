export type Grade = {
  subject: string;
  value: number; // 1-5
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

export type Absence = { date: string; subject: string; excused: boolean };

export type StuudiumData = {
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
