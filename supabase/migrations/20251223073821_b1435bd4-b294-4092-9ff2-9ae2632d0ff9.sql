-- Create table for calculator configurations
CREATE TABLE public.calculator_configs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  building_type text NOT NULL,
  base_price_min numeric NOT NULL DEFAULT 0,
  base_price_max numeric NOT NULL DEFAULT 0,
  duration_min_weeks integer NOT NULL DEFAULT 8,
  duration_max_weeks integer NOT NULL DEFAULT 16,
  notes text,
  is_published boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for calculator options
CREATE TABLE public.calculator_options (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id uuid NOT NULL REFERENCES public.calculator_configs(id) ON DELETE CASCADE,
  name text NOT NULL,
  add_price_min numeric NOT NULL DEFAULT 0,
  add_price_max numeric NOT NULL DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for region modifiers
CREATE TABLE public.calculator_regions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region text NOT NULL UNIQUE,
  coefficient numeric NOT NULL DEFAULT 1.0,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calculator_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculator_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculator_regions ENABLE ROW LEVEL SECURITY;

-- Policies for calculator_configs
CREATE POLICY "Anyone can view published calculator configs"
ON public.calculator_configs FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage calculator configs"
ON public.calculator_configs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policies for calculator_options
CREATE POLICY "Anyone can view calculator options"
ON public.calculator_options FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.calculator_configs 
    WHERE id = calculator_options.config_id 
    AND is_published = true
  )
);

CREATE POLICY "Admins can manage calculator options"
ON public.calculator_options FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policies for calculator_regions
CREATE POLICY "Anyone can view calculator regions"
ON public.calculator_regions FOR SELECT
USING (true);

CREATE POLICY "Admins can manage calculator regions"
ON public.calculator_regions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_calculator_configs_updated_at
BEFORE UPDATE ON public.calculator_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_calculator_configs_slug ON public.calculator_configs(slug);
CREATE INDEX idx_calculator_options_config_id ON public.calculator_options(config_id);