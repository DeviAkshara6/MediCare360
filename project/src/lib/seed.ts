import type { AppData, Medicine, Appointment, LabRecord } from '@/types';
import { uid } from './storage';

function isoDateOffset(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function buildSeedData(): AppData {
  const today = isoDateOffset(0);

  const medicines: Medicine[] = [
    {
      id: uid('med'),
      name: 'Metformin 500mg',
      dosage: '1 tablet',
      instructions: 'Take with breakfast and dinner. Do not crush.',
      reminderTime: '08:00',
      startDate: isoDateOffset(-10),
      endDate: isoDateOffset(20),
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: uid('med'),
      name: 'Vitamin D3',
      dosage: '1 capsule',
      instructions: 'Take after lunch with water.',
      reminderTime: '13:00',
      startDate: isoDateOffset(-30),
      endDate: isoDateOffset(60),
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: uid('med'),
      name: 'Atorvastatin 10mg',
      dosage: '1 tablet',
      instructions: 'Take at bedtime with water.',
      reminderTime: '22:00',
      startDate: isoDateOffset(-5),
      endDate: isoDateOffset(25),
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ];

  const appointments: Appointment[] = [
    {
      id: uid('apt'),
      doctorName: 'Dr. Anita Sharma',
      specialty: 'Cardiology',
      date: isoDateOffset(3),
      time: '10:30',
      notes: 'Routine follow-up. Bring previous ECG report.',
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    },
    {
      id: uid('apt'),
      doctorName: 'Dr. Rajesh Kumar',
      specialty: 'General Physician',
      date: isoDateOffset(8),
      time: '15:00',
      notes: 'Discuss recent blood test results.',
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    },
    {
      id: uid('apt'),
      doctorName: 'Dr. Meera Iyer',
      specialty: 'Dermatology',
      date: isoDateOffset(-14),
      time: '11:00',
      notes: 'Skin allergy consultation. Completed.',
      status: 'completed',
      createdAt: new Date().toISOString(),
    },
  ];

  const labRecords: LabRecord[] = [
    {
      id: uid('lab'),
      testName: 'Complete Blood Count (CBC)',
      labName: 'Sunrise Diagnostics',
      testDate: isoDateOffset(-7),
      notes: 'Fasting sample collected at 8:15 AM.',
      resultsSummary:
        'Hemoglobin: 13.8 g/dL (normal). WBC: 7,200/µL (normal). Platelets: 2.5 lakh/µL (normal).',
      createdAt: new Date().toISOString(),
    },
    {
      id: uid('lab'),
      testName: 'Lipid Profile',
      labName: 'Apollo Labs',
      testDate: isoDateOffset(-21),
      notes: 'Cholesterol monitoring.',
      resultsSummary:
        'Total Cholesterol: 192 mg/dL. LDL: 118 mg/dL. HDL: 48 mg/dL. Triglycerides: 130 mg/dL.',
      createdAt: new Date().toISOString(),
    },
    {
      id: uid('lab'),
      testName: 'Thyroid Profile (T3, T4, TSH)',
      labName: 'Sunrise Diagnostics',
      testDate: isoDateOffset(-45),
      notes: 'Annual checkup panel.',
      resultsSummary: 'TSH: 2.4 µIU/mL (normal). T3: 118 ng/dL. T4: 8.1 µg/dL.',
      createdAt: new Date().toISOString(),
    },
  ];

  void today;
  return { medicines, appointments, labRecords, seeded: true };
}
