import type { Appointment, AppData, LabRecord, Medicine } from '@/types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api').replace(/\/$/, '');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const isFormData = options?.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: isFormData ? options?.headers : { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  });
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
  const response = await fetch(api.pdfUrl(id));
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Could not load PDF (${response.status}).`);
  const disposition = response.headers.get('content-disposition') ?? '';
  const match = disposition.match(/filename="?([^"]+)"?/i);
  return { blob: new Blob([await response.blob()], { type: 'application/pdf' }), filename: match?.[1] ?? `lab-report-${id}.pdf` };
}
