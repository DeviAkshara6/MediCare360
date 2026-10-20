import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pill, CalendarDays, FlaskConical, ArrowRight } from 'lucide-react';
import type { AppData, Medicine, Appointment, LabRecord, DoseStatus, AppointmentStatus } from '@/types';
import AuthPage from '@/components/AuthPage';
import { api, getAuthUser, type AuthUser } from '@/lib/api';
import Sidebar, { NAV_ITEMS } from '@/components/Sidebar';
import type { ViewKey } from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Modal from '@/components/Modal';
import { ToastProvider } from '@/components/Toast';
import Dashboard from '@/views/Dashboard';
import MedicinesView from '@/views/medicines/MedicinesView';
import AppointmentsView from '@/views/appointments/AppointmentsView';
import LabsView from '@/views/labs/LabsView';

function App() {
  return (
    <ToastProvider>
      <AuthenticatedApp />
    </ToastProvider>
  );
}

function AuthenticatedApp() {
  const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());
  useEffect(() => {
    const expire = () => setUser(null);
    window.addEventListener('medicare360:auth-expired', expire);
    return () => window.removeEventListener('medicare360:auth-expired', expire);
  }, []);
  if (!user) return <AuthPage onAuthenticated={() => setUser(getAuthUser())} />;
  return <AppShell user={user} onLogout={() => { api.logout(); setUser(null); }} />;
}

function AppShell({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [data, setData] = useState<AppData>({ medicines: [], appointments: [], labRecords: [], seeded: true });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [view, setView] = useState<ViewKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [openAddOnMount, setOpenAddOnMount] = useState(false);

  useEffect(() => {
    api.loadData()
      .then(setData)
      .catch((error: Error) => setLoadError(error.message))
      .finally(() => setLoading(false));
  }, []);

  const navigate = useCallback((v: ViewKey) => {
    setView(v);
    setSidebarOpen(false);
    setOpenAddOnMount(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ---- Medicine handlers ----
  const addMedicine = async (m: Medicine) => {
    const saved = await api.createMedicine(m);
    setData((d) => ({ ...d, medicines: [saved, ...d.medicines] }));
  };
  const updateMedicine = async (m: Medicine) => {
    const saved = await api.updateMedicine(m);
    setData((d) => ({ ...d, medicines: d.medicines.map((x) => (x.id === m.id ? saved : x)) }));
  };
  const deleteMedicine = async (id: string) => {
    await api.deleteMedicine(id);
    setData((d) => ({ ...d, medicines: d.medicines.filter((x) => x.id !== id) }));
  };
  const setMedicineStatus = async (id: string, status: DoseStatus) => {
    const medicine = data.medicines.find((item) => item.id === id);
    if (!medicine) return;
    const saved = await api.updateMedicine({ ...medicine, status });
    setData((d) => ({ ...d, medicines: d.medicines.map((x) => (x.id === id ? saved : x)) }));
  };

  // ---- Appointment handlers ----
  const addAppointment = async (a: Appointment) => {
    const saved = await api.createAppointment(a);
    setData((d) => ({ ...d, appointments: [saved, ...d.appointments] }));
  };
  const updateAppointment = async (a: Appointment) => {
    const saved = await api.updateAppointment(a);
    setData((d) => ({ ...d, appointments: d.appointments.map((x) => (x.id === a.id ? saved : x)) }));
  };
  const deleteAppointment = async (id: string) => {
    await api.deleteAppointment(id);
    setData((d) => ({ ...d, appointments: d.appointments.filter((x) => x.id !== id) }));
  };
  const setAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    const appointment = data.appointments.find((item) => item.id === id);
    if (!appointment) return;
    const saved = await api.updateAppointment({ ...appointment, status });
    setData((d) => ({ ...d, appointments: d.appointments.map((x) => (x.id === id ? saved : x)) }));
  };

  // ---- Lab handlers ----
  const addLab = async (r: LabRecord) => {
    const saved = await api.createLab(r);
    setData((d) => ({ ...d, labRecords: [saved, ...d.labRecords] }));
  };
  const updateLab = async (r: LabRecord) => {
    const saved = await api.updateLab(r);
    setData((d) => ({ ...d, labRecords: d.labRecords.map((x) => (x.id === r.id ? saved : x)) }));
  };
  const deleteLab = async (id: string) => {
    await api.deleteLab(id);
    setData((d) => ({ ...d, labRecords: d.labRecords.filter((x) => x.id !== id) }));
  };

  const handleQuickAdd = (target: ViewKey) => {
    setQuickAddOpen(false);
    setOpenAddOnMount(true);
    navigate(target);
  };

  const openQuickAddFromTopbar = () => setQuickAddOpen(true);

  const title = useMemo(() => NAV_ITEMS.find((n) => n.key === view)?.label ?? 'Dashboard', [view]);

  return (
    <div className="min-h-screen bg-slate-50">
      {loadError && <div className="mx-auto max-w-6xl px-4 pt-4 text-sm text-rose-600">Backend connection failed: {loadError}</div>}
      {loading && <div className="mx-auto max-w-6xl px-4 pt-4 text-sm text-slate-500">Loading your MediCare360 data...</div>}
      <Sidebar
        current={view}
        onNavigate={navigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <Topbar
          current={view}
          onOpenSidebar={() => setSidebarOpen(true)}
          onQuickAdd={openQuickAddFromTopbar}
          userName={user.fullName}
          onLogout={onLogout}
        />

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div key={view} className="animate-fade-in">
            {view === 'dashboard' && (
              <Dashboard
                data={data}
                onNavigate={navigate}
                onToggleDose={setMedicineStatus}
                onQuickAdd={(v) => handleQuickAdd(v)}
              />
            )}
            {view === 'medicines' && (
              <MedicinesView
                medicines={data.medicines}
                onAdd={addMedicine}
                onUpdate={updateMedicine}
                onDelete={deleteMedicine}
                onStatusChange={setMedicineStatus}
                openAddOnMount={openAddOnMount}
              />
            )}
            {view === 'appointments' && (
              <AppointmentsView
                appointments={data.appointments}
                onAdd={addAppointment}
                onUpdate={updateAppointment}
                onDelete={deleteAppointment}
                onStatusChange={setAppointmentStatus}
                openAddOnMount={openAddOnMount}
              />
            )}
            {view === 'labs' && (
              <LabsView
                labRecords={data.labRecords}
                onAdd={addLab}
                onUpdate={updateLab}
                onDelete={deleteLab}
                openAddOnMount={openAddOnMount}
              />
            )}
          </div>

          <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
            <p>
              MediCare360 — Personal Healthcare Management · A college demo project.
            </p>
            <p className="mt-1">
              This app does not provide medical advice and does not confirm real clinic bookings.
            </p>
          </footer>
        </main>
      </div>

      <Modal
        open={quickAddOpen}
        title="Quick add"
        description="Choose what you'd like to add right now."
        onClose={() => setQuickAddOpen(false)}
        size="sm"
      >
        <div className="space-y-2">
          <QuickAddOption
            icon={<Pill size={18} />}
            label="Add a medicine reminder"
            onClick={() => handleQuickAdd('medicines')}
          />
          <QuickAddOption
            icon={<CalendarDays size={18} />}
            label="Book an appointment"
            onClick={() => handleQuickAdd('appointments')}
          />
          <QuickAddOption
            icon={<FlaskConical size={18} />}
            label="Add a lab record"
            onClick={() => handleQuickAdd('labs')}
          />
          <button
            onClick={() => setQuickAddOpen(false)}
            className="mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </Modal>

      <span className="sr-only">{title}</span>
    </div>
  );
}

function QuickAddOption({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/40"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-50 to-brand-50 text-teal-600 transition group-hover:from-teal-500 group-hover:to-brand-600 group-hover:text-white">
        {icon}
      </span>
      <span className="flex-1 text-sm font-semibold text-slate-800">{label}</span>
      <ArrowRight size={16} className="text-slate-300 transition group-hover:text-teal-600" />
    </button>
  );
}

export default App;
