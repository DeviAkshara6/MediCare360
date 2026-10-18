import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  CalendarX,
  RotateCcw,
  Stethoscope,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import type { Appointment, AppointmentStatus } from '@/types';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import AppointmentForm from './AppointmentForm';
import { formatDate, formatTime, todayISO, relativeDay, daysFromNow } from '@/lib/dates';

interface AppointmentsViewProps {
  appointments: Appointment[];
  onAdd: (appointment: Appointment) => void;
  onUpdate: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  openAddOnMount?: boolean;
}

export default function AppointmentsView({
  appointments,
  onAdd,
  onUpdate,
  onDelete,
  onStatusChange,
  openAddOnMount,
}: AppointmentsViewProps) {
  const { notify } = useToast();
  const [modalOpen, setModalOpen] = useState(openAddOnMount ?? false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'upcoming' | 'completed' | 'cancelled' | 'all'>('upcoming');
  const [query, setQuery] = useState('');

  const today = todayISO();

  const filtered = useMemo(() => {
    let list = [...appointments];
    if (filter !== 'all') list = list.filter((a) => a.status === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.doctorName.toLowerCase().includes(q) ||
          a.specialty.toLowerCase().includes(q) ||
          a.notes.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [appointments, filter, query]);

  const counts = useMemo(
    () => ({
      upcoming: appointments.filter((a) => a.status === 'upcoming').length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      cancelled: appointments.filter((a) => a.status === 'cancelled').length,
      all: appointments.length,
    }),
    [appointments],
  );

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (a: Appointment) => {
    setEditing(a);
    setModalOpen(true);
  };

  const handleSubmit = (a: Appointment) => {
    if (editing) {
      onUpdate(a);
      notify('Appointment updated successfully.');
    } else {
      onAdd(a);
      notify('Appointment booked successfully.');
    }
    setModalOpen(false);
    setEditing(null);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      notify('Appointment deleted.', 'info');
      setDeleteId(null);
    }
  };

  const deleteTarget = appointments.find((a) => a.id === deleteId) ?? null;
  const rescheduleTarget = appointments.find((a) => a.id === rescheduleId) ?? null;

  const cancel = (a: Appointment) => {
    onStatusChange(a.id, 'cancelled');
    notify('Appointment cancelled.', 'info');
  };
  const complete = (a: Appointment) => {
    onStatusChange(a.id, 'completed');
    notify('Appointment marked as completed.');
  };

  const tabs: Array<[typeof filter, string, number]> = [
    ['upcoming', 'Upcoming', counts.upcoming],
    ['completed', 'Completed', counts.completed],
    ['cancelled', 'Cancelled', counts.cancelled],
    ['all', 'All', counts.all],
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctor Appointments"
        subtitle="Book, reschedule, and keep track of your doctor visits."
        icon={<CalendarDays size={22} />}
        action={
          <button onClick={openAdd} className="btn-primary">
            <Plus size={16} /> Book Appointment
          </button>
        }
      />

      {/* Tabs + search */}
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          {tabs.map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                filter === key ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
              <span className="rounded-full bg-slate-200 px-1.5 text-xs text-slate-600">{count}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input-base pl-9"
            placeholder="Search doctor or specialty..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={28} />}
            title={appointments.length === 0 ? 'No appointments yet' : 'Nothing here'}
            description={
              appointments.length === 0
                ? 'Book your first doctor appointment to start managing your visits.'
                : 'No appointments match the current filter. Try another tab.'
            }
            action={
              appointments.length === 0 ? (
                <button onClick={openAdd} className="btn-primary">
                  <Plus size={16} /> Book Appointment
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Doctor</th>
                  <th className="px-5 py-3">Date & Time</th>
                  <th className="px-5 py-3">Notes</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <AppointmentRow
                    key={a.id}
                    appointment={a}
                    today={today}
                    onEdit={() => openEdit(a)}
                    onDelete={() => setDeleteId(a.id)}
                    onCancel={() => cancel(a)}
                    onComplete={() => complete(a)}
                    onReschedule={() => setRescheduleId(a.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editing ? 'Edit appointment' : 'Book appointment'}
        description={
          editing ? 'Update the details for this appointment.' : 'Schedule a new doctor visit.'
        }
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        size="md"
      >
        <AppointmentForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      </Modal>

      <RescheduleDialog
        open={rescheduleId !== null}
        appointment={rescheduleTarget}
        onCancel={() => setRescheduleId(null)}
        onConfirm={(date, time) => {
          if (rescheduleTarget) {
            onUpdate({ ...rescheduleTarget, date, time });
            notify('Appointment rescheduled.');
            setRescheduleId(null);
          }
        }}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete appointment?"
        message={
          deleteTarget ? (
            <>
              This will permanently remove the appointment with <strong>{deleteTarget.doctorName}</strong>.
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

function AppointmentRow({
  appointment,
  today,
  onEdit,
  onDelete,
  onCancel,
  onComplete,
  onReschedule,
}: {
  appointment: Appointment;
  today: string;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onComplete: () => void;
  onReschedule: () => void;
}) {
  const isPast = appointment.date < today;
  const isUpcoming = appointment.status === 'upcoming';
  const days = daysFromNow(appointment.date);

  return (
    <tr className="transition hover:bg-slate-50/60">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Stethoscope size={16} />
          </span>
          <div>
            <p className="font-semibold text-slate-900">{appointment.doctorName}</p>
            <p className="text-xs text-slate-500">{appointment.specialty}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="font-medium text-slate-700">{formatDate(appointment.date)}</p>
        <p className="text-xs text-slate-500">
          {formatTime(appointment.time)} ·{' '}
          {isUpcoming ? (
            <span className={days === 0 ? 'text-rose-600' : 'text-slate-500'}>
              {relativeDay(appointment.date)}
            </span>
          ) : (
            <span>{relativeDay(appointment.date)}</span>
          )}
        </p>
      </td>
      <td className="px-5 py-4 max-w-[220px]">
        <p className="truncate text-sm text-slate-600">
          {appointment.notes || <span className="text-slate-400">No notes</span>}
        </p>
      </td>
      <td className="px-5 py-4">
        <StatusBadge status={appointment.status} isPast={isPast} />
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1">
          {isUpcoming && !isPast && (
            <>
              <button
                onClick={onComplete}
                className="btn-ghost text-mint-700 hover:bg-mint-50"
                title="Mark completed"
              >
                <CheckCircle2 size={15} />
              </button>
              <button
                onClick={onReschedule}
                className="btn-ghost text-brand-600 hover:bg-brand-50"
                title="Reschedule"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={onCancel}
                className="btn-ghost text-amber-700 hover:bg-amber-50"
                title="Cancel appointment"
              >
                <CalendarX size={15} />
              </button>
            </>
          )}
          <button onClick={onEdit} className="btn-ghost text-slate-600 hover:bg-slate-100" title="Edit">
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

function StatusBadge({ status, isPast }: { status: AppointmentStatus; isPast: boolean }) {
  if (status === 'completed') {
    return <span className="chip bg-mint-100 text-mint-700"><CheckCircle2 size={12} /> Completed</span>;
  }
  if (status === 'cancelled') {
    return <span className="chip bg-slate-100 text-slate-500"><XCircle size={12} /> Cancelled</span>;
  }
  return (
    <span
      className={`chip ${
        isPast ? 'bg-amber-100 text-amber-700' : 'bg-brand-100 text-brand-700'
      }`}
    >
      <Clock size={12} /> {isPast ? 'Missed' : 'Upcoming'}
    </span>
  );
}

function RescheduleDialog({
  open,
  appointment,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  appointment: Appointment | null;
  onCancel: () => void;
  onConfirm: (date: string, time: string) => void;
}) {
  const [date, setDate] = useState(appointment?.date ?? todayISO());
  const [time, setTime] = useState(appointment?.time ?? '10:00');
  const [error, setError] = useState('');

  // Reset when opening with a new appointment
  useEffect(() => {
    if (open && appointment) {
      setDate(appointment.date);
      setTime(appointment.time);
      setError('');
    }
  }, [open, appointment]);

  const handleConfirm = () => {
    if (!date) return setError('Please choose a date.');
    if (date < todayISO()) return setError('Cannot reschedule to a past date.');
    if (!time) return setError('Please choose a time.');
    onConfirm(date, time);
  };

  if (!open || !appointment) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
      <div className="relative w-full max-w-md animate-scale-in rounded-2xl bg-white p-6 shadow-pop">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <RotateCcw size={22} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-slate-900">Reschedule appointment</h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Pick a new date and time for <strong>{appointment.doctorName}</strong>.
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-base">New date</label>
            <input
              type="date"
              className="input-base"
              min={todayISO()}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setError('');
              }}
            />
          </div>
          <div>
            <label className="label-base">New time</label>
            <input
              type="time"
              className="input-base"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                setError('');
              }}
            />
          </div>
        </div>
        {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn-primary">
            Confirm reschedule
          </button>
        </div>
      </div>
    </div>
  );
}
