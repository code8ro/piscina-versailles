import type { Lounger, Reservation, ScheduleDay } from '../lib/types';
import { X, Clock, User, Phone, FileText } from 'lucide-react';
import { formatTime } from '../lib/data';
import { DAY_NAMES } from '../lib/types';
import { useAuth } from '../lib/auth';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  loungers: Lounger[];
  reservations: Reservation[];
  schedule: ScheduleDay[];
  closedDays: { date: string; reason?: string | null }[];
}

export function DayDetailModal({ isOpen, onClose, date, loungers, reservations, schedule, closedDays }: DayDetailModalProps) {
  const { isAdmin } = useAuth();

  if (!isOpen) return null;

  const d = new Date(date);
  const dow = d.getDay();
  const scheduleDay = schedule.find((s) => s.day_of_week === dow);
  const isClosed = closedDays.some((cd) => cd.date === date) || (scheduleDay?.is_closed ?? false);
  const closedReason = closedDays.find((cd) => cd.date === date)?.reason;

  const dateLabel = `${d.getDate()} ${['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} ${d.getFullYear()}`;
  const dayName = DAY_NAMES[dow];

  const activeLoungers = loungers.filter((l) => l.is_active);
  const dateReservations = reservations.filter((r) => r.date === date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{dayName}, {dateLabel}</h2>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <Clock className="h-3 w-3" />
              {isClosed ? 'INCHIS' : `${formatTime(scheduleDay?.open_time ?? '09:00')} - ${formatTime(scheduleDay?.close_time ?? '18:00')}`}
            </div>
            {closedReason && <p className="text-xs text-red-500 mt-0.5">{closedReason}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3">
          {isClosed ? (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
              <p className="text-red-600 font-medium">Această zi este închisă</p>
              {closedReason && <p className="text-red-500 text-sm mt-1">{closedReason}</p>}
            </div>
          ) : (
            activeLoungers.map((lounger) => {
              const loungerRes = dateReservations.filter((r) => r.lounger_id === lounger.id);
              const hasRes = loungerRes.length > 0;

              return (
                <div key={lounger.id} className={`rounded-xl border p-3 ${hasRes ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">
                      Sezlong #{lounger.number}
                      {lounger.label && <span className="text-slate-500 font-normal ml-1">- {lounger.label}</span>}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${hasRes ? 'bg-red-200 text-red-800' : 'bg-emerald-200 text-emerald-800'}`}>
                      {hasRes ? 'Rezervat' : 'Liber'}
                    </span>
                  </div>
                  {loungerRes.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      {loungerRes.map((res) => (
                        <div key={res.id} className="rounded-lg bg-white/70 px-3 py-2 text-sm">
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
