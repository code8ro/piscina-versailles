-- Allow anon to read admin_credentials (needed for login validation)
CREATE POLICY "read_admin_credentials" ON admin_credentials FOR SELECT TO anon USING (true);

-- Allow anon to insert reservations (for public booking in the future)
CREATE POLICY "insert_reservations" ON reservations FOR INSERT TO anon WITH CHECK (true);

-- Allow anon to update reservations (for public booking modifications)
CREATE POLICY "update_reservations" ON reservations FOR UPDATE TO anon USING (true) WITH CHECK (true);
