
CREATE TABLE IF NOT EXISTS visitor_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  page text NOT NULL DEFAULT '/',
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_visitor_stats_created_at ON visitor_stats (created_at);
CREATE INDEX idx_visitor_stats_visitor_id ON visitor_stats (visitor_id);
CREATE INDEX idx_visitor_stats_page ON visitor_stats (page);

ALTER TABLE visitor_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_visitor_stats" ON visitor_stats FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "select_visitor_stats" ON visitor_stats FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "update_visitor_stats" ON visitor_stats FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "delete_visitor_stats" ON visitor_stats FOR DELETE
  TO authenticated USING (true);
