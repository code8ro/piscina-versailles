-- Drop existing restrictive policies and replace with permissive ones for this simple app
-- The admin auth is handled at the app level, not Supabase Auth level

-- Drop old policies
DROP POLICY IF EXISTS "admin_loungers" ON loungers;
DROP POLICY IF EXISTS "admin_schedule" ON schedule;
DROP POLICY IF EXISTS "admin_closed_days" ON closed_days;
DROP POLICY IF EXISTS "admin_reservations" ON reservations;
DROP POLICY IF EXISTS "admin_contact_info" ON contact_info;
DROP POLICY IF EXISTS "admin_admin_credentials" ON admin_credentials;

-- Allow anon full access to all tables (admin operations)
CREATE POLICY "anon_loungers" ON loungers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_schedule" ON schedule FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_closed_days" ON closed_days FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_reservations_all" ON reservations FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_contact_info_all" ON contact_info FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_admin_credentials_all" ON admin_credentials FOR ALL TO anon USING (true) WITH CHECK (true);
