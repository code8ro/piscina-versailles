-- Loungers table
CREATE TABLE loungers (
  id SERIAL PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE,
  label TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Schedule / operating hours
CREATE TABLE schedule (
  id SERIAL PRIMARY KEY,
  day_of_week SMALLINT NOT NULL UNIQUE, -- 0=Sun, 1=Mon ... 6=Sat
  open_time TIME NOT NULL DEFAULT '09:00',
  close_time TIME NOT NULL DEFAULT '18:00',
  is_closed BOOLEAN DEFAULT false
);

-- Closed days (holidays, maintenance)
CREATE TABLE closed_days (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  reason TEXT
);

-- Reservations
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

-- Contact info (single row)
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

-- Insert default contact info
INSERT INTO contact_info (id, phone, email, address, facebook_url, instagram_url, tiktok_url, whatsapp_number)
VALUES (1, '', '', '', '', '', '', '');

-- Insert 20 default loungers
INSERT INTO loungers (number, sort_order)
SELECT n, n FROM generate_series(1, 20) AS n;

-- Insert default schedule (Mon-Sun 9-18, all open)
INSERT INTO schedule (day_of_week, open_time, close_time, is_closed) VALUES
  (0, '09:00', '18:00', false),
  (1, '09:00', '18:00', false),
  (2, '09:00', '18:00', false),
  (3, '09:00', '18:00', false),
  (4, '09:00', '18:00', false),
  (5, '09:00', '18:00', false),
  (6, '09:00', '18:00', false);

-- Admin credentials table
CREATE TABLE admin_credentials (
  id SERIAL PRIMARY KEY CHECK (id = 1),
  username TEXT NOT NULL DEFAULT 'admin@admin.ro',
  password_hash TEXT NOT NULL DEFAULT '1234'
);

INSERT INTO admin_credentials (id, username, password_hash) VALUES (1, 'admin@admin.ro', '1234');

-- Enable RLS
ALTER TABLE loungers ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE closed_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Public read policies (anonymous can read loungers, schedule, closed_days, contact_info)
CREATE POLICY "read_loungers" ON loungers FOR SELECT TO anon USING (true);
CREATE POLICY "read_schedule" ON schedule FOR SELECT TO anon USING (true);
CREATE POLICY "read_closed_days" ON closed_days FOR SELECT TO anon USING (true);
CREATE POLICY "read_contact_info" ON contact_info FOR SELECT TO anon USING (true);

-- Authenticated (admin) full access policies
CREATE POLICY "admin_loungers" ON loungers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_schedule" ON schedule FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_closed_days" ON closed_days FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_reservations" ON reservations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_contact_info" ON contact_info FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_admin_credentials" ON admin_credentials FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anonymous can read reservations (to check availability)
CREATE POLICY "read_reservations" ON reservations FOR SELECT TO anon USING (true);
