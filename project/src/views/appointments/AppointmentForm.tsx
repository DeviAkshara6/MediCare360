import { useState } from 'react';
import type { Appointment } from '@/types';
import { uid } from '@/lib/storage';
import { todayISO } from '@/lib/dates';

interface AppointmentFormProps {
  initial?: Appointment | null;
  onSubmit: (appointment: Appointment) => void;
  onCancel: () => void;
}

interface FormState {
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  notes: string;
}

interface FormErrors {
  doctorName?: string;
  specialty?: string;
  date?: string;
  time?: string;
}

export default function AppointmentForm({ initial, onSubmit, onCancel }: AppointmentFormProps) {
  const [form, setForm] = useState<FormState>({
    doctorName: initial?.doctorName ?? '',
    specialty: initial?.specialty ?? '',
    date: initial?.date ?? todayISO(),
    time: initial?.time ?? '10:00',
    notes: initial?.notes ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.doctorName.trim()) e.doctorName = 'Doctor name is required.';
    if (!form.specialty.trim()) e.specialty = 'Specialty is required.';
    if (!form.date) {
      e.date = 'Date is required.';
    } else if (form.date < todayISO()) {
      e.date = 'Cannot book an appointment in the past.';
    }
    if (!form.time) e.time = 'Time is required.';
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    const appointment: Appointment = {
      id: initial?.id ?? uid('apt'),
      doctorName: form.doctorName.trim(),
      specialty: form.specialty.trim(),
      date: form.date,
      time: form.time,
      notes: form.notes.trim(),
      status: initial?.status ?? 'upcoming',
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
    onSubmit(appointment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Doctor name" error={errors.doctorName} required>
          <input
            type="text"
            className="input-base"
            placeholder="e.g. Dr. Anita Sharma"
            value={form.doctorName}
            onChange={(e) => update('doctorName', e.target.value)}
            autoFocus
          />
        </Field>
        <Field label="Specialty" error={errors.specialty} required>
          <input
            type="text"
            className="input-base"
            placeholder="e.g. Cardiology"
            value={form.specialty}
            onChange={(e) => update('specialty', e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Appointment date" error={errors.date} required>
          <input
            type="date"
            className="input-base"
            min={todayISO()}
            value={form.date}
            onChange={(e) => update('date', e.target.value)}
          />
        </Field>
        <Field label="Appointment time" error={errors.time} required>
          <input
            type="time"
            className="input-base"
            value={form.time}
            onChange={(e) => update('time', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Notes" hint="Optional — reason for visit, documents to bring, etc.">
        <textarea
          className="input-base min-h-[72px] resize-y"
          placeholder="e.g. Routine follow-up. Bring previous reports."
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
        />
      </Field>

      <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
        This is a personal scheduling tool. It does not confirm bookings with real clinics.
      </p>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {initial ? 'Save changes' : 'Book appointment'}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label-base">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
