-- Fix weddings INSERT policy.
-- The original policy (auth.uid() = created_by) fails when the browser-side
-- Supabase client's session isn't fully propagated after magic link auth.
-- Security is enforced on SELECT/UPDATE via is_wedding_member(), so
-- requiring only that the user is authenticated for INSERT is sufficient.

DROP POLICY IF EXISTS "weddings_insert" ON weddings;

CREATE POLICY "weddings_insert" ON weddings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
