export type DoseStatus = 'pending' | 'taken' | 'skipped';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  reminderTime: string; // HH:MM 24h
  startDate: string; // ISO date yyyy-mm-dd
  endDate: string; // ISO date yyyy-mm-dd
  status: DoseStatus;
  createdAt: string;
}

export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:MM
  notes: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface LabRecord {
  id: string;
  testName: string;
  labName: string;
  testDate: string; // yyyy-mm-dd
  notes: string;
  resultsSummary?: string;
  pdfFilename?: string; // set when a PDF report is attached in backend GridFS
  pdfSize?: number; // bytes, for display
  createdAt: string;
}

export interface AppData {
  medicines: Medicine[];
  appointments: Appointment[];
  labRecords: LabRecord[];
  seeded: boolean;
}
