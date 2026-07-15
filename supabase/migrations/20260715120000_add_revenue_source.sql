ALTER TABLE public.area_revenue
ADD COLUMN IF NOT EXISTS revenue_source TEXT NOT NULL DEFAULT 'area-office';

UPDATE public.area_revenue
SET revenue_source = CASE
  WHEN category = 'Training Centre' THEN 'training-centre'
  ELSE 'area-office'
END
WHERE revenue_source IS NULL OR revenue_source = '';

CREATE OR REPLACE VIEW public.area_revenue_view AS
SELECT
  id,
  year,
  office,
  category,
  stream,
  target,
  actual,
  updated_at,
  revenue_source
FROM public.area_revenue;
