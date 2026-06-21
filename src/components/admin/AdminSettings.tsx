import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ContactInfo } from '../../lib/types';
import { Save, User, Lock, Phone, Mail, MapPin, Globe, RotateCcw, AlertTriangle, X, Trash2 } from 'lucide-react';

export function AdminSettings() {
  const [tab, setTab] = useState<'credentials' | 'contact' | 'reset'>('credentials');
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: cred } = await supabase.from('admin_credentials').select('*').eq('id', 1).single();
    if (cred) setUsername(cred.username);
    const { data: cData } = await supabase.from('contact_info').select('*').eq('id', 1).single();
    setContact(cData);
    setLoading(false);
  };

  const saveCredentials = async () => {
    setSaving(true);
    setMessage('');
    const { data: cred } = await supabase.from('admin_credentials').select('*').eq('id', 1).single();
    if (!cred) { setMessage('Eroare'); setSaving(false); return; }
    if (currentPassword && currentPassword !== cred.password_hash) {
      setMessage('Parola curentă este incorectă');
      setSaving(false);
      return;
    }
    const updates: any = { username };
    if (newPassword) updates.password_hash = newPassword;
    const { error } = await supabase.from('admin_credentials').update(updates).eq('id', 1);
    if (error) { setMessage('Eroare la salvare'); }
    else { setMessage('Salvat cu succes'); setCurrentPassword(''); setNewPassword(''); }
    setSaving(false);
  };

  const saveContact = async () => {
    if (!contact) return;
    setSaving(true);
    setMessage('');
    const { error } = await supabase.from('contact_info').update({
      phone: contact.phone,
      email: contact.email,
      address: contact.address,
      facebook_url: contact.facebook_url,
      instagram_url: contact.instagram_url,
      tiktok_url: contact.tiktok_url,
      whatsapp_number: contact.whatsapp_number,
    }).eq('id', 1);
    if (error) setMessage('Eroare la salvare');
    else setMessage('Salvat cu succes');
    setSaving(false);
  };

  const handleReset = async () => {
    if (resetConfirmText !== 'RESET') return;
    setResetting(true);

    await Promise.all([
      supabase.from('reservations').delete().neq('id', 0),
      supabase.from('customers').delete().neq('id', 0),
      supabase.from('visitor_stats').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('closed_days').delete().neq('id', 0),
    ]);

    await supabase.from('loungers').delete().neq('id', 0);

    const loungers = Array.from({ length: 20 }, (_, i) => ({
      number: i + 1,
      label: null,
      is_active: true,
      sort_order: i + 1,
    }));
    await supabase.from('loungers').insert(loungers);

    await supabase.from('schedule').update({ open_time: '09:00', close_time: '18:00', is_closed: false }).neq('id', 0);

    await supabase.from('contact_info').update({
      phone: '', email: '', address: '',
      facebook_url: '', instagram_url: '', tiktok_url: '', whatsapp_number: '',
    }).eq('id', 1);

    setResetting(false);
    setResetDone(true);
    setShowResetModal(false);
    setResetConfirmText('');

    setContact(c => c ? { ...c, phone: '', email: '', address: '', facebook_url: '', instagram_url: '', tiktok_url: '', whatsapp_number: '' } : c);
  };

  if (loading) return <div className="py-20 text-center text-slate-400">Se încarcă...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Setări</h2>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setTab('credentials'); setMessage(''); }} className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === 'credentials' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          Cont admin
        </button>
        <button onClick={() => { setTab('contact'); setMessage(''); }} className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === 'contact' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          Date de contact
        </button>
        <button onClick={() => { setTab('reset'); setMessage(''); setResetDone(false); }} className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === 'reset' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}>
          <span className="flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> Reset aplicație</span>
        </button>
      </div>

      {message && (
        <div className={`rounded-xl p-3 text-sm font-medium ${message.includes('Eroare') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
          {message}
        </div>
      )}

      {tab === 'credentials' && (
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6 space-y-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><User className="h-5 w-5 text-slate-500" /> Cont administrator</h3>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email (username)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="email" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Parola curentă</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" placeholder="Introdu parola curentă pentru a modifica" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Parola nouă</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" placeholder="Lăsă gol dacă nu schimbi" />
            </div>
          </div>
          <button onClick={saveCredentials} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 transition-colors">
            <Save className="h-4 w-4" /> {saving ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      )}

      {tab === 'contact' && contact && (
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6 space-y-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Globe className="h-5 w-5 text-slate-500" /> Date de contact (homepage)</h3>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Telefon</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" placeholder="+40 7XX XXX XXX" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Adresă / Locație</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Facebook URL</label>
            <input type="url" value={contact.facebook_url} onChange={(e) => setContact({ ...contact, facebook_url: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Instagram URL</label>
            <input type="url" value={contact.instagram_url} onChange={(e) => setContact({ ...contact, instagram_url: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">TikTok URL</label>
            <input type="url" value={contact.tiktok_url} onChange={(e) => setContact({ ...contact, tiktok_url: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" placeholder="https://tiktok.com/..." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">WhatsApp Number</label>
            <input type="tel" value={contact.whatsapp_number} onChange={(e) => setContact({ ...contact, whatsapp_number: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" placeholder="+40 7XX XXX XXX" />
          </div>
          <button onClick={saveContact} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 transition-colors">
            <Save className="h-4 w-4" /> {saving ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      )}

      {tab === 'reset' && (
        <div className="rounded-2xl bg-white shadow-sm border border-red-100 p-6 space-y-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-red-100 p-2.5 text-red-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">Reset complet aplicație</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Această acțiune va șterge <strong>permanent</strong> toate datele din aplicație și nu poate fi anulată.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-2">
            <p className="text-sm font-semibold text-red-700">Se vor șterge:</p>
            <ul className="space-y-1.5 text-sm text-red-600">
              {[
                'Toate rezervările',
                'Toți clienții',
                'Toate statisticile vizitatori',
                'Zilele închise (sărbători / mentenanță)',
                'Șezlongurile existente (se recreează 20 implicite)',
                'Programul (se resetează la 09:00 – 18:00)',
                'Datele de contact (se golesc)',
              ].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm text-slate-500 mt-2 pt-2 border-t border-red-200">
              <strong>Nu se șterge:</strong> contul de administrator și parola.
            </p>
          </div>

          {resetDone && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm font-medium text-emerald-700">
              Resetarea a fost efectuată cu succes. Aplicația este acum la starea initiala.
            </div>
          )}

          <button
            onClick={() => { setShowResetModal(true); setResetConfirmText(''); }}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Resetează aplicația
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-bold text-slate-800">Confirmare reset</h3>
              </div>
              <button onClick={() => setShowResetModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Ești sigur că vrei să ștergi <strong>toate datele</strong>? Această acțiune este <strong className="text-red-600">ireversibilă</strong>.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Scrie <span className="font-bold text-red-600 font-mono">RESET</span> pentru a confirma
                </label>
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder="RESET"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-mono focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleReset}
                disabled={resetConfirmText !== 'RESET' || resetting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                {resetting ? 'Se resetează...' : 'Confirmă reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
