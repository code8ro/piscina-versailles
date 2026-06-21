import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { AdminDashboard } from './AdminDashboard';
import { AdminReservations } from './AdminReservations';
import { AdminLoungers } from './AdminLoungers';
import { AdminSchedule } from './AdminSchedule';
import { AdminSettings } from './AdminSettings';
import { AdminCustomers } from './AdminCustomers';
import { LayoutDashboard, CalendarCheck, Armchair, Clock, Settings, LogOut, Waves, Menu, X, Users } from 'lucide-react';

type Tab = 'dashboard' | 'reservations' | 'loungers' | 'schedule' | 'customers' | 'settings';

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reservations', label: 'Rezervări', icon: CalendarCheck },
  { id: 'loungers', label: 'Sezlonguri', icon: Armchair },
  { id: 'schedule', label: 'Program', icon: Clock },
  { id: 'customers', label: 'Clienți', icon: Users },
  { id: 'settings', label: 'Setări', icon: Settings },
];

export function AdminPanel() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard />;
      case 'reservations': return <AdminReservations />;
      case 'loungers': return <AdminLoungers />;
      case 'schedule': return <AdminSchedule />;
      case 'customers': return <AdminCustomers />;
      case 'settings': return <AdminSettings />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Waves className="h-6 w-6 text-sky-500" />
                <span className="text-lg font-bold text-slate-800">Pool Admin</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  activeTab === t.id ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <t.icon className="h-5 w-5" />
                {t.label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-slate-100">
            <button onClick={logout} className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="h-5 w-5" />
              Deconectare
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar for mobile */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-slate-100">
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          <span className="font-semibold text-slate-800 flex items-center gap-2">
            <Waves className="h-5 w-5 text-sky-500" />
            Pool Admin
          </span>
        </div>
        <main className="p-4 md:p-8 max-w-5xl">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
