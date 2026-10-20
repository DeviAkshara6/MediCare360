import type { Appointment, AppData, LabRecord, Medicine } from '@/types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api').replace(/\/$/, '');
const TOKEN_KEY = 'medicare360:auth-token';
export interface AuthUser { id: string; fullName: string; email: string; }
export interface AuthResponse { token: string; user: AuthUser; }

export function getAuthUser(): AuthUser | null {
  const raw = window.localStorage.getItem('medicare360:auth-user');
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
}
function setSession(session: AuthResponse): void {
  window.localStorage.setItem(TOKEN_KEY, session.token);
  window.localStorage.setItem('medicare360:auth-user', JSON.stringify(session.user));
}
export function clearSession(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem('medicare360:auth-user');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const isFormData = options?.body instanceof FormData;
  const token = window.localStorage.getItem(TOKEN_KEY);
  const { headers: optionHeaders, ...requestOptions } = options ?? {};
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(optionHeaders ?? {}),
    },
    ...requestOptions,
  });
  if (response.status === 401) {
    clearSession();
    window.dispatchEvent(new Event('medicare360:auth-expired'));
  }
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // Keep the HTTP status when the server did not return JSON.
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  async register(fullName: string, email: string, password: string, confirmPassword: string): Promise<AuthResponse> {
    const session = await request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ fullName, email, password, confirmPassword }) });
    setSession(session);
    return session;
  },
  async login(email: string, password: string): Promise<AuthResponse> {
    const session = await request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    setSession(session);
    return session;
  },
  logout(): void { clearSession(); },
  async loadData(): Promise<AppData> {
    const [medicines, appointments, labRecords] = await Promise.all([
      request<Medicine[]>('/medicines'),
      request<Appointment[]>('/appointments'),
      request<LabRecord[]>('/labs'),
    ]);
    return { medicines, appointments, labRecords, seeded: true };
  },
  createMedicine: (medicine: Medicine) => request<Medicine>('/medicines', { method: 'POST', body: JSON.stringify(medicine) }),
  updateMedicine: (medicine: Medicine) => request<Medicine>(`/medicines/${medicine.id}`, { method: 'PUT', body: JSON.stringify(medicine) }),
  deleteMedicine: (id: string) => request<void>(`/medicines/${id}`, { method: 'DELETE' }),
  createAppointment: (appointment: Appointment) => request<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(appointment) }),
  updateAppointment: (appointment: Appointment) => request<Appointment>(`/appointments/${appointment.id}`, { method: 'PUT', body: JSON.stringify(appointment) }),
  deleteAppointment: (id: string) => request<void>(`/appointments/${id}`, { method: 'DELETE' }),
  createLab: (record: LabRecord) => request<LabRecord>('/labs', { method: 'POST', body: JSON.stringify(record) }),
  updateLab: (record: LabRecord) => request<LabRecord>(`/labs/${record.id}`, { method: 'PUT', body: JSON.stringify(record) }),
  deleteLab: (id: string) => request<void>(`/labs/${id}`, { method: 'DELETE' }),
  uploadLabPdf: async (id: string, file: File): Promise<LabRecord> => {
    const form = new FormData();
    form.append('file', file);
    return request<LabRecord>(`/labs/${id}/pdf`, { method: 'POST', body: form, headers: {} });
  },
  deleteLabPdf: (id: string) => request<void>(`/labs/${id}/pdf`, { method: 'DELETE' }),
  pdfUrl: (id: string) => `${API_BASE_URL}/labs/${id}/pdf`,
};

export async function getPdfBlob(id: string): Promise<{ blob: Blob; filename: string } | null> {
  const token = window.localStorage.getItem(TOKEN_KEY);
  const response = await fetch(api.pdfUrl(id), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (response.status === 401) {
    clearSession();
    window.dispatchEvent(new Event('medicare360:auth-expired'));
  }
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Could not load PDF (${response.status}).`);
  const disposition = response.headers.get('content-disposition') ?? '';
  const match = disposition.match(/filename="?([^"]+)"?/i);
  return { blob: new Blob([await response.blob()], { type: 'application/pdf' }), filename: match?.[1] ?? `lab-report-${id}.pdf` };
}
