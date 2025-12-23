-- Create segment enum for projects
CREATE TYPE public.project_segment AS ENUM ('промышленность', 'логистика', 'агро', 'B2G', 'торговля', 'авто');

-- Create article category enum
CREATE TYPE public.article_category AS ENUM ('новости', 'технологии', 'закупки');

-- Create projects table
CREATE TABLE public.projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    region TEXT NOT NULL,
    segment project_segment NOT NULL,
    product_type TEXT NOT NULL,
    area NUMERIC NOT NULL,
    span NUMERIC NOT NULL,
    height NUMERIC NOT NULL,
    term_weeks INTEGER NOT NULL,
    budget_min NUMERIC NOT NULL,
    budget_max NUMERIC NOT NULL,
    problem TEXT NOT NULL,
    solution TEXT NOT NULL,
    result TEXT NOT NULL,
    testimonial_text TEXT,
    testimonial_author TEXT,
    testimonial_position TEXT,
    photos TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    year INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    price_from NUMERIC NOT NULL,
    price_to NUMERIC NOT NULL,
    icon TEXT NOT NULL,
    usp TEXT[] DEFAULT '{}',
    specs_spans TEXT,
    specs_heights TEXT,
    specs_insulation TEXT,
    specs_snow_load TEXT,
    specs_fire_resistance TEXT,
    applications TEXT[] DEFAULT '{}',
    steps JSONB DEFAULT '[]',
    faq JSONB DEFAULT '[]',
    gallery TEXT[] DEFAULT '{}',
    related_projects TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create articles table
CREATE TABLE public.articles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    lead TEXT NOT NULL,
    body TEXT NOT NULL,
    category article_category NOT NULL,
    cover TEXT NOT NULL DEFAULT '/placeholder.svg',
    author TEXT NOT NULL,
    read_time INTEGER NOT NULL DEFAULT 5,
    tags TEXT[] DEFAULT '{}',
    published_at DATE NOT NULL DEFAULT CURRENT_DATE,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public read access (for website visitors)
CREATE POLICY "Anyone can view published projects"
ON public.projects FOR SELECT
USING (is_published = true);

CREATE POLICY "Anyone can view published products"
ON public.products FOR SELECT
USING (is_published = true);

CREATE POLICY "Anyone can view published articles"
ON public.articles FOR SELECT
USING (is_published = true);

-- Admin full access
CREATE POLICY "Admins can manage projects"
ON public.projects FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage articles"
ON public.articles FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add update triggers
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();