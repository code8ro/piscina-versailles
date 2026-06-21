export interface Lounger {
  id: number;
  number: number;
  label: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface ScheduleDay {
  id: number;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface ClosedDay {
  id: number;
  date: string;
  reason: string | null;
}

export interface Reservation {
  id: number;
  lounger_id: number;
  date: string;
  start_time: string;
  end_time: string;
  customer_name: string | null;
  customer_phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface ContactInfo {
  id: number;
  phone: string;
  email: string;
  address: string;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  whatsapp_number: string;
}

export interface AdminCredentials {
  id: number;
  username: string;
  password_hash: string;
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  created_at: string;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_NAMES: Record<number, string> = {
  0: 'Duminică',
  1: 'Luni',
  2: 'Marți',
  3: 'Miercuri',
  4: 'Joi',
  5: 'Vineri',
  6: 'Sâmbătă',
};

export const DAY_NAMES_SHORT: Record<number, string> = {
  0: 'Du',
  1: 'Lu',
  2: 'Ma',
  3: 'Mi',
  4: 'Jo',
  5: 'Vi',
  6: 'Sâ',
};
