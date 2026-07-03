
-- Wins/achievements per year & section
CREATE TABLE public.wins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  section text NOT NULL DEFAULT 'general',
  text text NOT NULL,
  tone text NOT NULL DEFAULT 'good',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wins TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wins TO authenticated;
GRANT ALL ON public.wins TO service_role;
ALTER TABLE public.wins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wins public read" ON public.wins FOR SELECT USING (true);
CREATE POLICY "wins admin write" ON public.wins FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER wins_touch BEFORE UPDATE ON public.wins FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Presenter notes / commentary per year & section
CREATE TABLE public.presenter_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  section text NOT NULL,
  title text,
  body text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.presenter_notes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.presenter_notes TO authenticated;
GRANT ALL ON public.presenter_notes TO service_role;
ALTER TABLE public.presenter_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes public read" ON public.presenter_notes FOR SELECT USING (true);
CREATE POLICY "notes admin write" ON public.presenter_notes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER pnotes_touch BEFORE UPDATE ON public.presenter_notes FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
