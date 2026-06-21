import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import type { Lounger, Reservation } from '../../lib/types';
import { formatTime } from '../../lib/data';
import { Trash2, Plus, ChevronLeft, ChevronRight, Clock, User, Phone, FileText } from 'lucide-react';
import { DAY_NAMES } from '../../lib/types';

export function AdminReservations() {
  const [loungers, setLoungers] = useState<Lounger[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, [viewDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: lData } = await supabase.from('loungers').select('*').order('sort_order');
      const { data: rData } = await supabase.from('reservations').select('*').eq('date', viewDate).order('start_time');
      setLoungers(lData || []);
      setReservations(rData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const activeLoungers = useMemo(() => loungers.filter((l) => l.is_active), [loungers]);

  const deleteRes = async (id: number) => {
    if (!confirm('Sigur dorești să ștergi această rezervare?')) return;
    await supabase.from('reservations').delete().eq('id', id);
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  const navigateDay = (delta: number) => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + delta);
    setViewDate(d.toISOString().split('T')[0]);
  };

  const d = new Date(viewDate);
  const dateLabel = `${d.getDate()} ${['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} ${d.getFullYear()}`;
  const dayName = DAY_NAMES[d.getDay()];

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">Se încarcă...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Rezervări</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-sky-600"
        >
          <Plus className="h-4 w-4" /> Adaugă rezervare
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 rounded-xl bg-white px-4 py-3 shadow-sm border border-slate-100">
        <button onClick={() => navigateDay(-1)} className="p-1.5 rounded-lg hover:bg-slate-100">
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <span className="font-semibold text-slate-800">{dayName}, {dateLabel}</span>
        <button onClick={() => navigateDay(1)} className="p-1.5 rounded-lg hover:bg-slate-100">
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </button>
        <button onClick={() => setViewDate(new Date().toISOString().split('T')[0])} className="text-xs text-sky-500 hover:underline ml-2">
          Azi
        </button>
      </div>

      {reservations.length === 0 ? (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-8 text-center text-slate-400">
          Nu sunt rezervări pentru această zi
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((res) => {
            const lounger = loungers.find((l) => l.id === res.lounger_id);
            return (
              <div key={res.id} className="rounded-xl bg-white border border-slate-100 shadow-sm p-4 flex items-start gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-sky-100 text-sky-700 text-xs font-bold">
                      {lounger?.number ?? '?'}
                    </span>
                    Sezlong #{lounger?.number ?? '?'}
                    {lounger?.label && <span className="text-slate-400 font-normal">- {lounger.label}</span>}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(res.start_time)} - {formatTime(res.end_time)}
                  </div>
                  {res.customer_name && (
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <User className="h-3.5 w-3.5" />
                      {res.customer_name}
                    </div>
                  )}
                  {res.customer_phone && (
                    <a href={`tel:${res.customer_phone}`} className="flex items-center gap-1 text-sm text-sky-600 hover:underline">
                      <Phone className="h-3.5 w-3.5" />
                      {res.customer_phone}
                    </a>
                  )}
                  {res.notes && (
                    <div className="flex items-start gap-1 text-sm text-slate-400">
                      <FileText className="h-3.5 w-3.5 mt-0.5" />
                      {res.notes}
                    </div>
                  )}
                </div>
                <button onClick={() => deleteRes(res.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <AddReservationModal
          loungers={activeLoungers}
          date={viewDate}
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); loadData(); }}
        />
      )}
    </div>
  );
}

function AddReservationModal({ loungers, date, onClose, onSaved }: {
  loungers: Lounger[];
  date: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loungerId, setLoungerId] = useState(loungers[0]?.id ?? 0);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const { error: e } = await supabase.from('reservations').insert({
        lounger_id: loungerId,
        date,
        start_time: startTime,
        end_time: endTime,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        notes: notes || null,
      });
      if (e) throw e;
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
          <h3 className="text-lg font-bold text-slate-800">Adaugă rezervare</h3>
          <p className="text-sm text-slate-500">{date}</p>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Sezlong</label>
            <select value={loungerId} onChange={(e) => setLoungerId(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100">
              {loungers.map((l) => (
                <option key={l.id} value={l.id}>#{l.number} {l.label ? `- ${l.label}` : ''}</option>
              ))}
            </select>
          </div>
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
            <label className="mb-1 block text-sm font-medium text-slate-700">Observații</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" placeholder="Doar adminul vede acest câmp" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Anulează</button>
          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50">
            {saving ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      </div>
    </div>
  );
}
