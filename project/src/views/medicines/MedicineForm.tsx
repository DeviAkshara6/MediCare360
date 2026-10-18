import { useState } from 'react';
import type { Medicine } from '@/types';
import { uid } from '@/lib/storage';
import { todayISO } from '@/lib/dates';

interface MedicineFormProps {
  initial?: Medicine | null;
  onSubmit: (medicine: Medicine) => void;
  onCancel: () => void;
}

interface FormState {
  name: string;
  dosage: string;
  instructions: string;
  reminderTime: string;
  startDate: string;
  endDate: string;
}

interface FormErrors {
  name?: string;
  dosage?: string;
  reminderTime?: string;
  startDate?: string;
  endDate?: string;
}

export default function MedicineForm({ initial, onSubmit, onCancel }: MedicineFormProps) {
  const [form, setForm] = useState<FormState>({
    name: initial?.name ?? '',
    dosage: initial?.dosage ?? '',
    instructions: initial?.instructions ?? '',
    reminderTime: initial?.reminderTime ?? '08:00',
    startDate: initial?.startDate ?? todayISO(),
    endDate: initial?.endDate ?? todayISO(),
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Medicine name is required.';
    if (!form.dosage.trim()) e.dosage = 'Dosage is required (e.g. "1 tablet").';
    if (!form.reminderTime) e.reminderTime = 'Reminder time is required.';
    if (!form.startDate) e.startDate = 'Start date is required.';
    if (!form.endDate) e.endDate = 'End date is required.';
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      e.endDate = 'End date cannot be before the start date.';
    }
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    const medicine: Medicine = {
      id: initial?.id ?? uid('med'),
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      instructions: form.instructions.trim() || 'No special instructions.',
      reminderTime: form.reminderTime,
      startDate: form.startDate,
      endDate: form.endDate,
      status: initial?.status ?? 'pending',
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
    onSubmit(medicine);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Medicine name" error={errors.name} required>
        <input
          type="text"
          className="input-base"
          placeholder="e.g. Metformin 500mg"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          autoFocus
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Dosage" error={errors.dosage} required>
          <input
            type="text"
            className="input-base"
            placeholder="e.g. 1 tablet"
            value={form.dosage}
            onChange={(e) => update('dosage', e.target.value)}
          />
        </Field>
        <Field label="Reminder time" error={errors.reminderTime} required>
          <input
            type="time"
            className="input-base"
            value={form.reminderTime}
            onChange={(e) => update('reminderTime', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Dosage instructions" hint="How and when to take it.">
        <textarea
          className="input-base min-h-[72px] resize-y"
          placeholder="e.g. Take with food, after dinner."
          value={form.instructions}
          onChange={(e) => update('instructions', e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Start date" error={errors.startDate} required>
          <input
            type="date"
            className="input-base"
            value={form.startDate}
            onChange={(e) => update('startDate', e.target.value)}
          />
        </Field>
        <Field label="End date" error={errors.endDate} required>
          <input
            type="date"
            className="input-base"
            min={form.startDate}
            value={form.endDate}
            onChange={(e) => update('endDate', e.target.value)}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {initial ? 'Save changes' : 'Add medicine'}
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
