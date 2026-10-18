import { LayoutDashboard, Pill, CalendarDays, FlaskConical, HeartPulse, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ViewKey = 'dashboard' | 'medicines' | 'appointments' | 'labs';

export interface NavItem {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview & quick actions',
  },
  {
    key: 'medicines',
    label: 'Medicine Reminders',
    icon: Pill,
    description: 'Track your daily doses',
  },
  {
    key: 'appointments',
    label: 'Appointments',
    icon: CalendarDays,
    description: 'Book & manage visits',
  },
  {
    key: 'labs',
    label: 'Lab Records',
    icon: FlaskConical,
    description: 'Test reports & history',
  },
];

interface SidebarProps {
  current: ViewKey;
  onNavigate: (view: ViewKey) => void;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ current, onNavigate, open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-brand-600 text-white shadow-sm">
              <HeartPulse size={22} />
            </div>
            <div>
              <p className="text-base font-bold leading-tight text-slate-900">MediCare360</p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-teal-600">
                Healthcare Hub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = current === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  active
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                    active
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  <Icon size={18} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="block text-xs text-slate-400">{item.description}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 px-4 py-4">
          <div className="rounded-xl bg-gradient-to-br from-teal-50 to-brand-50 p-4">
            <p className="text-xs font-semibold text-teal-700">Health Tip</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Keep your medicines visible and take them at the same time each day for best results.
            </p>
          </div>
          <p className="mt-3 px-1 text-[11px] text-slate-400">
            Demo project · Not a substitute for medical advice.
          </p>
        </div>
      </aside>
    </>
  );
}
