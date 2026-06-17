CREATE TABLE world_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 50 CHECK (score >= 0 AND score <= 100),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE world_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_health" ON world_health FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_health" ON world_health FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_health" ON world_health FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_health" ON world_health FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
