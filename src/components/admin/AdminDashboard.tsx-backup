import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import type { Lounger, Reservation, ScheduleDay, ClosedDay } from '../../lib/types';
import { getLoungerStatusForDate, formatTime } from '../../lib/data';
import { DAY_NAMES } from '../../lib/types';
import { Users, Armchair, CalendarDays, TrendingUp, ChevronLeft, ChevronRight, Clock, X, Plus, Trash2, User, Phone, FileText, Lock, Eye, UserCheck } from 'lucide-react';

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
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({ today: 0, week: 0, month: 0, total: 0, uniqueTotal: 0 });

  useEffect(() => {
    loadAll();
    loadVisitorStats();
  }, []);

  useEffect(() => {
    loadDateData();
  }, [selectedDate]);

  const loadAll = async () => {
    try {
      const { data: lData } = await supabase.from('loungers').select('*').order('sort_order');
      const { data: sData } = await supabase.from('schedule').select('*').order('day_of_week');
      const { data: allRes } = await supabase.from('reservations').select('*');

      setLoungers(lData || []);
      setSchedule(sData || []);

      const activeLoungers = (lData || []).filter((l: Lounger) => l.is_active);
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const monthStart = today.substring(0, 7) + '-01';

      setStats({
        totalLoungers: lData?.length || 0,
        activeLoungers: activeLoungers.length,
        totalReservations: allRes?.length || 0,
        todayReservations: (allRes || []).filter((r: Reservation) => r.date === today).length,
        weekReservations: (allRes || []).filter((r: Reservation) => r.date >= weekStartStr).length,
        monthReservations: (allRes || []).filter((r: Reservation) => r.date >= monthStart).length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadVisitorStats = async () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
    const monthStart = todayStr.substring(0, 7) + '-01';

    const [{ count: todayCount }, { count: weekCount }, { count: monthCount }, { count: totalCount }, { data: uniqueData }] = await Promise.all([
      supabase.from('visitor_stats').select('*', { count: 'exact', head: true }).gte('created_at', todayStr + 'T00:00:00Z'),
      supabase.from('visitor_stats').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
      supabase.from('visitor_stats').select('*', { count: 'exact', head: true }).gte('created_at', monthStart + 'T00:00:00Z'),
      supabase.from('visitor_stats').select('*', { count: 'exact', head: true }),
      supabase.from('visitor_stats').select('visitor_id'),
    ]);

    const uniqueTotal = new Set((uniqueData || []).map((r: { visitor_id: string }) => r.visitor_id)).size;

    setVisitorStats({
      today: todayCount || 0,
      week: weekCount || 0,
      month: monthCount || 0,
      total: totalCount || 0,
      uniqueTotal,
    });
  };

  const loadDateData = async () => {
    try {
      const [{ data: rData }, { data: cdData }] = await Promise.all([
        supabase.from('reservations').select('*').eq('date', selectedDate).order('start_time'),
        supabase.from('closed_days').select('*').eq('date', selectedDate),
      ]);
      setReservations(rData || []);
      setClosedDays(cdData || []);
    } catch (e) {
      console.error(e);
    }
  };

  const scheduleMap = useMemo(() => {
    const map = new Map<number, ScheduleDay>();
    schedule.forEach((s) => map.set(s.day_of_week, s));
    return map;
  }, [schedule]);

  const selectedDaySchedule = useMemo(() => {
    const d = new Date(selectedDate);
    return scheduleMap.get(d.getDay());
  }, [selectedDate, scheduleMap]);

  const isClosed = closedDays.some((cd) => cd.date === selectedDate) || (selectedDaySchedule?.is_closed ?? false);

  const navigateDate = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
    setSelectedLounger(null);
  };

  const d = new Date(selectedDate);
  const dateLabel = `${d.getDate()} ${['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} ${d.getFullYear()}`;
  const dayName = DAY_NAMES[d.getDay()];

  const activeLoungers = loungers.filter((l) => l.is_active);
  const dateReservations = reservations.filter((r) => r.date === selectedDate);

  const handleLoungerClick = (id: number) => {
    const loungerRes = dateReservations.filter((r) => r.lounger_id === id);
    if (loungerRes.length > 0) {
      setSelectedLounger(id);
    } else {
      setSelectedLounger(id);
      setShowReserveModal(true);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-400">Se încarcă...</div>;

  const cards = [
    { icon: Armchair, label: 'Sezlonguri active', value: stats.activeLoungers, color: 'bg-emerald-100 text-emerald-600' },
    { icon: CalendarDays, label: 'Rezervări azi', value: stats.todayReservations, color: 'bg-sky-100 text-sky-600' },
    { icon: TrendingUp, label: 'Rezervări săptămâna', value: stats.weekReservations, color: 'bg-amber-100 text-amber-600' },
    { icon: Users, label: 'Rezervări luna', value: stats.monthReservations, color: 'bg-rose-100 text-rose-600' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
            <div className={`inline-flex rounded-xl p-2.5 ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="mt-3 text-3xl font-bold text-slate-800">{card.value}</div>
            <div className="text-sm text-slate-500">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Visitor Stats */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="inline-flex rounded-xl bg-violet-100 p-2.5 text-violet-600">
            <Eye className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-slate-800">Statistici Vizitatori</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
            <div className="text-2xl font-bold text-slate-800">{visitorStats.today}</div>
            <div className="text-xs text-slate-500 mt-0.5">Azi</div>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
            <div className="text-2xl font-bold text-slate-800">{visitorStats.week}</div>
            <div className="text-xs text-slate-500 mt-0.5">Ultimele 7 zile</div>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
            <div className="text-2xl font-bold text-slate-800">{visitorStats.month}</div>
            <div className="text-xs text-slate-500 mt-0.5">Luna curentă</div>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
            <div className="text-2xl font-bold text-slate-800">{visitorStats.total}</div>
            <div className="text-xs text-slate-500 mt-0.5">Total vizite</div>
          </div>
          <div className="rounded-xl bg-violet-50 border border-violet-100 p-3 text-center col-span-2 sm:col-span-1">
            <div className="flex items-center justify-center gap-1">
              <UserCheck className="h-4 w-4 text-violet-500" />
              <div className="text-2xl font-bold text-violet-700">{visitorStats.uniqueTotal}</div>
            </div>
            <div className="text-xs text-violet-500 mt-0.5">Unici total</div>
          </div>
        </div>
      </div>

      {/* Date navigator */}
      <div className="flex items-center justify-center gap-4 rounded-2xl bg-white px-5 py-3 shadow-sm border border-slate-100">
        <button onClick={() => navigateDate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100">
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div className="text-center min-w-[180px]">
          <span className="font-semibold text-slate-800">{dayName}, {dateLabel}</span>
          {!isClosed && selectedDaySchedule && (
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mt-0.5">
              <Clock className="h-3 w-3" />
              {formatTime(selectedDaySchedule.open_time)} - {formatTime(selectedDaySchedule.close_time)}
            </div>
          )}
          {isClosed && <div className="text-xs text-red-500 mt-0.5">Inchis</div>}
        </div>
        <button onClick={() => navigateDate(1)} className="p-1.5 rounded-lg hover:bg-slate-100">
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </button>
        <button onClick={() => { setSelectedDate(new Date().toISOString().split('T')[0]); setSelectedLounger(null); }} className="text-xs text-sky-500 hover:underline ml-1">Azi</button>
      </div>

      {/* Lounger grid */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Sezlonguri</h3>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Liber</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Rezervat</span>
          </div>
        </div>

        {isClosed ? (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-600 font-medium">Zi închisă</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-10">
            {activeLoungers.map((lounger) => {
              const status = getLoungerStatusForDate(reservations, lounger.id, selectedDate);
              const isReserved = status === 'reserved';
              const isSelected = selectedLounger === lounger.id;

              let bgColor = 'bg-emerald-50';
              let borderColor = 'border-emerald-300';
              let textColor = 'text-emerald-700';
              let statusDot = 'bg-emerald-500';
              let hoverClass = 'hover:border-emerald-400 hover:shadow-md cursor-pointer';

              if (isReserved) {
                bgColor = 'bg-red-50';
                borderColor = 'border-red-300';
                textColor = 'text-red-700';
                statusDot = 'bg-red-500';
                hoverClass = 'hover:border-red-400 hover:shadow-md cursor-pointer';
              }

              if (isSelected) {
                bgColor = 'bg-sky-50';
                borderColor = 'border-sky-400';
                textColor = 'text-sky-700';
                statusDot = 'bg-sky-500';
                hoverClass = '';
              }

              return (
                <button
                  key={lounger.id}
                  onClick={() => handleLoungerClick(lounger.id)}
                  className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all duration-200 ${bgColor} ${borderColor} ${textColor} ${hoverClass} ${isSelected ? 'ring-2 ring-sky-300 shadow-lg scale-105' : ''}`}
                >
                  <span className={`mb-1 h-2.5 w-2.5 rounded-full ${statusDot}`} />
                  <span className="text-lg font-bold">{lounger.number}</span>
                  {lounger.label && <span className="text-[10px] opacity-70 truncate max-w-full">{lounger.label}</span>}
                  <svg viewBox="0 0 40 20" className="mt-1 h-5 w-10 opacity-30" fill="currentColor">
                    <rect x="0" y="6" width="28" height="8" rx="3" />
                    <rect x="28" y="4" width="8" height="12" rx="2" />
                    <rect x="2" y="14" width="4" height="4" rx="1" />
                    <rect x="22" y="14" width="4" height="4" rx="1" />
                  </svg>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected lounger details / release option */}
      {selectedLounger && !showReserveModal && (() => {
        const lounger = loungers.find((l) => l.id === selectedLounger);
        if (!lounger) return null;
        const loungerRes = dateReservations.filter((r) => r.lounger_id === lounger.id);

        return (
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Sezlong #{lounger.number} {lounger.label ? `- ${lounger.label}` : ''}</h3>
              <div className="flex gap-2">
                {loungerRes.length === 0 && (
                  <button onClick={() => setShowReserveModal(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-600 transition-colors">
                    <Plus className="h-3.5 w-3.5" /> Rezervă
                  </button>
                )}
                <button onClick={() => setSelectedLounger(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {loungerRes.length === 0 ? (
              <p className="text-sm text-emerald-600 font-medium">Liber — click "Rezervă" pentru a adăuga</p>
            ) : (
              <div className="space-y-2">
                {loungerRes.map((res) => (
                  <div key={res.id} className="rounded-lg bg-slate-50 border border-slate-100 p-3 flex items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(res.start_time)} - {formatTime(res.end_time)}
                      </div>
                      {res.customer_name && (
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <User className="h-3.5 w-3.5" /> {res.customer_name}
                        </div>
                      )}
                      {res.customer_phone && (
                        <a href={`tel:${res.customer_phone}`} className="flex items-center gap-1 text-sm text-sky-600 hover:underline">
                          <Phone className="h-3.5 w-3.5" /> {res.customer_phone}
                        </a>
                      )}
                      {res.notes && (
                        <div className="flex items-start gap-1 text-sm text-slate-400">
                          <FileText className="h-3.5 w-3.5 mt-0.5" /> {res.notes}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm('Eliberezi această rezervare?')) return;
                        await supabase.from('reservations').delete().eq('id', res.id);
                        loadDateData();
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      title="Eliberează"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setShowReserveModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 text-sky-600 px-3 py-1.5 text-xs font-medium hover:bg-sky-50 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Adaugă alt interval
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* Reserve modal */}
      {showReserveModal && selectedLounger && (
        <ReserveModal
          lounger={loungers.find((l) => l.id === selectedLounger)!}
          date={selectedDate}
          openTime={selectedDaySchedule?.open_time ?? '09:00'}
          closeTime={selectedDaySchedule?.close_time ?? '18:00'}
          existingReservations={dateReservations.filter((r) => r.lounger_id === selectedLounger)}
          onClose={() => setShowReserveModal(false)}
          onSaved={() => { setShowReserveModal(false); loadDateData(); loadAll(); }}
        />
      )}
    </div>
  );
}

function ReserveModal({ lounger, date, openTime, closeTime, existingReservations, onClose, onSaved }: {
  lounger: Lounger;
  date: string;
  openTime: string;
  closeTime: string;
  existingReservations: Reservation[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [startTime, setStartTime] = useState(openTime);
  const [endTime, setEndTime] = useState(closeTime);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    if (startTime >= endTime) {
      setError('Ora de început trebuie să fie înainte de ora de sfârșit');
      setSaving(false);
      return;
    }
    const overlap = existingReservations.find((r) => r.start_time < endTime && r.end_time > startTime);
    if (overlap) {
      setError(`Suprapunere cu rezervarea existentă (${formatTime(overlap.start_time)} - ${formatTime(overlap.end_time)})`);
      setSaving(false);
      return;
    }
    try {
      const { error: e } = await supabase.from('reservations').insert({
        lounger_id: lounger.id,
        date,
        start_time: startTime,
        end_time: endTime,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        notes: notes || null,
      });
      if (e) throw e;

      // Auto-save customer to contacts
      if (customerName && customerName.trim()) {
        const parts = customerName.trim().split(/\s+/);
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ') || '';
        // Check if customer already exists by phone or name
        const { data: existing } = await supabase.from('customers').select('id').or(`phone.eq.${customerPhone || ''},and(first_name.eq.${firstName},last_name.eq.${lastName})`).limit(1);
        if (!existing || existing.length === 0) {
          await supabase.from('customers').insert({
            first_name: firstName,
            last_name: lastName,
            phone: customerPhone || '',
            email: customerEmail || '',
          });
        }
      }

      onSaved();
    } catch (e: any) {
      setError(e.message || 'Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-800">
            Rezervă Sezlong #{lounger.number}
            {lounger.label && <span className="font-normal text-slate-500 ml-1">- {lounger.label}</span>}
          </h3>
          <p className="text-sm text-slate-500">{date}</p>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ora început</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ora sfârșit</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nume client</label>
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" placeholder="Opțional" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Telefon client</label>
            <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" placeholder="Opțional" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email client</label>
            <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" placeholder="Opțional" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Observații <Lock className="inline h-3 w-3 text-slate-400" /></label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" placeholder="Doar adminul vede" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Anulează</button>
          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50">
            {saving ? 'Se salvează...' : 'Rezervă'}
          </button>
        </div>
      </div>
    </div>
  );
}
