-- =============================================
-- POOL LOUNGE - Setup SQL pentru Supabase
-- Rulează tot acest script o singură dată în:
--   Supabase Dashboard → SQL Editor → New Query
-- =============================================

-- Loungers (sezlonguri)
CREATE TABLE loungers (
  id SERIAL PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE,
  label TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Program săptămânal
CREATE TABLE schedule (
  id SERIAL PRIMARY KEY,
  day_of_week SMALLINT NOT NULL UNIQUE,
  open_time TIME NOT NULL DEFAULT '09:00',
  close_time TIME NOT NULL DEFAULT '18:00',
  is_closed BOOLEAN DEFAULT false
);

-- Zile închise (sărbători, mentenanță)
CREATE TABLE closed_days (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  reason TEXT
);

-- Rezervări
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  lounger_id INTEGER NOT NULL REFERENCES loungers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Date de contact (un singur rând)
CREATE TABLE contact_info (
  id SERIAL PRIMARY KEY CHECK (id = 1),
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  facebook_url TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  tiktok_url TEXT DEFAULT '',
  whatsapp_number TEXT DEFAULT ''
);

-- Credențiale admin
CREATE TABLE admin_credentials (
  id SERIAL PRIMARY KEY CHECK (id = 1),
  username TEXT NOT NULL DEFAULT 'admin@admin.ro',
  password_hash TEXT NOT NULL DEFAULT '1234'
);

-- Clienți (contacte salvate automat)
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Date implicite
-- =============================================

INSERT INTO contact_info (id, phone, email, address, facebook_url, instagram_url, tiktok_url, whatsapp_number)
VALUES (1, '', '', '', '', '', '', '');

INSERT INTO loungers (number, sort_order)
SELECT n, n FROM generate_series(1, 20) AS n;

INSERT INTO schedule (day_of_week, open_time, close_time, is_closed) VALUES
  (0, '09:00', '18:00', false),
  (1, '09:00', '18:00', false),
  (2, '09:00', '18:00', false),
  (3, '09:00', '18:00', false),
  (4, '09:00', '18:00', false),
  (5, '09:00', '18:00', false),
  (6, '09:00', '18:00', false);

INSERT INTO admin_credentials (id, username, password_hash) VALUES (1, 'admin@admin.ro', '1234');

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE loungers ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE closed_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Toate tabelele sunt accesibile complet rolului anon
-- (Securitatea de admin e gestionată în interfața aplicației)
CREATE POLICY "anon_loungers" ON loungers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_schedule" ON schedule FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_closed_days" ON closed_days FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_reservations" ON reservations FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_contact_info" ON contact_info FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_admin_credentials" ON admin_credentials FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_customers" ON customers FOR ALL TO anon USING (true) WITH CHECK (true);
