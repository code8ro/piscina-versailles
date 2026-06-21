-- Customers table for auto-saving contacts
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Allow anon full access (admin-only in UI)
CREATE POLICY "anon_customers_all" ON customers FOR ALL TO anon USING (true) WITH CHECK (true);
