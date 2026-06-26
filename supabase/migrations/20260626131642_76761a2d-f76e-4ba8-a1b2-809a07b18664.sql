ALTER TABLE public.moments
ADD COLUMN IF NOT EXISTS still_one_path text,
ADD COLUMN IF NOT EXISTS still_two_path text;