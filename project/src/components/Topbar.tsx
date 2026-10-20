import { Menu, CalendarClock, Plus } from 'lucide-react';
import type { ViewKey } from './Sidebar';
import { NAV_ITEMS } from './Sidebar';

interface TopbarProps {
  current: ViewKey;
  onOpenSidebar: () => void;
  onQuickAdd: () => void;
  userName: string;
  onLogout: () => void;
}

export default function Topbar({ current, onOpenSidebar, onQuickAdd, userName, onLogout }: TopbarProps) {
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
          <span className="hidden max-w-32 truncate text-sm font-medium text-slate-600 sm:inline">{userName}</span>
          <button onClick={onLogout} className="rounded-lg px-2.5 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">Log out</button>
        </div>
      </div>
    </header>
  );
}
