import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: LucideIcon;
  tone?: 'danger' | 'default';
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  icon: Icon,
  tone = 'danger',
}: ConfirmDialogProps) {
  if (!open) return null;
  const Icon_ = Icon;
  const confirmClass =
    tone === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/20'
      : 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500/20';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
      <div className="relative w-full max-w-md animate-scale-in rounded-2xl bg-white p-6 shadow-pop">
        <div className="flex items-start gap-4">
          {Icon_ && (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Icon_ size={22} />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <div className="mt-1.5 text-sm text-slate-600">{message}</div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4 ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
