import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ScheduleDay, ClosedDay } from '../../lib/types';
import { DAY_NAMES } from '../../lib/types';
import { formatTime } from '../../lib/data';
import { Plus, Trash2, CalendarX } from 'lucide-react';

export function AdminSchedule() {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [closedDays, setClosedDays] = useState<ClosedDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddClosed, setShowAddClosed] = useState(false);
  const [closedDate, setClosedDate] = useState('');
  const [closedReason, setClosedReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: sData }, { data: cData }] = await Promise.all([
      supabase.from('schedule').select('*').order('day_of_week'),
      supabase.from('closed_days').select('*').gte('date', new Date().toISOString().split('T')[0]).order('date'),
    ]);
    setSchedule(sData || []);
    setClosedDays(cData || []);
    setLoading(false);
  };

  const updateScheduleDay = async (id: number, field: string, value: any) => {
    await supabase.from('schedule').update({ [field]: value }).eq('id', id);
    setSchedule((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addClosedDay = async () => {
    if (!closedDate) return;
    await supabase.from('closed_days').insert({ date: closedDate, reason: closedReason || null });
    setShowAddClosed(false);
    setClosedDate('');
    setClosedReason('');
    loadData();
  };

  const deleteClosedDay = async (id: number) => {
    await supabase.from('closed_days').delete().eq('id', id);
    setClosedDays((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) return <div className="py-20 text-center text-slate-400">Se încarcă...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Program & Zile închise</h2>

      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="font-semibold text-slate-800">Program săptămânal</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {schedule.map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-3">
              <span className="w-24 text-sm font-medium text-slate-700">{DAY_NAMES[s.day_of_week]}</span>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={s.is_closed}
                  onChange={(e) => updateScheduleDay(s.id, 'is_closed', e.target.checked)}
                  className="rounded border-slate-300 text-red-500 focus:ring-red-300"
                />
                <span className="text-slate-500">Închis</span>
              </label>
              {!s.is_closed && (
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="time"
                    value={s.open_time}
                    onChange={(e) => updateScheduleDay(s.id, 'open_time', e.target.value)}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-sky-400 focus:outline-none"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="time"
                    value={s.close_time}
                    onChange={(e) => updateScheduleDay(s.id, 'close_time', e.target.value)}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-sky-400 focus:outline-none"
                  />
                </div>
              )}
              {s.is_closed && <span className="ml-auto text-sm text-red-500 font-medium">Închis</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Zile închise (sărbători, mentenanță)</h3>
          <button onClick={() => setShowAddClosed(true)} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition-colors">
            <Plus className="h-4 w-4" /> Adaugă
          </button>
        </div>

        {showAddClosed && (
          <div className="rounded-xl bg-sky-50 border border-sky-200 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={closedDate} onChange={(e) => setClosedDate(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" />
              <input type="text" value={closedReason} onChange={(e) => setClosedReason(e.target.value)} placeholder="Motiv (opțional)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" />
            </div>
            <div className="flex gap-2">
              <button onClick={addClosedDay} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600">Adaugă</button>
              <button onClick={() => setShowAddClosed(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Anulează</button>
            </div>
          </div>
        )}

        {closedDays.length === 0 ? (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 text-center text-slate-400">
            <CalendarX className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Nu sunt zile închise programate
          </div>
        ) : (
          <div className="space-y-2">
            {closedDays.map((cd) => (
              <div key={cd.id} className="rounded-xl bg-white border border-slate-100 shadow-sm p-3 flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-700 text-xs font-bold">
                  {new Date(cd.date).getDate()}
                </span>
                <div className="flex-1">
                  <span className="text-sm font-medium text-slate-800">{cd.date}</span>
                  {cd.reason && <span className="text-sm text-slate-500 ml-2">- {cd.reason}</span>}
                </div>
                <button onClick={() => deleteClosedDay(cd.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
