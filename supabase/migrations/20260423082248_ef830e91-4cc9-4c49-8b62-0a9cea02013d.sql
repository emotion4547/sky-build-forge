ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS overview text,
ADD COLUMN IF NOT EXISTS hero_metrics jsonb NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS content_sections jsonb NOT NULL DEFAULT '[]'::jsonb;

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();