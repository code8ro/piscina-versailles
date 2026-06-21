import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Lounger } from '../../lib/types';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export function AdminLoungers() {
  const [loungers, setLoungers] = useState<Lounger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');

  useEffect(() => {
    loadLoungers();
  }, []);

  const loadLoungers = async () => {
    setLoading(true);
    const { data } = await supabase.from('loungers').select('*').order('sort_order');
    setLoungers(data || []);
    setLoading(false);
  };

  const addLounger = async () => {
    const num = parseInt(newNumber);
    if (!num || num < 1) return;
    await supabase.from('loungers').insert({ number: num, label: newLabel || null, sort_order: num, is_active: true });
    setShowAdd(false);
    setNewNumber('');
    setNewLabel('');
    loadLoungers();
  };

  const toggleActive = async (l: Lounger) => {
    await supabase.from('loungers').update({ is_active: !l.is_active }).eq('id', l.id);
    loadLoungers();
  };

  const deleteLounger = async (id: number) => {
    if (!confirm('Sigur dorești să ștergi acest sezlong? Rezervările asociate vor fi șterse.')) return;
    await supabase.from('loungers').delete().eq('id', id);
    loadLoungers();
  };

  const startEdit = (l: Lounger) => {
    setEditingId(l.id);
    setEditLabel(l.label || '');
  };

  const saveEdit = async (id: number) => {
    await supabase.from('loungers').update({ label: editLabel || null }).eq('id', id);
    setEditingId(null);
    loadLoungers();
  };

  if (loading) return <div className="py-20 text-center text-slate-400">Se încarcă...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Sezlonguri</h2>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition-colors">
          <Plus className="h-4 w-4" /> Adaugă
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl bg-sky-50 border border-sky-200 p-4 space-y-3">
          <h3 className="font-semibold text-sky-800">Sezlong nou</h3>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={newNumber} onChange={(e) => setNewNumber(e.target.value)} placeholder="Număr" className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" min={1} />
            <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Etichetă (opțional)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" />
          </div>
          <div className="flex gap-2">
            <button onClick={addLounger} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600">Adaugă</button>
            <button onClick={() => setShowAdd(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Anulează</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {loungers.map((l) => (
          <div key={l.id} className={`rounded-xl border bg-white p-3 flex items-center gap-3 shadow-sm transition-all ${l.is_active ? 'border-slate-200' : 'border-slate-100 opacity-50'}`}>
            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${l.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {l.number}
            </span>
            <div className="flex-1">
              {editingId === l.id ? (
                <div className="flex items-center gap-2">
                  <input type="text" value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="rounded border border-slate-300 px-2 py-1 text-sm" placeholder="Etichetă" />
                  <button onClick={() => saveEdit(l.id)} className="p-1 rounded hover:bg-emerald-50 text-emerald-600"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-slate-50 text-slate-400"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <div>
                  <span className="text-sm font-medium text-slate-800">Sezlong #{l.number}</span>
                  {l.label && <span className="text-sm text-slate-500 ml-1">- {l.label}</span>}
                </div>
              )}
              <span className={`text-xs ${l.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                {l.is_active ? 'Activ' : 'Inactiv'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => startEdit(l)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Edit2 className="h-4 w-4" /></button>
              <button onClick={() => toggleActive(l)} className={`p-2 rounded-lg text-xs font-medium ${l.is_active ? 'hover:bg-red-50 text-red-500' : 'hover:bg-emerald-50 text-emerald-500'}`}>
                {l.is_active ? 'Dezactivează' : 'Activează'}
              </button>
              <button onClick={() => deleteLounger(l.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
