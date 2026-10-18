import { useMemo } from 'react';
import {
  Pill,
  CalendarDays,
  FlaskConical,
  CheckCircle2,
  Clock,
  Activity,
  ArrowRight,
  Plus,
  Bell,
} from 'lucide-react';
import type { AppData, Medicine, Appointment } from '@/types';
import type { ViewKey } from '@/components/Sidebar';
import EmptyState from '@/components/EmptyState';
import { formatDate, formatTime, isDateInRange, relativeDay, daysFromNow } from '@/lib/dates';

interface DashboardProps {
  data: AppData;
  onNavigate: (view: ViewKey) => void;
  onToggleDose: (id: string, status: 'taken' | 'skipped') => void;
  onQuickAdd: (view: ViewKey) => void;
}

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  accent: 'teal' | 'brand' | 'mint';
}

function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  const accents: Record<string, string> = {
    teal: 'from-teal-500 to-teal-600',
    brand: 'from-brand-500 to-brand-600',
    mint: 'from-mint-500 to-mint-600',
  };
  return (
    <div className="card relative overflow-hidden p-5 transition hover:shadow-pop">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs font-medium text-slate-400">{sub}</p>}
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accents[accent]} text-white shadow-sm`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ data, onNavigate, onToggleDose, onQuickAdd }: DashboardProps) {
  const todaysMedicines = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return data.medicines
      .filter((m) => isDateInRange(today, m.startDate, m.endDate))
      .sort((a, b) => a.reminderTime.localeCompare(b.reminderTime));
  }, [data.medicines]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return data.appointments
      .filter((a) => a.status === 'upcoming' && a.date >= today)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, 4);
  }, [data.appointments]);

  const takenToday = todaysMedicines.filter((m) => m.status === 'taken').length;
  const pendingToday = todaysMedicines.filter((m) => m.status === 'pending').length;
  const nextAppointment = upcomingAppointments[0];

  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-600 to-brand-700 p-6 text-white shadow-card sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 right-24 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <Activity size={13} /> Personal Healthcare Management
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back to MediCare360
          </h1>
          <p className="mt-2 max-w-xl text-sm text-teal-50/90">
            Track your medicines, manage appointments, and keep lab records organized — all in one
            clean, easy-to-use dashboard.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('medicines')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50"
            >
              <Pill size={16} /> Manage Medicines
            </button>
            <button
              onClick={() => onNavigate('appointments')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/25"
            >
              <CalendarDays size={16} /> Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's Medicines"
          value={todaysMedicines.length}
          sub={`${takenToday} taken · ${pendingToday} pending`}
          icon={<Pill size={22} />}
          accent="teal"
        />
        <StatCard
          label="Upcoming Appointments"
          value={upcomingAppointments.length}
          sub={nextAppointment ? `Next: ${relativeDay(nextAppointment.date)}` : 'None scheduled'}
          icon={<CalendarDays size={22} />}
          accent="brand"
        />
        <StatCard
          label="Lab Records"
          value={data.labRecords.length}
          sub="Saved test reports"
          icon={<FlaskConical size={22} />}
          accent="mint"
        />
        <StatCard
          label="Dose Adherence"
          value={todaysMedicines.length ? `${Math.round((takenToday / todaysMedicines.length) * 100)}%` : '—'}
          sub="Taken today"
          icon={<CheckCircle2 size={22} />}
          accent="teal"
        />
      </div>

      {/* Quick actions */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
        <p className="mt-0.5 text-sm text-slate-500">Jump straight into any module.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <QuickAction
            label="Add Medicine"
            description="Set a new reminder"
            icon={<Pill size={20} />}
            onClick={() => onQuickAdd('medicines')}
          />
          <QuickAction
            label="Book Appointment"
            description="Schedule a doctor visit"
            icon={<CalendarDays size={20} />}
            onClick={() => onQuickAdd('appointments')}
          />
          <QuickAction
            label="Add Lab Record"
            description="Save a test report"
            icon={<FlaskConical size={20} />}
            onClick={() => onQuickAdd('labs')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's medicines */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                <Bell size={18} />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Today's Reminders</h2>
                <p className="text-xs text-slate-500">Doses scheduled for today</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('medicines')}
              className="btn-ghost text-teal-600 hover:bg-teal-50 hover:text-teal-700"
            >
              View all <ArrowRight size={15} />
            </button>
          </div>
          <div className="flex-1">
            {todaysMedicines.length === 0 ? (
              <EmptyState
                icon={<Pill size={28} />}
                title="No medicines due today"
                description="Add a medicine with today's date in its schedule to see reminders here."
                action={
                  <button onClick={() => onQuickAdd('medicines')} className="btn-primary">
                    <Plus size={16} /> Add Medicine
                  </button>
                }
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {todaysMedicines.map((m) => (
                  <MedicineRow key={m.id} medicine={m} onToggle={onToggleDose} />
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <CalendarDays size={18} />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Upcoming Appointments</h2>
                <p className="text-xs text-slate-500">Next doctor visits</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="btn-ghost text-brand-600 hover:bg-brand-50 hover:text-brand-700"
            >
              View all <ArrowRight size={15} />
            </button>
          </div>
          <div className="flex-1">
            {upcomingAppointments.length === 0 ? (
              <EmptyState
                icon={<CalendarDays size={28} />}
                title="No upcoming appointments"
                description="Book your next doctor visit to keep your schedule organized."
                action={
                  <button onClick={() => onQuickAdd('appointments')} className="btn-primary">
                    <Plus size={16} /> Book Appointment
                  </button>
                }
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcomingAppointments.map((a) => (
                  <AppointmentRow key={a.id} appointment={a} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  label,
  description,
  icon,
  onClick,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/40 hover:shadow-soft"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-brand-50 text-teal-600 transition group-hover:from-teal-500 group-hover:to-brand-600 group-hover:text-white">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="block text-xs text-slate-500">{description}</span>
      </span>
      <ArrowRight size={16} className="text-slate-300 transition group-hover:text-teal-600" />
    </button>
  );
}

function MedicineRow({
  medicine,
  onToggle,
}: {
  medicine: Medicine;
  onToggle: (id: string, status: 'taken' | 'skipped') => void;
}) {
  const status = medicine.status;
  return (
    <li className="flex items-center gap-3 px-5 py-3.5">
      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-teal-50 text-teal-700">
        <Clock size={14} />
        <span className="mt-0.5 text-[10px] font-bold">{formatTime(medicine.reminderTime)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{medicine.name}</p>
        <p className="truncate text-xs text-slate-500">
          {medicine.dosage} · {medicine.instructions}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={() => onToggle(medicine.id, 'taken')}
          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
            status === 'taken'
              ? 'bg-mint-100 text-mint-700'
              : 'text-slate-500 hover:bg-mint-50 hover:text-mint-700'
          }`}
          aria-label="Mark as taken"
        >
          <CheckCircle2 size={14} /> Taken
        </button>
        <button
          onClick={() => onToggle(medicine.id, 'skipped')}
          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
            status === 'skipped'
              ? 'bg-amber-100 text-amber-700'
              : 'text-slate-500 hover:bg-amber-50 hover:text-amber-700'
          }`}
          aria-label="Mark as skipped"
        >
          Skip
        </button>
      </div>
    </li>
  );
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const days = daysFromNow(appointment.date);
  return (
    <li className="flex items-center gap-3 px-5 py-3.5">
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <span className="text-[10px] font-semibold uppercase">
          {formatDate(appointment.date).split(' ')[0]}
        </span>
        <span className="text-base font-bold leading-none">
          {appointment.date.split('-')[2]}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{appointment.doctorName}</p>
        <p className="truncate text-xs text-slate-500">
          {appointment.specialty} · {formatTime(appointment.time)}
        </p>
      </div>
      <span
        className={`chip ${
          days === 0
            ? 'bg-rose-50 text-rose-600'
            : days <= 3
              ? 'bg-amber-50 text-amber-700'
              : 'bg-slate-100 text-slate-600'
        }`}
      >
        {relativeDay(appointment.date)}
      </span>
    </li>
  );
}
