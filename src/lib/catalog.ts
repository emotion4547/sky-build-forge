import { Building, Building2, Car, Factory, Heart, LucideIcon, Store, Warehouse, Wheat } from "lucide-react";

export interface ProductMetric {
  label: string;
  value: string;
}

export interface ProductSection {
  title: string;
  body: string;
  items: string[];
}

export interface CatalogSection {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string;
  sort_order: number;
  is_published: boolean;
}

export interface CatalogSubcategory {
  id: string;
  section_id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  display_mode: string;
  sort_order: number;
  is_published: boolean;
}

export interface CatalogProduct {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  overview: string | null;
  price_from: number;
  price_to: number;
  icon: string;
  usp: string[];
  hero_metrics: ProductMetric[];
  content_sections: ProductSection[];
  specs_spans: string | null;
  specs_heights: string | null;
  specs_insulation: string | null;
  specs_snow_load: string | null;
  specs_fire_resistance: string | null;
  applications: string[];
  gallery: string[] | null;
  is_published: boolean;
  created_at: string;
  section_id: string | null;
  subcategory_id: string | null;
  sort_order: number;
  catalog_card_title: string | null;
  catalog_card_description: string | null;
}

export const catalogIconMap: Record<string, LucideIcon> = {
  Warehouse,
  Factory,
  Building,
  Store,
  Car,
  Wheat,
  Heart,
  Building2,
};

export const getCatalogIcon = (iconName?: string) => catalogIconMap[iconName || ""] || Building2;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const parseMetrics = (value: unknown): ProductMetric[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!isRecord(item)) return null;
      return {
        label: typeof item.label === "string" ? item.label : "",
        value: typeof item.value === "string" ? item.value : "",
      };
    })
    .filter((item): item is ProductMetric => Boolean(item && item.label && item.value));
};

export const parseSections = (value: unknown): ProductSection[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!isRecord(item)) return null;
      return {
        title: typeof item.title === "string" ? item.title : "",
        body: typeof item.body === "string" ? item.body : "",
        items: Array.isArray(item.items)
          ? item.items.filter((listItem): listItem is string => typeof listItem === "string")
          : [],
      };
    })
    .filter((item): item is ProductSection => Boolean(item && (item.title || item.body || item.items.length > 0)));
};

export const normalizeProduct = (product: any): CatalogProduct => ({
  ...product,
  overview: product.overview ?? "",
  usp: Array.isArray(product.usp) ? product.usp.filter((item: unknown): item is string => typeof item === "string") : [],
  applications: Array.isArray(product.applications)
    ? product.applications.filter((item: unknown): item is string => typeof item === "string")
    : [],
  gallery: Array.isArray(product.gallery)
    ? product.gallery.filter((item: unknown): item is string => typeof item === "string")
    : [],
  hero_metrics: parseMetrics(product.hero_metrics),
  content_sections: parseSections(product.content_sections),
  sort_order: typeof product.sort_order === "number" ? product.sort_order : 0,
  catalog_card_title: typeof product.catalog_card_title === "string" ? product.catalog_card_title : null,
  catalog_card_description:
    typeof product.catalog_card_description === "string" ? product.catalog_card_description : null,
});

export const formatPrice = (price: number) => new Intl.NumberFormat("ru-RU").format(price);

export const pluralize = (count: number, forms: [string, string, string]) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
};
