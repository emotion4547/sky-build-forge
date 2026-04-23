import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CatalogSection, CatalogSubcategory, CatalogProduct, getCatalogIcon, normalizeProduct, pluralize } from "@/lib/catalog";

export function BuildingTypesSection() {
  const [sections, setSections] = useState<CatalogSection[]>([]);
  const [subcategories, setSubcategories] = useState<CatalogSubcategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);

  useEffect(() => {
    const fetchCatalog = async () => {
      const [sectionsResponse, subcategoriesResponse, productsResponse] = await Promise.all([
        supabase
          .from("catalog_sections" as any)
          .select("*")
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("title", { ascending: true }),
        supabase
          .from("catalog_subcategories" as any)
          .select("*")
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("title", { ascending: true }),
        supabase
          .from("products")
          .select("*")
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),
      ]);

      setSections(((sectionsResponse.data as unknown) as CatalogSection[]) || []);
      setSubcategories(((subcategoriesResponse.data as unknown) as CatalogSubcategory[]) || []);
      setProducts((productsResponse.data || []).map(normalizeProduct));
    };

    fetchCatalog();
  }, []);

  const counts = useMemo(() => {
    return sections.reduce<Record<string, { subcategories: number; products: number }>>((acc, section) => {
      const sectionSubcategories = subcategories.filter((subcategory) => subcategory.section_id === section.id);
      const sectionProducts = products.filter((product) => product.section_id === section.id);
      acc[section.id] = {
        subcategories: sectionSubcategories.length,
        products: sectionProducts.length,
      };
      return acc;
    }, {});
  }, [sections, subcategories, products]);

  return (
    <section id="products" className="py-16 md:py-20 lg:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Каталог продукции
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-foreground mb-4">
            Разделы каталога
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Подберите направление и перейдите в нужный раздел каталога с готовыми типами быстровозводимых зданий
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {sections.map((section, index) => {
            const IconComponent = getCatalogIcon(section.icon);
            const image = section.image || products.find((product) => product.section_id === section.id)?.gallery?.[0] || "/placeholder.svg";
            const sectionCounts = counts[section.id] || { subcategories: 0, products: 0 };

            return (
              <Link
                key={section.id}
                to={`/products/section/${section.slug}`}
                className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="aspect-[4/3] overflow-hidden bg-secondary">
                  <img
                    src={image}
                    alt={section.title}
                    className="w-full h-full object-cover transition-all duration-500 blur-[2px] group-hover:blur-0 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-background/20 transition-opacity duration-300 group-hover:opacity-65 opacity-95" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 transition-all duration-300 group-hover:bg-black/70 group-hover:backdrop-blur-sm rounded-b-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/90 backdrop-blur-sm flex items-center justify-center shrink-0">
                      <IconComponent className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground transition-colors duration-300 group-hover:text-primary-foreground">
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2 transition-colors duration-300 group-hover:text-primary-foreground/90">
                    {section.description}
                  </p>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-primary transition-colors duration-300 group-hover:text-primary-foreground">
                      {sectionCounts.subcategories} {pluralize(sectionCounts.subcategories, ["подкатегория", "подкатегории", "подкатегорий"])}
                    </span>
                    <span className="flex items-center text-muted-foreground group-hover:text-primary-foreground transition-colors">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
