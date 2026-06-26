
CREATE SEQUENCE IF NOT EXISTS public.ripple_number_seq START 1;
GRANT USAGE, SELECT ON SEQUENCE public.ripple_number_seq TO anon, authenticated, service_role;

ALTER TABLE public.moments
  ADD COLUMN IF NOT EXISTS ripple_number integer UNIQUE DEFAULT nextval('public.ripple_number_seq'),
  ADD COLUMN IF NOT EXISTS rarity text NOT NULL DEFAULT 'common',
  ADD COLUMN IF NOT EXISTS genre text,
  ADD COLUMN IF NOT EXISTS mood text,
  ADD COLUMN IF NOT EXISTS visual_language text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS format text;
