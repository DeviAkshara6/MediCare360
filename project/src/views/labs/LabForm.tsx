import { useState } from 'react';
import { UploadCloud, FileText, X, Paperclip } from 'lucide-react';
import type { LabRecord } from '@/types';
import { uid } from '@/lib/storage';
import { todayISO } from '@/lib/dates';

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB

interface LabFormProps {
  initial?: LabRecord | null;
  onSubmit: (record: LabRecord, pdf: File | null, removePdf: boolean) => void;
  onCancel: () => void;
}

interface FormState {
  testName: string;
  labName: string;
  testDate: string;
  notes: string;
  resultsSummary: string;
}

interface FormErrors {
  testName?: string;
  labName?: string;
  testDate?: string;
  pdf?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LabForm({ initial, onSubmit, onCancel }: LabFormProps) {
  const [form, setForm] = useState<FormState>({
    testName: initial?.testName ?? '',
    labName: initial?.labName ?? '',
    testDate: initial?.testDate ?? todayISO(),
    notes: initial?.notes ?? '',
    resultsSummary: initial?.resultsSummary ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  // PDF selection state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  // Tracks the filename of an already-attached PDF when editing
  const existingPdf = initial?.pdfFilename ?? null;
  // Set true when the user removes an existing PDF without selecting a new one
  const [removeExistingPdf, setRemoveExistingPdf] = useState(false);

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    setErrors((prev) => ({ ...prev, pdf: undefined }));
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setPdfFile(null);
      setErrors((prev) => ({ ...prev, pdf: 'Only PDF files are allowed.' }));
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setPdfFile(null);
      setErrors((prev) => ({
        ...prev,
        pdf: `File is too large (${formatSize(file.size)}). Maximum allowed is 10 MB.`,
      }));
      return;
    }
    setPdfFile(file);
    setRemoveExistingPdf(false);
  };

  const clearPdf = () => {
    setPdfFile(null);
    if (existingPdf) setRemoveExistingPdf(true);
    setErrors((prev) => ({ ...prev, pdf: undefined }));
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.testName.trim()) e.testName = 'Test name is required.';
    if (!form.labName.trim()) e.labName = 'Laboratory name is required.';
    if (!form.testDate) e.testDate = 'Test date is required.';
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    const record: LabRecord = {
      id: initial?.id ?? uid('lab'),
      testName: form.testName.trim(),
      labName: form.labName.trim(),
      testDate: form.testDate,
      notes: form.notes.trim(),
      resultsSummary: form.resultsSummary.trim() || undefined,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };

    if (pdfFile) {
      record.pdfFilename = pdfFile.name;
      record.pdfSize = pdfFile.size;
    } else if (removeExistingPdf) {
      record.pdfFilename = undefined;
      record.pdfSize = undefined;
    } else if (existingPdf && initial) {
      record.pdfFilename = initial.pdfFilename;
      record.pdfSize = initial.pdfSize;
    }

    onSubmit(record, pdfFile, removeExistingPdf);
  };

  const activeFilename = pdfFile?.name ?? (removeExistingPdf ? null : existingPdf);
  const activeSize = pdfFile?.size ?? (removeExistingPdf ? null : initial?.pdfSize ?? null);

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Test name" error={errors.testName} required>
          <input
            type="text"
            className="input-base"
            placeholder="e.g. Complete Blood Count"
            value={form.testName}
            onChange={(e) => update('testName', e.target.value)}
            autoFocus
          />
        </Field>
        <Field label="Laboratory name" error={errors.labName} required>
          <input
            type="text"
            className="input-base"
            placeholder="e.g. Sunrise Diagnostics"
            value={form.labName}
            onChange={(e) => update('labName', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Test date" error={errors.testDate} required>
        <input
          type="date"
          className="input-base sm:max-w-xs"
          value={form.testDate}
          onChange={(e) => update('testDate', e.target.value)}
        />
      </Field>

      {/* PDF upload */}
      <Field
        label="Upload report PDF"
        error={errors.pdf}
        hint="Optional — attach the scanned lab report. PDF only, up to 10 MB."
      >
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-5 text-sm font-medium text-slate-500 transition hover:border-teal-400 hover:bg-teal-50/40 hover:text-teal-700">
            <UploadCloud size={20} />
            <span>{pdfFile || existingPdf ? 'Choose a different PDF' : 'Click to select a PDF file'}</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
          </label>

          {activeFilename ? (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 animate-slide-up">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <FileText size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{activeFilename}</p>
                {activeSize != null && (
                  <p className="text-xs text-slate-400">{formatSize(activeSize)} · PDF</p>
                )}
              </div>
              <button
                type="button"
                onClick={clearPdf}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                title="Remove PDF"
                aria-label="Remove PDF"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <Paperclip size={12} /> No PDF selected. The record can be saved without a file.
            </p>
          )}
        </div>
      </Field>

      <Field label="Results summary" hint="Optional — key values or outcome from the report.">
        <textarea
          className="input-base min-h-[90px] resize-y"
          placeholder="e.g. Hemoglobin: 13.8 g/dL (normal). WBC: 7,200/µL (normal)."
          value={form.resultsSummary}
          onChange={(e) => update('resultsSummary', e.target.value)}
        />
      </Field>

      <Field label="Notes" hint="Optional — fasting, sample time, etc.">
        <textarea
          className="input-base min-h-[72px] resize-y"
          placeholder="e.g. Fasting sample collected at 8:15 AM."
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
        />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {initial ? 'Save changes' : 'Add record'}
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
