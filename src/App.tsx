import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { HomePage } from './components/HomePage';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminLogin } from './components/admin/AdminLogin';
import { useVisitorTracking } from './lib/useVisitorTracking';

function Router() {
  const { isAdmin, loading } = useAuth();
  const [route, setRoute] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handler = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  useVisitorTracking(route === '#/admin' ? '/admin' : '/');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-400">Se încarcă...</div>
      </div>
    );
  }

  if (route === '#/admin') {
    if (!isAdmin) return <AdminLogin />;
    return <AdminPanel />;
  }

  return <HomePage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
