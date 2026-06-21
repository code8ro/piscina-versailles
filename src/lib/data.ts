import { supabase } from './supabase';
import type { Lounger, ScheduleDay, ClosedDay, Reservation, ContactInfo } from './types';

export async function fetchLoungers(): Promise<Lounger[]> {
  const { data, error } = await supabase.from('loungers').select('*').order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function fetchSchedule(): Promise<ScheduleDay[]> {
  const { data, error } = await supabase.from('schedule').select('*').order('day_of_week');
  if (error) throw error;
  return data || [];
}

export async function fetchClosedDays(yearMonth?: string): Promise<ClosedDay[]> {
  let query = supabase.from('closed_days').select('*').order('date');
  if (yearMonth) {
    const start = `${yearMonth}-01`;
    const [y, m] = yearMonth.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    const end = `${yearMonth}-${lastDay}`;
    query = query.gte('date', start).lte('date', end);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchReservations(date?: string): Promise<Reservation[]> {
  let query = supabase.from('reservations').select('*').order('date');
  if (date) {
    query = query.eq('date', date);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchReservationsRange(startDate: string, endDate: string): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date');
  if (error) throw error;
  return data || [];
}

export async function fetchContactInfo(): Promise<ContactInfo | null> {
  const { data, error } = await supabase.from('contact_info').select('*').eq('id', 1).single();
  if (error) throw error;
  return data;
}

export async function updateContactInfo(info: Partial<ContactInfo>): Promise<void> {
  const { error } = await supabase.from('contact_info').update(info).eq('id', 1);
  if (error) throw error;
}

export async function createReservation(res: Omit<Reservation, 'id' | 'created_at'>): Promise<Reservation> {
  const { data, error } = await supabase.from('reservations').insert(res).select().single();
  if (error) throw error;
  return data;
}

export async function deleteReservation(id: number): Promise<void> {
  const { error } = await supabase.from('reservations').delete().eq('id', id);
  if (error) throw error;
}

export async function updateReservation(id: number, res: Partial<Reservation>): Promise<void> {
  const { error } = await supabase.from('reservations').update(res).eq('id', id);
  if (error) throw error;
}

export async function addLounger(number: number, label?: string): Promise<Lounger> {
  const { data, error } = await supabase.from('loungers').insert({ number, label, sort_order: number }).select().single();
  if (error) throw error;
  return data;
}

export async function updateLounger(id: number, updates: Partial<Lounger>): Promise<void> {
  const { error } = await supabase.from('loungers').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteLounger(id: number): Promise<void> {
  const { error } = await supabase.from('loungers').delete().eq('id', id);
  if (error) throw error;
}

export async function updateScheduleDay(id: number, updates: Partial<ScheduleDay>): Promise<void> {
  const { error } = await supabase.from('schedule').update(updates).eq('id', id);
  if (error) throw error;
}

export async function addClosedDay(date: string, reason?: string): Promise<ClosedDay> {
  const { data, error } = await supabase.from('closed_days').insert({ date, reason }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteClosedDay(id: number): Promise<void> {
  const { error } = await supabase.from('closed_days').delete().eq('id', id);
  if (error) throw error;
}

export function formatTime(time: string): string {
  return time.substring(0, 5);
}

export function isLoungerReservedAtTime(
  reservations: Reservation[],
  loungerId: number,
  date: string,
  startTime: string,
  endTime: string
): Reservation | undefined {
  return reservations.find((r) => {
    if (r.lounger_id !== loungerId || r.date !== date) return false;
    return r.start_time < endTime && r.end_time > startTime;
  });
}

export function getLoungerStatusForDate(
  reservations: Reservation[],
  loungerId: number,
  date: string
): 'free' | 'reserved' {
  const loungerRes = reservations.filter((r) => r.lounger_id === loungerId && r.date === date);
  return loungerRes.length > 0 ? 'reserved' : 'free';
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function generateTimeSlots(openTime: string, closeTime: string, intervalMinutes: number = 30): string[] {
  const slots: string[] = [];
  let current = timeToMinutes(openTime);
  const end = timeToMinutes(closeTime);
  while (current < end) {
    slots.push(minutesToTime(current));
    current += intervalMinutes;
  }
  return slots;
}
