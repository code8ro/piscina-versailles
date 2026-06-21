import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import type { Customer } from '../../lib/types';
import { Plus, Trash2, Search, User, Phone, Mail, Edit2, Check, X } from 'lucide-react';

export function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    const { data } = await supabase.from('customers').select('*').order('last_name').order('first_name');
    setCustomers(data || []);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase().trim();
    return customers.filter(
      (c) =>
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const addCustomer = async () => {
    if (!newFirst.trim()) return;
    const { error } = await supabase.from('customers').insert({
      first_name: newFirst.trim(),
      last_name: newLast.trim() || '',
      phone: newPhone.trim() || '',
      email: newEmail.trim() || '',
    });
    if (!error) {
      setShowAdd(false);
      setNewFirst('');
      setNewLast('');
      setNewPhone('');
      setNewEmail('');
      loadCustomers();
    }
  };

  const deleteCustomer = async (id: number) => {
    if (!confirm('Sigur dorești să ștergi acest contact?')) return;
    await supabase.from('customers').delete().eq('id', id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const startEdit = (c: Customer) => {
    setEditingId(c.id);
    setEditFirst(c.first_name);
    setEditLast(c.last_name);
    setEditPhone(c.phone);
    setEditEmail(c.email);
  };

  const saveEdit = async (id: number) => {
    if (!editFirst.trim()) return;
    await supabase.from('customers').update({
      first_name: editFirst.trim(),
      last_name: editLast.trim() || '',
      phone: editPhone.trim() || '',
      email: editEmail.trim() || '',
    }).eq('id', id);
    setEditingId(null);
    loadCustomers();
  };

  if (loading) return <div className="py-20 text-center text-slate-400">Se încarcă...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-slate-800">Contacte clienți</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition-colors"
        >
          <Plus className="h-4 w-4" /> Adaugă
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Caută după nume, telefon sau email..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
        />
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl bg-sky-50 border border-sky-200 p-4 space-y-3">
          <h3 className="font-semibold text-sky-800">Contact nou</h3>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={newFirst} onChange={(e) => setNewFirst(e.target.value)} placeholder="Prenume *" className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" />
            <input type="text" value={newLast} onChange={(e) => setNewLast(e.target.value)} placeholder="Nume" className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" />
            <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Telefon" className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" />
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email" className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" />
          </div>
          <div className="flex gap-2">
            <button onClick={addCustomer} disabled={!newFirst.trim()} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-40">Adaugă</button>
            <button onClick={() => setShowAdd(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Anulează</button>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 text-center text-slate-400">
          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
          {search ? 'Niciun rezultat pentru căutarea ta' : 'Nu sunt contacte salvate'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-xl bg-white border border-slate-100 shadow-sm p-4">
              {editingId === c.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={editFirst} onChange={(e) => setEditFirst(e.target.value)} placeholder="Prenume *" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-sky-400 focus:outline-none" />
                    <input type="text" value={editLast} onChange={(e) => setEditLast(e.target.value)} placeholder="Nume" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-sky-400 focus:outline-none" />
                    <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Telefon" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-sky-400 focus:outline-none" />
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-sky-400 focus:outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(c.id)} disabled={!editFirst.trim()} className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-600 disabled:opacity-40">
                      <Check className="h-3.5 w-3.5" /> Salvează
                    </button>
                    <button onClick={() => setEditingId(null)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      <X className="h-3.5 w-3.5" /> Anulează
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm font-bold shrink-0">
                    {c.first_name[0]?.toUpperCase()}{c.last_name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800">
                      {c.first_name} {c.last_name}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500">
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 hover:text-sky-600 transition-colors">
                          <Phone className="h-3.5 w-3.5" /> {c.phone}
                        </a>
                      )}
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:text-sky-600 transition-colors">
                          <Mail className="h-3.5 w-3.5" /> {c.email}
                        </a>
                      )}
                    </div>
                    {!c.phone && !c.email && (
                      <div className="text-sm text-slate-400 mt-0.5">Fără contacte adăugate</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(c)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteCustomer(c.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {search && filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-center">
          {filtered.length} din {customers.length} contacte
        </p>
      )}
    </div>
  );
}
