
-- Roles enum + user_roles
CREATE TYPE public.app_role AS ENUM ('admin', 'viewer');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles self select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles self read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Years
CREATE TABLE public.years (
  year INT PRIMARY KEY,
  label TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.years TO anon, authenticated;
GRANT ALL ON public.years TO service_role, authenticated;
ALTER TABLE public.years ENABLE ROW LEVEL SECURITY;
CREATE POLICY "years public read" ON public.years FOR SELECT USING (true);
CREATE POLICY "years admin write" ON public.years FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- KRA rows
CREATE TABLE public.kra_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL REFERENCES public.years(year) ON DELETE CASCADE,
  kra TEXT NOT NULL,
  subgroup TEXT,
  kpi TEXT NOT NULL,
  target NUMERIC NOT NULL DEFAULT 0,
  actual NUMERIC NOT NULL DEFAULT 0,
  pct NUMERIC NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.kra_rows TO anon, authenticated;
GRANT ALL ON public.kra_rows TO service_role, authenticated;
ALTER TABLE public.kra_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kra public read" ON public.kra_rows FOR SELECT USING (true);
CREATE POLICY "kra admin write" ON public.kra_rows FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER kra_touch BEFORE UPDATE ON public.kra_rows FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Revenue rows (headline)
CREATE TABLE public.revenue_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL REFERENCES public.years(year) ON DELETE CASCADE,
  line TEXT NOT NULL,
  target NUMERIC NOT NULL DEFAULT 0,
  actual NUMERIC NOT NULL DEFAULT 0,
  pct NUMERIC NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.revenue_rows TO anon, authenticated;
GRANT ALL ON public.revenue_rows TO service_role, authenticated;
ALTER TABLE public.revenue_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rev public read" ON public.revenue_rows FOR SELECT USING (true);
CREATE POLICY "rev admin write" ON public.revenue_rows FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Area revenue
CREATE TABLE public.area_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL REFERENCES public.years(year) ON DELETE CASCADE,
  office TEXT NOT NULL,
  category TEXT NOT NULL,
  stream TEXT NOT NULL,
  target NUMERIC NOT NULL DEFAULT 0,
  actual NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.area_revenue TO anon, authenticated;
GRANT ALL ON public.area_revenue TO service_role, authenticated;
ALTER TABLE public.area_revenue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ar public read" ON public.area_revenue FOR SELECT USING (true);
CREATE POLICY "ar admin write" ON public.area_revenue FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Training programmes
CREATE TABLE public.training_programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL REFERENCES public.years(year) ON DELETE CASCADE,
  programme TEXT NOT NULL,
  participants INT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.training_programmes TO anon, authenticated;
GRANT ALL ON public.training_programmes TO service_role, authenticated;
ALTER TABLE public.training_programmes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tp public read" ON public.training_programmes FOR SELECT USING (true);
CREATE POLICY "tp admin write" ON public.training_programmes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Staff school
CREATE TABLE public.staff_school (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL REFERENCES public.years(year) ON DELETE CASCADE,
  exam TEXT NOT NULL,
  students INT NOT NULL DEFAULT 0,
  passed INT NOT NULL DEFAULT 0,
  pct NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.staff_school TO anon, authenticated;
GRANT ALL ON public.staff_school TO service_role, authenticated;
ALTER TABLE public.staff_school ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ss public read" ON public.staff_school FOR SELECT USING (true);
CREATE POLICY "ss admin write" ON public.staff_school FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- HR metrics
CREATE TABLE public.hr_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL REFERENCES public.years(year) ON DELETE CASCADE,
  item TEXT NOT NULL,
  value INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hr_metrics TO anon, authenticated;
GRANT ALL ON public.hr_metrics TO service_role, authenticated;
ALTER TABLE public.hr_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hr public read" ON public.hr_metrics FOR SELECT USING (true);
CREATE POLICY "hr admin write" ON public.hr_metrics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Challenges & Way Forward
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL REFERENCES public.years(year) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
GRANT SELECT ON public.challenges TO anon, authenticated;
GRANT ALL ON public.challenges TO service_role, authenticated;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ch public read" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "ch admin write" ON public.challenges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.way_forward (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL REFERENCES public.years(year) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
GRANT SELECT ON public.way_forward TO anon, authenticated;
GRANT ALL ON public.way_forward TO service_role, authenticated;
ALTER TABLE public.way_forward ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wf public read" ON public.way_forward FOR SELECT USING (true);
CREATE POLICY "wf admin write" ON public.way_forward FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Seed years
INSERT INTO public.years (year, label) VALUES (2023, '2023 Corporate Scorecard'), (2024, '2024 Corporate Scorecard');
