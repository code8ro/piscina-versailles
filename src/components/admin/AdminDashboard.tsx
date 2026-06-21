import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import type { Lounger, Reservation, ScheduleDay, ClosedDay } from '../../lib/types';
import { getLoungerStatusForDate, formatTime } from '../../lib/data';
import { DAY_NAMES } from '../../lib/types';
import {
  Users,
  Armchair,
  CalendarDays,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
  Plus,
  Trash2,
  User,
  Phone,
  FileText,
  Lock,
  Eye,
  UserCheck,
  LogOut
} from 'lucide-react';

interface VisitorStats {
  today: number;
  week: number;
  month: number;
  total: number;
  uniqueTotal: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalLoungers: 0,
    activeLoungers: 0,
    totalReservations: 0,
    todayReservations: 0,
    weekReservations: 0,
    monthReservations: 0,
  });

  const [loungers, setLoungers] = useState<Lounger[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [closedDays, setClosedDays] = useState<ClosedDay[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLounger, setSelectedLounger] = useState<number | null>(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [visitorStats, setVisitorStats] = useState<VisitorStats>({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    uniqueTotal: 0
  });

  useEffect(() => {
    loadAll();
    loadVisitorStats();
  }, []);

  useEffect(() => {
    loadDateData();
  }, [selectedDate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const loadAll = async () => {
    try {
      const { data: lData } = await supabase.from('loungers').select('*').order('sort_order');
      const { data: sData } = await supabase.from('schedule').select('*').order('day_of_week');
      const { data: allRes } = await supabase.from('reservations').select('*');

      setLoungers(lData || []);
      setSchedule(sData || []);

      const activeLoungers = (lData || []).filter((l: Lounger) => l.is_active);
      const today = new Date().toISOString().split('T')[0];

      setStats({
        totalLoungers: lData?.length || 0,
        activeLoungers: activeLoungers.length,
        totalReservations: allRes?.length || 0,
        todayReservations: (allRes || []).filter((r: Reservation) => r.date === today).length,
        weekReservations: (allRes || []).length,
        monthReservations: (allRes || []).length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadVisitorStats = async () => {
    const now = new Date();

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    const monthStart = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1
    ));

    const [
      { count: todayCount },
      { count: weekCount },
      { count: monthCount },
      { count: totalCount },
      { data: uniqueData }
    ] = await Promise.all([
      supabase.from('visitor_stats')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString()),

      supabase.from('visitor_stats')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString()),

      supabase.from('visitor_stats')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString()),

      supabase.from('visitor_stats')
        .select('*', { count: 'exact', head: true }),

      supabase.from('visitor_stats')
        .select('visitor_id')
    ]);

    const uniqueTotal = new Set((uniqueData || []).map((r) => r.visitor_id)).size;

    setVisitorStats({
      today: todayCount || 0,
      week: weekCount || 0,
      month: monthCount || 0,
      total: totalCount || 0,
      uniqueTotal,
    });
  };

  const loadDateData = async () => {
    const [{ data: rData }, { data: cdData }] = await Promise.all([
      supabase.from('reservations').select('*').eq('date', selectedDate).order('start_time'),
      supabase.from('closed_days').select('*').eq('date', selectedDate),
    ]);

    setReservations(rData || []);
    setClosedDays(cdData || []);
  };

  const isClosed = false;

  if (loading) return <div className="py-20 text-center text-slate-400">Se încarcă...</div>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      {/* LOUNGERS (SUS) */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border">
        <h3 className="font-semibold mb-4">Sezlonguri</h3>
        <div className="grid grid-cols-6 gap-3">
          {loungers.map((l) => (
            <div key={l.id} className="rounded-lg border p-2 text-center">
              {l.number}
            </div>
          ))}
        </div>
      </div>

      {/* VISITOR STATS (SUB LOUNGERS) */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-violet-500" />
          Statistici Vizitatori
        </h3>

        <div className="grid grid-cols-5 gap-3 text-center">
          <div>
            <div className="text-xl font-bold">{visitorStats.today}</div>
            <div className="text-xs">Azi</div>
          </div>
          <div>
            <div className="text-xl font-bold">{visitorStats.week}</div>
            <div className="text-xs">7 zile</div>
          </div>
          <div>
            <div className="text-xl font-bold">{visitorStats.month}</div>
            <div className="text-xs">Lună</div>
          </div>
          <div>
            <div className="text-xl font-bold">{visitorStats.total}</div>
            <div className="text-xs">Total</div>
          </div>
          <div>
            <div className="text-xl font-bold text-violet-600">{visitorStats.uniqueTotal}</div>
            <div className="text-xs">Unici</div>
          </div>
        </div>
      </div>

    </div>
  );
}
