
CREATE TABLE public.moments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tagline TEXT NOT NULL,
  sentence_one TEXT NOT NULL,
  sentence_two TEXT NOT NULL,
  photo_one_path TEXT NOT NULL,
  photo_two_path TEXT NOT NULL,
  card_image_path TEXT NOT NULL,
  director_notes JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.moments TO anon, authenticated;
GRANT ALL ON public.moments TO service_role;

ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view moments" ON public.moments FOR SELECT USING (true);
CREATE POLICY "Anyone can create moments" ON public.moments FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read moments bucket" ON storage.objects FOR SELECT
  USING (bucket_id = 'moments');
CREATE POLICY "Public write moments bucket" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'moments');
