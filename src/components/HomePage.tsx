import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Lounger, Reservation, ScheduleDay, ClosedDay, ContactInfo } from '../lib/types';
import { fetchLoungers, fetchSchedule, fetchContactInfo, formatTime } from '../lib/data';
import { LoungerGrid } from './LoungerGrid';
import { ContactBar } from './ContactBar';
import { Footer } from './Footer';
import { Waves, Shield, ChevronLeft, ChevronRight, Clock, X, User, Phone, FileText } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { DAY_NAMES } from '../lib/types';

export function HomePage() {
  const { isAdmin } = useAuth();
  const [loungers, setLoungers] = useState<Lounger[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [closedDays, setClosedDays] = useState<ClosedDay[]>([]);
  const [contact, setContact] = useState<ContactInfo | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedLounger, setSelectedLounger] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadDateData();
  }, [selectedDate]);

  const loadInitialData = async () => {
    try {
      const [lData, sData, cData] = await Promise.all([
        fetchLoungers(),
        fetchSchedule(),
        fetchContactInfo(),
      ]);
      setLoungers(lData);
      setSchedule(sData);
      setContact(cData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadDateData = async () => {
    try {
      const [{ data: rData }, { data: cdData }] = await Promise.all([
        supabase.from('reservations').select('*').eq('date', selectedDate),
        supabase.from('closed_days').select('*').gte('date', selectedDate).lte('date', selectedDate),
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
    if (!selectedDate) return null;
    const d = new Date(selectedDate);
    return scheduleMap.get(d.getDay());
  }, [selectedDate, scheduleMap]);

  const isClosedDay = useMemo(() => {
    if (!selectedDate) return false;
    return closedDays.some((cd) => cd.date === selectedDate) || (selectedDaySchedule?.is_closed ?? false);
  }, [selectedDate, closedDays, selectedDaySchedule]);

  const navigateDate = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
    setSelectedLounger(null);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedLounger(null);
  };

  const handleSelectLounger = (id: number) => {
    setSelectedLounger(id === selectedLounger ? null : id);
    setModalOpen(true);
  };

  const d = new Date(selectedDate);
  const dateLabel = `${d.getDate()} ${['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} ${d.getFullYear()}`;
  const dayName = DAY_NAMES[d.getDay()];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-cyan-50">
        <div className="text-center">
          <Waves className="h-12 w-12 text-sky-500 mx-auto animate-pulse" />
          <p className="mt-3 text-slate-500">Se încarcă...</p>
        </div>
      </div>
    );
  }

  const activeLoungers = loungers.filter((l) => l.is_active);
  const dateReservations = reservations.filter((r) => r.date === selectedDate);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-sky-50 via-white to-cyan-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 shadow-lg shadow-sky-200">
                <Waves className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Pool Lounge</h1>
                <p className="text-xs text-slate-500">Rezervare sezlonguri</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ContactBar contact={contact} />
              {isAdmin ? (
                <a href="#/admin" className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-600 transition-colors shadow-sm">
                  <Shield className="h-3.5 w-3.5" /> Admin
                </a>
              ) : (
                <a href="#/admin" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors">
                  <Shield className="h-3.5 w-3.5" /> Admin
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-5xl px-4 py-6 space-y-5 flex-1">
        {/* Date navigator */}
        <div className="flex items-center justify-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm border border-slate-100">
          <button onClick={() => navigateDate(-1)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div className="text-center min-w-[200px]">
            <div className="text-xl font-bold text-slate-800">{dayName}</div>
            <div className="text-sm text-slate-500">{dateLabel}</div>
            {!isClosedDay && selectedDaySchedule && (
              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mt-1">
                <Clock className="h-3 w-3" />
                {formatTime(selectedDaySchedule.open_time)} - {formatTime(selectedDaySchedule.close_time)}
              </div>
            )}
          </div>
          <button onClick={() => navigateDate(1)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </button>
          <button onClick={goToToday} className="text-xs text-sky-500 hover:underline font-medium ml-2">Azi</button>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Liber</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" /> Rezervat</span>
        </div>

        {/* Lounger grid */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          {isClosedDay ? (
            <div className="rounded-xl bg-red-50 border border-red-200 p-8 text-center">
              <p className="text-red-600 font-medium text-lg">Piscina este inchisă în această zi</p>
            </div>
          ) : (
            <LoungerGrid
              loungers={loungers}
              reservations={reservations}
              date={selectedDate}
              selectedLounger={selectedLounger}
              onSelectLounger={handleSelectLounger}
            />
          )}
        </div>

        {/* Social links */}
        {contact && (contact.facebook_url || contact.instagram_url || contact.tiktok_url) && (
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Urmărește-ne</h3>
            <div className="flex gap-3">
              {contact.facebook_url && (
                <a href={contact.facebook_url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors">Facebook</a>
              )}
              {contact.instagram_url && (
                <a href={contact.instagram_url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-pink-100 hover:text-pink-700 transition-colors">Instagram</a>
              )}
              {contact.tiktok_url && (
                <a href={contact.tiktok_url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors">TikTok</a>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Lounger detail modal */}
      {modalOpen && selectedLounger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const lounger = loungers.find((l) => l.id === selectedLounger);
              if (!lounger) return null;
              const loungerRes = dateReservations.filter((r) => r.lounger_id === lounger.id);
              const isReserved = loungerRes.length > 0;

              return (
                <>
                  <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">
                        Sezlong #{lounger.number}
                        {lounger.label && <span className="font-normal text-slate-500 ml-1">- {lounger.label}</span>}
                      </h2>
                      <p className="text-sm text-slate-500">{dayName}, {dateLabel}</p>
                    </div>
                    <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                      <X className="h-5 w-5 text-slate-400" />
                    </button>
                  </div>
                  <div className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${isReserved ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      <span className={`h-2 w-2 rounded-full ${isReserved ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      {isReserved ? 'Rezervat' : 'Liber'}
                    </span>
                    {loungerRes.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {loungerRes.map((res) => (
                          <div key={res.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                            <div className="flex items-center gap-1 text-slate-600">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTime(res.start_time)} - {formatTime(res.end_time)}
                            </div>
                            {isAdmin && res.customer_name && (
                              <div className="flex items-center gap-1 text-slate-500 mt-1">
                                <User className="h-3.5 w-3.5" />
                                {res.customer_name}
                              </div>
                            )}
                            {isAdmin && res.customer_phone && (
                              <a href={`tel:${res.customer_phone}`} className="flex items-center gap-1 text-sky-600 mt-0.5 hover:underline">
                                <Phone className="h-3.5 w-3.5" />
                                {res.customer_phone}
                              </a>
                            )}
                            {isAdmin && res.notes && (
                              <div className="flex items-start gap-1 text-slate-400 mt-0.5">
                                <FileText className="h-3.5 w-3.5 mt-0.5" />
                                {res.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
