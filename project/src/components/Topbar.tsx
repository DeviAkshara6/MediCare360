import { Menu, CalendarClock, Plus } from 'lucide-react';
import type { ViewKey } from './Sidebar';
import { NAV_ITEMS } from './Sidebar';

interface TopbarProps {
  current: ViewKey;
  onOpenSidebar: () => void;
  onQuickAdd: () => void;
}

export default function Topbar({ current, onOpenSidebar, onQuickAdd }: TopbarProps) {
  const item = NAV_ITEMS.find((n) => n.key === current);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
              {item?.label ?? 'Dashboard'}
            </h2>
            <p className="hidden text-xs text-slate-500 sm:flex sm:items-center sm:gap-1.5">
              <CalendarClock size={12} />
              {today}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onQuickAdd} className="btn-primary hidden sm:inline-flex">
            <Plus size={16} />
            Quick Add
          </button>
          <button onClick={onQuickAdd} className="btn-primary sm:hidden" aria-label="Quick add">
            <Plus size={18} />
          </button>
          <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-brand-600 text-sm font-bold text-white sm:flex">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
