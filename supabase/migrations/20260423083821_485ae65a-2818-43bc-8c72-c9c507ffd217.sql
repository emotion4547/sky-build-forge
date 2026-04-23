CREATE TABLE IF NOT EXISTS public.catalog_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image text,
  icon text NOT NULL DEFAULT 'Building2',
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.catalog_sections ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'catalog_sections' AND policyname = 'Admins can manage catalog sections'
  ) THEN
    CREATE POLICY "Admins can manage catalog sections"
    ON public.catalog_sections
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'catalog_sections' AND policyname = 'Anyone can view published catalog sections'
  ) THEN
    CREATE POLICY "Anyone can view published catalog sections"
    ON public.catalog_sections
    FOR SELECT
    USING (is_published = true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.catalog_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.catalog_sections(id) ON DELETE RESTRICT,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image text,
  display_mode text NOT NULL DEFAULT 'hybrid',
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.catalog_subcategories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'catalog_subcategories' AND policyname = 'Admins can manage catalog subcategories'
  ) THEN
    CREATE POLICY "Admins can manage catalog subcategories"
    ON public.catalog_subcategories
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'catalog_subcategories' AND policyname = 'Anyone can view published catalog subcategories'
  ) THEN
    CREATE POLICY "Anyone can view published catalog subcategories"
    ON public.catalog_subcategories
    FOR SELECT
    USING (
      is_published = true
      AND EXISTS (
        SELECT 1
        FROM public.catalog_sections
        WHERE catalog_sections.id = catalog_subcategories.section_id
          AND catalog_sections.is_published = true
      )
    );
  END IF;
END $$;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS section_id uuid,
  ADD COLUMN IF NOT EXISTS subcategory_id uuid,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS catalog_card_title text,
  ADD COLUMN IF NOT EXISTS catalog_card_description text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_section_id_fkey'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_section_id_fkey
      FOREIGN KEY (section_id) REFERENCES public.catalog_sections(id) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_subcategory_id_fkey'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_subcategory_id_fkey
      FOREIGN KEY (subcategory_id) REFERENCES public.catalog_subcategories(id) ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_catalog_sections_sort_order
  ON public.catalog_sections(sort_order, title);
CREATE INDEX IF NOT EXISTS idx_catalog_subcategories_section_sort
  ON public.catalog_subcategories(section_id, sort_order, title);
CREATE INDEX IF NOT EXISTS idx_products_catalog_section
  ON public.products(section_id, subcategory_id, sort_order);

DROP TRIGGER IF EXISTS update_catalog_sections_updated_at ON public.catalog_sections;
CREATE TRIGGER update_catalog_sections_updated_at
BEFORE UPDATE ON public.catalog_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_catalog_subcategories_updated_at ON public.catalog_subcategories;
CREATE TRIGGER update_catalog_subcategories_updated_at
BEFORE UPDATE ON public.catalog_subcategories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();