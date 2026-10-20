import { useMemo, useState } from 'react';
import {
  Pill,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  SkipForward,
  Clock,
  RotateCcw,
  Search,
} from 'lucide-react';
import type { Medicine, DoseStatus } from '@/types';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import MedicineForm from './MedicineForm';
import { formatDate, formatTime, isDateInRange, todayISO } from '@/lib/dates';

interface MedicinesViewProps {
  medicines: Medicine[];
  onAdd: (medicine: Medicine) => Promise<void>;
  onUpdate: (medicine: Medicine) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: DoseStatus) => Promise<void>;
  openAddOnMount?: boolean;
}

export default function MedicinesView({
  medicines,
  onAdd,
  onUpdate,
  onDelete,
  onStatusChange,
  openAddOnMount,
}: MedicinesViewProps) {
  const { notify } = useToast();
  const [modalOpen, setModalOpen] = useState(openAddOnMount ?? false);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'active'>('all');
  const [query, setQuery] = useState('');

  const today = todayISO();

  const filtered = useMemo(() => {
    let list = [...medicines];
    if (filter === 'today') {
      list = list.filter((m) => isDateInRange(today, m.startDate, m.endDate));
    } else if (filter === 'active') {
      list = list.filter((m) => m.endDate >= today);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.dosage.toLowerCase().includes(q) ||
          m.instructions.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => a.reminderTime.localeCompare(b.reminderTime));
  }, [medicines, filter, query, today]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (m: Medicine) => {
    setEditing(m);
    setModalOpen(true);
  };

  const handleSubmit = async (m: Medicine) => {
    try {
      if (editing) {
        await onUpdate(m);
        notify('Medicine updated successfully.');
      } else {
        await onAdd(m);
        notify('Medicine reminder added.');
      }
      setModalOpen(false);
      setEditing(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save the medicine.';
      notify(message, 'error');
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      notify('Medicine deleted.', 'info');
      setDeleteId(null);
    }
  };

  const deleteTarget = medicines.find((m) => m.id === deleteId) ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicine Reminders"
        subtitle="Track your daily doses and never miss a reminder."
        icon={<Pill size={22} />}
        action={
          <button onClick={openAdd} className="btn-primary">
            <Plus size={16} /> Add Medicine
          </button>
        }
      />

      {/* Reminder banner */}
      <ReminderBanner medicines={medicines} />

      {/* Filter + search */}
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          {([
            ['all', 'All'],
            ['today', 'Today'],
            ['active', 'Active'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                filter === key ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input-base pl-9"
            placeholder="Search medicines..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Pill size={28} />}
            title={medicines.length === 0 ? 'No medicines yet' : 'No matches found'}
            description={
              medicines.length === 0
                ? 'Add your first medicine reminder to start tracking your daily doses.'
                : 'Try a different search term or filter.'
            }
            action={
              medicines.length === 0 ? (
                <button onClick={openAdd} className="btn-primary">
                  <Plus size={16} /> Add Medicine
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Medicine</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Schedule</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((m) => (
                  <MedicineRow
                    key={m.id}
                    medicine={m}
                    onEdit={() => openEdit(m)}
                    onDelete={() => setDeleteId(m.id)}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editing ? 'Edit medicine' : 'Add medicine'}
        description={
          editing
            ? 'Update the details for this reminder.'
            : 'Fill in the details to create a new medicine reminder.'
        }
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        size="md"
      >
        <MedicineForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete medicine?"
        message={
          deleteTarget ? (
            <>
              This will permanently remove <strong>{deleteTarget.name}</strong> from your reminders.
              This action cannot be undone.
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function ReminderBanner({ medicines }: { medicines: Medicine[] }) {
  const today = todayISO();
  const due = medicines.filter(
    (m) => isDateInRange(today, m.startDate, m.endDate) && m.status === 'pending',
  );
  if (due.length === 0) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800 animate-slide-up">
      <Clock size={20} className="mt-0.5 shrink-0" />
      <div className="flex-1 text-sm">
        <p className="font-semibold">
          {due.length} {due.length === 1 ? 'medicine is' : 'medicines are'} due today
        </p>
        <p className="mt-0.5 text-amber-700/90">
          {due.slice(0, 3).map((m) => m.name).join(', ')}
          {due.length > 3 ? ` and ${due.length - 3} more` : ''}
        </p>
      </div>
    </div>
  );
}

function MedicineRow({
  medicine,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  medicine: Medicine;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (id: string, status: DoseStatus) => void;
}) {
  const isActiveToday = isDateInRange(todayISO(), medicine.startDate, medicine.endDate);
  const status = medicine.status;

  return (
    <tr className="transition hover:bg-slate-50/60">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <Pill size={16} />
          </span>
          <div>
            <p className="font-semibold text-slate-900">{medicine.name}</p>
            <p className="text-xs text-slate-500">{medicine.dosage}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5 text-slate-700">
          <Clock size={14} className="text-slate-400" />
          <span className="font-medium">{formatTime(medicine.reminderTime)}</span>
        </div>
        <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-400">
          {medicine.instructions}
        </p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm text-slate-700">{formatDate(medicine.startDate)}</p>
        <p className="text-xs text-slate-400">to {formatDate(medicine.endDate)}</p>
      </td>
      <td className="px-5 py-4">
        {isActiveToday ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={status} />
            <button
              onClick={() => onStatusChange(medicine.id, 'taken')}
              disabled={status === 'taken'}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-mint-700 transition hover:bg-mint-50 disabled:opacity-40"
              title="Mark as taken"
            >
              <CheckCircle2 size={13} /> Taken
            </button>
            <button
              onClick={() => onStatusChange(medicine.id, 'skipped')}
              disabled={status === 'skipped'}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-50 disabled:opacity-40"
              title="Mark as skipped"
            >
              <SkipForward size={13} /> Skip
            </button>
            {status !== 'pending' && (
              <button
                onClick={() => onStatusChange(medicine.id, 'pending')}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
                title="Reset to pending"
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </div>
        ) : (
          <span className="chip bg-slate-100 text-slate-500">
            {medicine.endDate < todayISO() ? 'Ended' : 'Upcoming'}
          </span>
        )}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1">
          <button onClick={onEdit} className="btn-ghost text-brand-600 hover:bg-brand-50" title="Edit">
            <Pencil size={15} />
          </button>
          <button onClick={onDelete} className="btn-ghost text-rose-600 hover:bg-rose-50" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: DoseStatus }) {
  if (status === 'taken') {
    return <span className="chip bg-mint-100 text-mint-700"><CheckCircle2 size={12} /> Taken</span>;
  }
  if (status === 'skipped') {
    return <span className="chip bg-amber-100 text-amber-700"><SkipForward size={12} /> Skipped</span>;
  }
  return <span className="chip bg-slate-100 text-slate-600"><Clock size={12} /> Pending</span>;
}
