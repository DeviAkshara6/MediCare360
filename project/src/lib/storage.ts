import type { AppData } from '@/types';

const STORAGE_KEY = 'medicare360:data:v1';

const empty: AppData = {
  medicines: [],
  appointments: [],
  labRecords: [],
  seeded: false,
};

export function loadData(): AppData {
  if (typeof window === 'undefined') return empty;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as AppData;
    return {
      medicines: Array.isArray(parsed.medicines) ? parsed.medicines : [],
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments : [],
      labRecords: Array.isArray(parsed.labRecords) ? parsed.labRecords : [],
      seeded: !!parsed.seeded,
    };
  } catch (err) {
    console.error('Failed to load MediCare360 data:', err);
    return empty;
  }
}

export function saveData(data: AppData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save MediCare360 data:', err);
  }
}

export function clearData(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear MediCare360 data:', err);
  }
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
